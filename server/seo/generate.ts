import fs from 'node:fs';
import path from 'node:path';
import type { Product } from '../../types/product.js';
import { getDetailSections, listProducts } from '../db.js';
import { SITE_NAME } from '../../lib/site.js';
import { absoluteImage, absoluteUrl } from '../../lib/seo-data.js';
import { autoRefreshEnabled, distDir, seoStateDir, siteUrl } from './config.js';
import { adminPage, homePage, productPage } from './meta.js';

const HEAD_START = '<!--seo:head-->';
const HEAD_END = '<!--/seo:head-->';
const NOSCRIPT_START = '<!--seo:noscript-->';
const NOSCRIPT_END = '<!--/seo:noscript-->';

export interface GenerateResult {
  siteUrl: string;
  products: number;
  removed: number;
  sitemap: boolean;
}

function writeFile(file: string, content: string): void {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const temporary = `${file}.tmp-${process.pid}`;
  fs.writeFileSync(temporary, content, 'utf8');
  fs.renameSync(temporary, file);
}

function replaceRegion(
  source: string,
  start: string,
  end: string,
  content: string,
): string {
  const startIndex = source.indexOf(start);
  const endIndex = source.indexOf(end, startIndex + start.length);
  if (startIndex === -1 || endIndex === -1) {
    throw new Error(
      `[seo] Missing marker ${start} / ${end}. Check dist/index.html.`,
    );
  }
  return `${source.slice(0, startIndex + start.length)}\n${content}\n  ${source.slice(endIndex)}`;
}

function renderDocument(template: string, page: { head: string; noscript: string }): string {
  const withHead = replaceRegion(template, HEAD_START, HEAD_END, page.head);
  return replaceRegion(withHead, NOSCRIPT_START, NOSCRIPT_END, page.noscript);
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function lastModified(product: Product): string {
  const date = new Date(product.updatedAt ?? '');
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
}

function sitemapXml(products: Product[], site: string): string {
  const updated = products
    .map((product) => new Date(product.updatedAt ?? '').getTime())
    .filter((value) => Number.isFinite(value));
  const homeLastmod = new Date(
    updated.length > 0 ? Math.max(...updated) : Date.now(),
  ).toISOString();

  const urls: string[] = [
    `  <url>
    <loc>${escapeXml(absoluteUrl('/', site))}</loc>
    <lastmod>${homeLastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>`,
  ];

  for (const product of products) {
    const images = product.images
      .map(
        (image) => `    <image:image>
      <image:loc>${escapeXml(absoluteImage(image.url, site))}</image:loc>
      <image:title>${escapeXml(product.title)}</image:title>
    </image:image>`,
      )
      .join('\n');
    urls.push(`  <url>
    <loc>${escapeXml(absoluteUrl(`/product/${product.id}`, site))}</loc>
    <lastmod>${lastModified(product)}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
${images ? `${images}\n` : ''}  </url>`);
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls.join('\n')}
</urlset>
`;
}

function robotsTxt(site: string): string {
  return `# robots.txt for ${SITE_NAME}
User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/

${site ? `Sitemap: ${absoluteUrl('/sitemap.xml', site)}\n` : ''}`;
}

function readGeneratedIds(file: string): number[] {
  try {
    const parsed = JSON.parse(fs.readFileSync(file, 'utf8')) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (value): value is number => typeof value === 'number' && Number.isInteger(value),
    );
  } catch {
    return [];
  }
}

/**
 * Generate static, crawlable HTML for the home page, every published product
 * and the admin area, plus sitemap.xml / robots.txt.
 *
 * Must run after `vite build`: dist/index.html is used as the template.
 */
export function generateSeo(): GenerateResult {
  const dist = distDir();
  const site = siteUrl();
  const templatePath = path.join(dist, 'index.html');

  if (!fs.existsSync(templatePath)) {
    throw new Error(
      `[seo] ${templatePath} not found. Run "vite build" before generating SEO pages.`,
    );
  }

  const template = fs.readFileSync(templatePath, 'utf8');
  const products = listProducts(false);
  const stateDir = seoStateDir();
  const manifestPath = path.join(stateDir, 'generated-products.json');
  const previousIds = readGeneratedIds(manifestPath);

  writeFile(templatePath, renderDocument(template, homePage(products, site)));

  for (const product of products) {
    const sections = getDetailSections(product.id);
    const html = renderDocument(template, productPage(product, sections, site));
    writeFile(path.join(dist, 'product', String(product.id), 'index.html'), html);
  }

  writeFile(path.join(dist, 'admin', 'index.html'), renderDocument(template, adminPage(site)));
  writeFile(path.join(dist, 'robots.txt'), robotsTxt(site));

  let sitemap = false;
  if (site) {
    writeFile(path.join(dist, 'sitemap.xml'), sitemapXml(products, site));
    sitemap = true;
  } else {
    console.warn(
      '[seo] SITE_URL is not set — skipped sitemap.xml. Set SITE_URL=https://your-domain.com before building for production.',
    );
  }

  const currentIds = new Set(products.map((product) => product.id));
  let removed = 0;
  for (const id of previousIds) {
    if (currentIds.has(id) || !Number.isInteger(id) || id <= 0) continue;
    const directory = path.join(dist, 'product', String(id));
    if (!directory.startsWith(path.join(dist, 'product') + path.sep)) continue;
    fs.rmSync(directory, { recursive: true, force: true });
    removed += 1;
  }

  writeFile(manifestPath, `${JSON.stringify(products.map((product) => product.id), null, 2)}\n`);

  console.log(
    `[seo] Generated home, ${products.length} product page(s), admin and robots.txt${sitemap ? ', sitemap.xml' : ''}${removed ? `, removed ${removed} stale page(s)` : ''}.`,
  );

  return { siteUrl: site, products: products.length, removed, sitemap };
}

let refreshTimer: ReturnType<typeof setTimeout> | null = null;
let refreshing = false;
let refreshQueued = false;

function runRefresh(): void {
  if (refreshing) {
    refreshQueued = true;
    return;
  }
  refreshing = true;
  try {
    generateSeo();
  } catch (error) {
    console.error('[seo] Static page refresh failed:', error);
  } finally {
    refreshing = false;
    if (refreshQueued) {
      refreshQueued = false;
      scheduleSeoRefresh();
    }
  }
}

/** Debounced regeneration used after admin changes and on server startup. */
export function scheduleSeoRefresh(): void {
  if (!autoRefreshEnabled()) return;
  if (refreshTimer) clearTimeout(refreshTimer);
  refreshTimer = setTimeout(() => {
    refreshTimer = null;
    runRefresh();
  }, 1200);
  refreshTimer.unref?.();
}
