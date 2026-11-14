import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type {
  DetailSection,
  Product,
  ProductImage,
  ProductInput,
  SectionType,
} from '../types/product.js';
import { seedProducts } from './data/seed.js';

const DATA_DIR = fileURLToPath(new URL('./data/', import.meta.url));
export const DB_PATH = process.env.DB_PATH
  ? path.resolve(process.env.DB_PATH)
  : path.join(DATA_DIR, 'webfold.db');

mkdirSync(path.dirname(DB_PATH), { recursive: true });

export const db = new DatabaseSync(DB_PATH);
db.exec('PRAGMA journal_mode = WAL');
db.exec('PRAGMA foreign_keys = ON');
db.exec('PRAGMA busy_timeout = 5000');

interface ProductRow {
  id: number;
  title: string;
  category: string;
  description: string;
  price_cents: number | null;
  published: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

interface ImageRow {
  id: number;
  product_id: number;
  url: string;
  sort_order: number;
}

interface SectionRow {
  id: string;
  product_id: number;
  type: string;
  content: string;
  sort_order: number;
}

function tx<T>(fn: () => T): T {
  db.exec('BEGIN IMMEDIATE');
  try {
    const result = fn();
    db.exec('COMMIT');
    return result;
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}

function insertImages(productId: number, urls: string[]): void {
  const stmt = db.prepare(
    'INSERT INTO product_images (product_id, url, sort_order) VALUES (?, ?, ?)',
  );
  urls.forEach((url, index) => stmt.run(productId, url, index));
}

function hydrate(rows: ProductRow[]): Product[] {
  if (rows.length === 0) return [];

  const placeholders = rows.map(() => '?').join(', ');
  const imageRows = db
    .prepare(
      `SELECT * FROM product_images
       WHERE product_id IN (${placeholders})
       ORDER BY sort_order ASC, id ASC`,
    )
    .all(...rows.map((row) => row.id)) as unknown as ImageRow[];

  const imagesByProduct = new Map<number, ProductImage[]>();
  for (const image of imageRows) {
    const list = imagesByProduct.get(image.product_id) ?? [];
    list.push({ id: image.id, url: image.url });
    imagesByProduct.set(image.product_id, list);
  }

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    category: row.category,
    description: row.description,
    priceCents: row.price_cents,
    published: row.published === 1,
    sortOrder: row.sort_order,
    images: imagesByProduct.get(row.id) ?? [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

function migrate(): void {
  const row = db.prepare('PRAGMA user_version').get() as
    | { user_version: number }
    | undefined;
  const version = row?.user_version ?? 0;

  if (version < 1) {
    db.exec(`
      CREATE TABLE IF NOT EXISTS products (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        title       TEXT    NOT NULL,
        category    TEXT    NOT NULL,
        description TEXT    NOT NULL DEFAULT '',
        price_cents INTEGER,
        published   INTEGER NOT NULL DEFAULT 1,
        sort_order  INTEGER NOT NULL DEFAULT 0,
        created_at  TEXT    NOT NULL,
        updated_at  TEXT    NOT NULL
      );

      CREATE TABLE IF NOT EXISTS product_images (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        url        TEXT    NOT NULL,
        sort_order INTEGER NOT NULL DEFAULT 0
      );

      CREATE INDEX IF NOT EXISTS idx_products_sort
        ON products (sort_order, id);
      CREATE INDEX IF NOT EXISTS idx_product_images_product
        ON product_images (product_id, sort_order);

      PRAGMA user_version = 1;
    `);
  }

  if (version < 2) {
    db.exec(`
      CREATE TABLE IF NOT EXISTS product_detail_sections (
        id         TEXT    PRIMARY KEY,
        product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        type       TEXT    NOT NULL,
        content    TEXT    NOT NULL,
        sort_order INTEGER NOT NULL DEFAULT 0
      );

      CREATE INDEX IF NOT EXISTS idx_detail_sections_product
        ON product_detail_sections (product_id, sort_order);

      PRAGMA user_version = 2;
    `);
  }
}

function seedIfEmpty(): void {
  const row = db.prepare('SELECT COUNT(*) AS count FROM products').get() as
    | { count: number }
    | undefined;
  if ((row?.count ?? 0) > 0) return;

  const now = new Date().toISOString();
  tx(() => {
    const insert = db.prepare(
      `INSERT INTO products
         (title, category, description, price_cents, published, sort_order, created_at, updated_at)
       VALUES (?, ?, ?, ?, 1, ?, ?, ?)`,
    );
    seedProducts().forEach((product, index) => {
      const info = insert.run(
        product.title,
        product.category,
        product.description,
        product.priceCents,
        index,
        now,
        now,
      );
      insertImages(Number(info.lastInsertRowid), [product.image]);
    });
  });
  console.log(`[db] Seeded ${seedProducts().length} products into ${DB_PATH}`);
}

migrate();
seedIfEmpty();

export function listProducts(includeUnpublished = false): Product[] {
  const sql = includeUnpublished
    ? 'SELECT * FROM products ORDER BY sort_order ASC, id ASC'
    : 'SELECT * FROM products WHERE published = 1 ORDER BY sort_order ASC, id ASC';
  const rows = db.prepare(sql).all() as unknown as ProductRow[];
  return hydrate(rows);
}

export function getProduct(
  id: number,
  includeUnpublished = false,
): Product | null {
  const row = db.prepare('SELECT * FROM products WHERE id = ?').get(id) as
    | (ProductRow & Record<string, unknown>)
    | undefined;
  if (!row) return null;
  if (!includeUnpublished && row.published !== 1) return null;
  return hydrate([row])[0] ?? null;
}

export function createProduct(input: ProductInput): Product {
  return tx(() => {
    const now = new Date().toISOString();
    const next = db
      .prepare('SELECT COALESCE(MAX(sort_order), -1) + 1 AS next FROM products')
      .get() as { next: number };
    const info = db
      .prepare(
        `INSERT INTO products
           (title, category, description, price_cents, published, sort_order, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        input.title,
        input.category,
        input.description,
        input.priceCents,
        input.published ? 1 : 0,
        next.next,
        now,
        now,
      );
    const id = Number(info.lastInsertRowid);
    insertImages(id, input.images);
    return getProduct(id, true) as Product;
  });
}

export function updateProduct(
  id: number,
  input: ProductInput,
): { product: Product; removedImages: string[] } | null {
  return tx(() => {
    const existing = getProduct(id, true);
    if (!existing) return null;

    const now = new Date().toISOString();
    db.prepare(
      `UPDATE products
       SET title = ?, category = ?, description = ?, price_cents = ?,
           published = ?, updated_at = ?
       WHERE id = ?`,
    ).run(
      input.title,
      input.category,
      input.description,
      input.priceCents,
      input.published ? 1 : 0,
      now,
      id,
    );

    db.prepare('DELETE FROM product_images WHERE product_id = ?').run(id);
    insertImages(id, input.images);

    const kept = new Set(input.images);
    const removedImages = existing.images
      .map((image) => image.url)
      .filter((url) => !kept.has(url));

    return { product: getProduct(id, true) as Product, removedImages };
  });
}

export function setProductPublished(
  id: number,
  published: boolean,
): Product | null {
  const now = new Date().toISOString();
  const info = db
    .prepare('UPDATE products SET published = ?, updated_at = ? WHERE id = ?')
    .run(published ? 1 : 0, now, id);
  if (info.changes === 0) return null;
  return getProduct(id, true);
}

export function deleteProduct(id: number): Product | null {
  const existing = getProduct(id, true);
  if (!existing) return null;
  db.prepare('DELETE FROM products WHERE id = ?').run(id);
  return existing;
}

export function reorderProducts(ids: number[]): void {
  const now = new Date().toISOString();
  tx(() => {
    const stmt = db.prepare(
      'UPDATE products SET sort_order = ?, updated_at = ? WHERE id = ?',
    );
    ids.forEach((id, index) => stmt.run(index, now, id));
  });
}

/** URLs of every image still referenced by some product. */
export function allImageUrls(): Set<string> {
  const rows = db
    .prepare('SELECT DISTINCT url FROM product_images')
    .all() as unknown as Array<{ url: string }>;
  return new Set(rows.map((row) => row.url));
}

export function imageReferenceCount(url: string): number {
  const row = db
    .prepare('SELECT COUNT(*) AS count FROM product_images WHERE url = ?')
    .get(url) as { count: number } | undefined;
  return row?.count ?? 0;
}

export function hasCustomDetail(productId: number): boolean {
  const row = db
    .prepare(
      'SELECT COUNT(*) AS count FROM product_detail_sections WHERE product_id = ?',
    )
    .get(productId) as { count: number } | undefined;
  return (row?.count ?? 0) > 0;
}

export function getDetailSections(productId: number): DetailSection[] {
  const rows = db
    .prepare(
      `SELECT * FROM product_detail_sections
       WHERE product_id = ?
       ORDER BY sort_order ASC, rowid ASC`,
    )
    .all(productId) as unknown as SectionRow[];

  const sections: DetailSection[] = [];
  for (const row of rows) {
    try {
      const content = JSON.parse(row.content) as Record<string, unknown>;
      sections.push({
        id: row.id,
        type: row.type as SectionType,
        content: content && typeof content === 'object' ? content : {},
      });
    } catch {
      // Skip corrupt rows instead of breaking the whole page.
    }
  }
  return sections;
}

export function saveDetailSections(
  productId: number,
  sections: DetailSection[],
): DetailSection[] {
  tx(() => {
    db.prepare('DELETE FROM product_detail_sections WHERE product_id = ?').run(
      productId,
    );
    const stmt = db.prepare(
      `INSERT INTO product_detail_sections
         (id, product_id, type, content, sort_order)
       VALUES (?, ?, ?, ?, ?)`,
    );
    sections.forEach((section, index) => {
      stmt.run(
        section.id,
        productId,
        section.type,
        JSON.stringify(section.content),
        index,
      );
    });
  });
  return getDetailSections(productId);
}

export function resetDetailSections(productId: number): void {
  db.prepare('DELETE FROM product_detail_sections WHERE product_id = ?').run(
    productId,
  );
}
