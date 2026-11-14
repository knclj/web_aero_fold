import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import {
  createProduct,
  deleteProduct,
  getDetailSections,
  getProduct,
  hasCustomDetail,
  listProducts,
  reorderProducts,
  resetDetailSections,
  saveDetailSections,
  updateProduct,
} from '../db.js';
import { requireAuth } from '../middleware/require-auth.js';
import { cleanupUnusedUploads } from '../lib/upload-files.js';
import {
  SECTION_TYPES,
  type DetailSection,
  type ProductInput,
  type SectionType,
} from '../../types/product.js';

const router = Router();

const MAX_SECTIONS = 30;
const MAX_SECTION_BYTES = 100 * 1024;
const MAX_IMAGES = 12;

function parseProductInput(
  body: unknown,
): { input: ProductInput } | { error: string } {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { error: 'Invalid product payload' };
  }
  const raw = body as Record<string, unknown>;

  const title = typeof raw.title === 'string' ? raw.title.trim() : '';
  if (!title) return { error: 'title is required' };
  if (title.length > 120) return { error: 'title is too long (max 120)' };

  const category =
    typeof raw.category === 'string' ? raw.category.trim() : '';
  if (category.length > 80) return { error: 'category is too long (max 80)' };

  const description =
    typeof raw.description === 'string' ? raw.description : '';
  if (description.length > 5000) {
    return { error: 'description is too long (max 5000)' };
  }

  let priceCents: number | null = null;
  if (raw.priceCents !== null && raw.priceCents !== undefined) {
    if (
      typeof raw.priceCents !== 'number' ||
      !Number.isInteger(raw.priceCents) ||
      raw.priceCents < 0 ||
      raw.priceCents > 100_000_000
    ) {
      return { error: 'priceCents must be a non-negative integer or null' };
    }
    priceCents = raw.priceCents;
  }

  if (raw.images !== undefined && !Array.isArray(raw.images)) {
    return { error: 'images must be an array of URLs' };
  }
  const imageList = Array.isArray(raw.images) ? raw.images : [];
  if (imageList.length > MAX_IMAGES) {
    return { error: `at most ${MAX_IMAGES} images are allowed` };
  }
  const images: string[] = [];
  for (const entry of imageList) {
    if (typeof entry !== 'string' || !entry.trim()) {
      return { error: 'every image must be a non-empty URL string' };
    }
    const url = entry.trim();
    if (url.length > 2000) return { error: 'image URL is too long' };
    if (!images.includes(url)) images.push(url);
  }

  return {
    input: {
      title,
      category,
      description,
      priceCents,
      published: typeof raw.published === 'boolean' ? raw.published : true,
      images,
    },
  };
}

router.use(requireAuth);

function parseProductId(raw: string): number | null {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function parseSections(
  input: unknown,
): { sections: DetailSection[] } | { error: string } {
  if (!Array.isArray(input)) return { error: 'sections must be an array' };
  if (input.length > MAX_SECTIONS) {
    return { error: `at most ${MAX_SECTIONS} sections are allowed` };
  }

  const sections: DetailSection[] = [];
  const usedIds = new Set<string>();

  for (const [index, raw] of input.entries()) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
      return { error: `sections[${index}] must be an object` };
    }
    const item = raw as Record<string, unknown>;
    const type = item.type;
    if (typeof type !== 'string' || !SECTION_TYPES.includes(type as SectionType)) {
      return {
        error: `sections[${index}].type must be one of ${SECTION_TYPES.join(', ')}`,
      };
    }
    const content = item.content;
    if (!content || typeof content !== 'object' || Array.isArray(content)) {
      return { error: `sections[${index}].content must be an object` };
    }
    if (JSON.stringify(content).length > MAX_SECTION_BYTES) {
      return { error: `sections[${index}].content is too large` };
    }

    let id =
      typeof item.id === 'string' && item.id.trim() ? item.id.trim() : '';
    if (!id || id.length > 100 || usedIds.has(id)) id = randomUUID();
    usedIds.add(id);

    sections.push({
      id,
      type: type as SectionType,
      content: content as Record<string, unknown>,
    });
  }

  return { sections };
}

router.get('/products', (_req, res) => {
  const products = listProducts(true).map((product) => ({
    ...product,
    isCustomized: hasCustomDetail(product.id),
  }));
  res.json(products);
});

router.post('/products', (req, res) => {
  const parsed = parseProductInput(req.body);
  if ('error' in parsed) {
    res.status(400).json({ error: parsed.error });
    return;
  }
  const product = createProduct(parsed.input);
  res.status(201).json({ product, isCustomized: false });
});

router.put('/products/order', (req, res) => {
  const ids: unknown = req.body?.ids;
  if (!Array.isArray(ids) || ids.length === 0) {
    res.status(400).json({ error: 'ids must be a non-empty array' });
    return;
  }
  if (
    ids.some((id) => !Number.isInteger(id) || (id as number) <= 0) ||
    new Set(ids).size !== ids.length
  ) {
    res.status(400).json({ error: 'ids must be unique positive integers' });
    return;
  }

  const existing = listProducts(true).map((product) => product.id);
  const requested = ids as number[];
  if (
    existing.length !== requested.length ||
    !existing.every((id) => requested.includes(id))
  ) {
    res.status(400).json({ error: 'ids must include every product exactly once' });
    return;
  }

  reorderProducts(requested);
  res.json({ ok: true });
});

router.put('/products/:id', (req, res) => {
  const id = parseProductId(req.params.id);
  if (!id) {
    res.status(400).json({ error: 'Invalid product id' });
    return;
  }
  const parsed = parseProductInput(req.body);
  if ('error' in parsed) {
    res.status(400).json({ error: parsed.error });
    return;
  }
  const result = updateProduct(id, parsed.input);
  if (!result) {
    res.status(404).json({ error: 'Product not found' });
    return;
  }
  void cleanupUnusedUploads(result.removedImages);
  res.json({
    product: result.product,
    isCustomized: hasCustomDetail(id),
    removedImages: result.removedImages,
  });
});

router.delete('/products/:id', (req, res) => {
  const id = parseProductId(req.params.id);
  if (!id) {
    res.status(400).json({ error: 'Invalid product id' });
    return;
  }
  const removed = deleteProduct(id);
  if (!removed) {
    res.status(404).json({ error: 'Product not found' });
    return;
  }
  void cleanupUnusedUploads(removed.images.map((image) => image.url));
  res.json({ ok: true });
});

router.get('/products/:id', (req, res) => {
  const id = parseProductId(req.params.id);
  const product = id ? getProduct(id, true) : null;
  if (!product) {
    res.status(404).json({ error: 'Product not found' });
    return;
  }
  res.json({
    product,
    sections: getDetailSections(product.id),
    isCustomized: hasCustomDetail(product.id),
  });
});

router.put('/products/:id/sections', (req, res) => {
  const id = parseProductId(req.params.id);
  const product = id ? getProduct(id, true) : null;
  if (!product) {
    res.status(404).json({ error: 'Product not found' });
    return;
  }

  const parsed = parseSections(req.body?.sections);
  if ('error' in parsed) {
    res.status(400).json({ error: parsed.error });
    return;
  }

  const sections = saveDetailSections(product.id, parsed.sections);
  res.json({ sections, isCustomized: sections.length > 0 });
});

router.delete('/products/:id/sections', (req, res) => {
  const id = parseProductId(req.params.id);
  const product = id ? getProduct(id, true) : null;
  if (!product) {
    res.status(404).json({ error: 'Product not found' });
    return;
  }

  resetDetailSections(product.id);
  res.json({ sections: [], isCustomized: false });
});

export default router;
