import type { DetailSection, Product } from '../types/product';
import { HOME_FAQ, type FaqItem } from './faq';
import {
  HOME_DESCRIPTION,
  HOME_KEYWORDS,
  HOME_TITLE,
  SITE_NAME,
  SITE_PHONE_SCHEMA,
} from './site';

export type JsonLd = Record<string, unknown>;

/** Validate and normalise SITE_URL. Returns '' when unset/invalid. */
export function normalizeSiteUrl(value: string | null | undefined): string {
  const raw = (value ?? '').trim();
  if (!raw) return '';
  try {
    const parsed = new URL(raw);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return '';
    return `${parsed.origin}${parsed.pathname}`.replace(/\/+$/, '');
  } catch {
    return '';
  }
}

export function absoluteUrl(pathname: string, siteUrl = ''): string {
  if (/^https?:\/\//i.test(pathname)) return pathname;
  const path = pathname.startsWith('/') ? pathname : `/${pathname}`;
  if (!siteUrl) return path;
  return `${siteUrl}${path}`;
}

export function absoluteImage(url: string, siteUrl = ''): string {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  return absoluteUrl(url, siteUrl);
}

export function productSku(product: Product): string {
  return `AF-${String(product.id).padStart(3, '0')}`;
}

export function productPlainDescription(product: Product): string {
  const custom = (product.description ?? '').replace(/\s+/g, ' ').trim();
  if (custom) return custom;
  const collection = product.category
    ? `the AERO-FOLD ${product.category} collection`
    : 'AERO-FOLD';
  return `${product.title} is a foldable travel bag from ${collection}. It packs flat for storage and opens into a lightweight carry bag for weekend trips, carry-on travel and everyday use. Custom colors, logos and wholesale pricing are available.`;
}

export function truncateText(value: string, maxLength: number): string {
  const text = value.replace(/\s+/g, ' ').trim();
  if (text.length <= maxLength) return text;
  const cut = text.slice(0, maxLength - 1);
  const lastSpace = cut.lastIndexOf(' ');
  const body = lastSpace > maxLength * 0.6 ? cut.slice(0, lastSpace) : cut;
  return `${body.trimEnd()}…`;
}

export function productMetaDescription(product: Product): string {
  // Lead with the unique product title so 30+ catalogue pages do not share the
  // same opening sentence in search results.
  return truncateText(
    `${product.title} — foldable travel bag by AERO-FOLD. Packs flat, opens fast. Custom and wholesale available.`,
    158,
  );
}

export function productSeoTitle(product: Product): string {
  const suffix = ' | AERO-FOLD';
  const keyword = ' | Foldable Travel Bag';
  const full = `${product.title}${keyword}${suffix}`;
  if (full.length <= 66) return full;

  const withBrand = `${product.title}${suffix}`;
  if (withBrand.length <= 66) return withBrand;

  // The catalogue title already contains the primary keyword; keep it intact
  // instead of producing an ellipsis-heavy title.
  return truncateText(product.title, 66);
}

export function productKeywords(product: Product): string {
  return [
    product.title,
    'foldable travel bag',
    product.category ? `${product.category} travel bag` : '',
    'packable bag',
    SITE_NAME,
  ]
    .filter(Boolean)
    .join(', ');
}

export function productFaqs(sections: DetailSection[]): FaqItem[] {
  const faqs: FaqItem[] = [];
  for (const section of sections) {
    if (section.type !== 'faq') continue;
    const items = section.content.items;
    if (!Array.isArray(items)) continue;
    for (const item of items) {
      if (!item || typeof item !== 'object' || Array.isArray(item)) continue;
      const record = item as Record<string, unknown>;
      const question =
        typeof record.question === 'string' ? record.question.trim() : '';
      const answer =
        typeof record.answer === 'string' ? record.answer.trim() : '';
      if (question && answer) faqs.push({ question, answer });
    }
  }
  return faqs;
}

export function organizationJsonLd(siteUrl = ''): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': absoluteUrl('/#organization', siteUrl),
    name: SITE_NAME,
    url: absoluteUrl('/', siteUrl),
    logo: absoluteUrl('/apple-touch-icon.png', siteUrl),
    description:
      'AERO-FOLD designs foldable travel bags, packable duffels and weekender bags for carry-on travel.',
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'sales',
      telephone: SITE_PHONE_SCHEMA,
      areaServed: 'Worldwide',
      availableLanguage: ['English', 'Chinese'],
    },
  };
}

export function websiteJsonLd(siteUrl = ''): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': absoluteUrl('/#website', siteUrl),
    name: SITE_NAME,
    url: absoluteUrl('/', siteUrl),
    inLanguage: 'en',
    publisher: { '@id': absoluteUrl('/#organization', siteUrl) },
  };
}

export function itemListJsonLd(products: Product[], siteUrl = ''): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'AERO-FOLD foldable travel bags',
    itemListElement: products.slice(0, 48).map((product, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: product.title,
      url: absoluteUrl(`/product/${product.id}`, siteUrl),
    })),
  };
}

export function faqJsonLd(faqs: FaqItem[]): JsonLd | null {
  if (faqs.length === 0) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  };
}

export function productJsonLd(product: Product, siteUrl = ''): JsonLd {
  const url = absoluteUrl(`/product/${product.id}`, siteUrl);
  const images = product.images
    .map((image) => absoluteImage(image.url, siteUrl))
    .filter(Boolean)
    .slice(0, 8);
  const description = productPlainDescription(product);
  const price =
    typeof product.priceCents === 'number' && product.priceCents > 0
      ? (product.priceCents / 100).toFixed(2)
      : null;

  const schema: JsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${url}#product`,
    name: product.title,
    sku: productSku(product),
    description,
    category: product.category || 'Travel bags',
    brand: { '@type': 'Brand', name: SITE_NAME },
    url,
    ...(images.length > 0 ? { image: images } : {}),
    ...(product.updatedAt ? { dateModified: product.updatedAt } : {}),
  };

  if (price) {
    schema.offers = {
      '@type': 'Offer',
      url,
      priceCurrency: 'USD',
      price,
      availability: 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/NewCondition',
      seller: { '@type': 'Organization', name: SITE_NAME },
    };
  }

  return schema;
}

export function breadcrumbJsonLd(product: Product, siteUrl = ''): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: absoluteUrl('/', siteUrl),
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Foldable travel bags',
        item: absoluteUrl('/#gallery', siteUrl),
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: product.title,
        item: absoluteUrl(`/product/${product.id}`, siteUrl),
      },
    ],
  };
}

export function homeJsonLd(products: Product[], siteUrl = ''): JsonLd[] {
  return [
    organizationJsonLd(siteUrl),
    websiteJsonLd(siteUrl),
    itemListJsonLd(products, siteUrl),
    faqJsonLd(HOME_FAQ),
  ].filter((entry): entry is JsonLd => Boolean(entry));
}

export function homeMetaDescription(): string {
  return HOME_DESCRIPTION;
}

export function homeMetaTitle(): string {
  return HOME_TITLE;
}

export function homeMetaKeywords(): string {
  return HOME_KEYWORDS;
}
