import type { DetailSection, Product } from '../../types/product.js';
import {
  DEFAULT_ROBOTS,
  HOME_DESCRIPTION,
  HOME_KEYWORDS,
  HOME_TITLE,
  NOINDEX_ROBOTS,
  SITE_NAME,
} from '../../lib/site.js';
import {
  absoluteImage,
  absoluteUrl,
  breadcrumbJsonLd,
  faqJsonLd,
  homeJsonLd,
  productFaqs,
  productJsonLd,
  productKeywords,
  productMetaDescription,
  productPlainDescription,
  productSeoTitle,
  type JsonLd,
} from '../../lib/seo-data.js';

export interface PageMeta {
  title: string;
  description: string;
  /** null = no canonical (admin/404). */
  canonicalPath?: string | null;
  image?: string;
  imageAlt?: string;
  imageWidth?: number;
  imageHeight?: number;
  type?: 'website' | 'product';
  robots?: string;
  keywords?: string;
  jsonLd?: JsonLd[];
}

export interface RenderedPage {
  head: string;
  noscript: string;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function jsonForHtml(value: JsonLd): string {
  return JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

function metaTag(attribute: 'name' | 'property', key: string, content: string): string {
  return `  <meta ${attribute}="${escapeHtml(key)}" content="${escapeHtml(content)}">`;
}

export function renderHead(meta: PageMeta, siteUrl = ''): string {
  const robots = meta.robots ?? DEFAULT_ROBOTS;
  const image = meta.image ? absoluteImage(meta.image, siteUrl) : '';
  const lines: string[] = [
    `  <title>${escapeHtml(meta.title)}</title>`,
    metaTag('name', 'description', meta.description),
  ];

  if (meta.keywords) lines.push(metaTag('name', 'keywords', meta.keywords));
  lines.push(
    metaTag('name', 'robots', robots),
    metaTag('name', 'author', SITE_NAME),
  );

  if (meta.canonicalPath !== null) {
    const canonical = absoluteUrl(meta.canonicalPath ?? '/', siteUrl);
    lines.push(`  <link rel="canonical" href="${escapeHtml(canonical)}">`);
    if (siteUrl) {
      lines.push(
        `  <link rel="alternate" hreflang="en" href="${escapeHtml(canonical)}">`,
        `  <link rel="alternate" hreflang="x-default" href="${escapeHtml(canonical)}">`,
      );
    }
  }

  const canonicalUrl =
    meta.canonicalPath === null
      ? ''
      : absoluteUrl(meta.canonicalPath ?? '/', siteUrl);
  lines.push(
    metaTag('property', 'og:locale', 'en_US'),
    metaTag('property', 'og:site_name', SITE_NAME),
    metaTag('property', 'og:type', meta.type ?? 'website'),
    metaTag('property', 'og:title', meta.title),
    metaTag('property', 'og:description', meta.description),
  );
  if (canonicalUrl) lines.push(metaTag('property', 'og:url', canonicalUrl));
  if (image) {
    lines.push(metaTag('property', 'og:image', image));
    if (meta.imageWidth) {
      lines.push(metaTag('property', 'og:image:width', String(meta.imageWidth)));
    }
    if (meta.imageHeight) {
      lines.push(metaTag('property', 'og:image:height', String(meta.imageHeight)));
    }
    lines.push(metaTag('property', 'og:image:alt', meta.imageAlt ?? meta.title));
  }
  lines.push(
    metaTag('name', 'twitter:card', 'summary_large_image'),
    metaTag('name', 'twitter:title', meta.title),
    metaTag('name', 'twitter:description', meta.description),
  );
  if (image) lines.push(metaTag('name', 'twitter:image', image));

  for (const entry of meta.jsonLd ?? []) {
    lines.push(
      `  <script type="application/ld+json" data-seo-jsonld>${jsonForHtml(entry)}</script>`,
    );
  }

  return lines.join('\n');
}

export function homePage(products: Product[], siteUrl = ''): RenderedPage {
  const meta: PageMeta = {
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    keywords: HOME_KEYWORDS,
    canonicalPath: '/',
    image: '/og-cover.png',
    imageAlt: 'AERO-FOLD foldable travel bags',
    imageWidth: 1200,
    imageHeight: 630,
    type: 'website',
    robots: DEFAULT_ROBOTS,
    jsonLd: homeJsonLd(products, siteUrl),
  };

  const links = products
    .slice(0, 12)
    .map(
      (product) =>
        `    <li><a href="/product/${product.id}">${escapeHtml(product.title)}</a> — ${escapeHtml(product.category || 'Foldable travel bag')}</li>`,
    )
    .join('\n');

  const noscript = `  <noscript>
    <h1>Foldable travel bags by ${SITE_NAME}</h1>
    <p>${escapeHtml(HOME_DESCRIPTION)}</p>
    <h2>Featured foldable travel bags</h2>
    <ul>
${links}
    </ul>
    <p><a href="/#wholesale">Custom &amp; wholesale travel bags</a> · <a href="/#faq">Travel bag FAQ</a> · <a href="/#contact">Contact AERO-FOLD</a></p>
  </noscript>`;

  return { head: renderHead(meta, siteUrl), noscript };
}

export function productPage(
  product: Product,
  sections: DetailSection[],
  siteUrl = '',
): RenderedPage {
  const description = productPlainDescription(product);
  const faqs = productFaqs(sections);
  const image = product.images[0]?.url || '/og-cover.png';
  const jsonLd: JsonLd[] = [
    productJsonLd(product, siteUrl),
    breadcrumbJsonLd(product, siteUrl),
  ];
  const faqSchema = faqJsonLd(faqs);
  if (faqSchema) jsonLd.push(faqSchema);

  const meta: PageMeta = {
    title: productSeoTitle(product),
    description: productMetaDescription(product),
    keywords: productKeywords(product),
    canonicalPath: `/product/${product.id}`,
    image,
    imageAlt: `${product.title} — foldable travel bag by ${SITE_NAME}`,
    type: 'product',
    robots: DEFAULT_ROBOTS,
    jsonLd,
  };

  const imageTag = product.images[0]
    ? `    <img src="${escapeHtml(absoluteImage(product.images[0].url, siteUrl))}" alt="${escapeHtml(product.title)} — foldable travel bag" width="800" height="1000">`
    : '';

  const noscript = `  <noscript>
    <h1>${escapeHtml(product.title)}</h1>
    <p>${escapeHtml(description)}</p>
${imageTag}
    <p>Reference: ${escapeHtml(`AF-${String(product.id).padStart(3, '0')}`)} · Category: ${escapeHtml(product.category || 'Travel bags')}</p>
    <p><a href="/#gallery">Browse all foldable travel bags</a> · <a href="/#wholesale">Wholesale &amp; custom orders</a></p>
  </noscript>`;

  return { head: renderHead(meta, siteUrl), noscript };
}

export function adminPage(siteUrl = ''): RenderedPage {
  const meta: PageMeta = {
    title: `Admin – ${SITE_NAME}`,
    description: 'Administration area for the AERO-FOLD product catalogue.',
    canonicalPath: null,
    robots: NOINDEX_ROBOTS,
    jsonLd: [],
  };
  return {
    head: renderHead(meta, siteUrl),
    noscript: '  <noscript>\n    <p>The AERO-FOLD admin area requires JavaScript.</p>\n  </noscript>',
  };
}
