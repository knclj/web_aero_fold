import { useEffect, type DependencyList } from 'react';
import { DEFAULT_ROBOTS } from './site';
import { absoluteUrl, type JsonLd } from './seo-data';

export interface PageSeo {
  title: string;
  description: string;
  /** Canonical path (e.g. "/product/1"). Defaults to the current path. */
  path?: string;
  image?: string;
  imageAlt?: string;
  type?: 'website' | 'product' | 'article';
  robots?: string;
  keywords?: string;
  /** Set false to remove the canonical + hreflang tags (admin/404 pages). */
  canonical?: boolean;
  /**
   * undefined = leave server-rendered JSON-LD untouched.
   * [] / null = remove structured data.
   * object/array = replace structured data.
   */
  jsonLd?: JsonLd | JsonLd[] | null;
}

function currentPath(): string {
  return window.location.pathname.replace(/\/+$/, '') || '/';
}

function upsertMeta(attribute: 'name' | 'property', key: string, content?: string): void {
  const existing = document.head.querySelector<HTMLMetaElement>(
    `meta[${attribute}="${key}"]`,
  );
  if (!content) {
    existing?.remove();
    return;
  }
  const element = existing ?? document.createElement('meta');
  element.setAttribute(attribute, key);
  element.setAttribute('content', content);
  if (!existing) document.head.appendChild(element);
}

function upsertLink(rel: string, href: string | null, hreflang?: string): void {
  const selector = hreflang
    ? `link[rel="${rel}"][hreflang="${hreflang}"]`
    : `link[rel="${rel}"]`;
  const existing = document.head.querySelector<HTMLLinkElement>(selector);
  if (!href) {
    existing?.remove();
    return;
  }
  const element = existing ?? document.createElement('link');
  element.rel = rel;
  element.href = href;
  if (hreflang) element.hreflang = hreflang;
  if (!existing) document.head.appendChild(element);
}

function replaceJsonLd(jsonLd: JsonLd | JsonLd[] | null | undefined): void {
  if (jsonLd === undefined) return;
  document
    .querySelectorAll('script[data-seo-jsonld]')
    .forEach((node) => node.remove());
  if (!jsonLd) return;
  const entries = Array.isArray(jsonLd) ? jsonLd : [jsonLd];
  for (const entry of entries) {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-seo-jsonld', 'true');
    script.textContent = JSON.stringify(entry);
    document.head.appendChild(script);
  }
}

/** Apply title, description, canonical, social and structured-data tags. */
export function applySeo(seo: PageSeo): void {
  const path = seo.path ?? currentPath();
  const origin = window.location.origin;
  const canonicalUrl = absoluteUrl(path, origin);
  const image = seo.image ? absoluteUrl(seo.image, origin) : '';
  const robots = seo.robots ?? DEFAULT_ROBOTS;

  document.title = seo.title;
  document.documentElement.lang = 'en';

  upsertMeta('name', 'description', seo.description);
  upsertMeta('name', 'keywords', seo.keywords);
  upsertMeta('name', 'robots', robots);
  upsertMeta('name', 'author', 'AERO-FOLD');

  upsertLink('canonical', seo.canonical === false ? null : canonicalUrl);
  upsertLink(
    'alternate',
    seo.canonical === false ? null : canonicalUrl,
    'en',
  );
  upsertLink(
    'alternate',
    seo.canonical === false ? null : canonicalUrl,
    'x-default',
  );

  upsertMeta('property', 'og:locale', 'en_US');
  upsertMeta('property', 'og:site_name', 'AERO-FOLD');
  upsertMeta('property', 'og:type', seo.type ?? 'website');
  upsertMeta('property', 'og:title', seo.title);
  upsertMeta('property', 'og:description', seo.description);
  upsertMeta('property', 'og:url', seo.canonical === false ? undefined : canonicalUrl);
  upsertMeta('property', 'og:image', image || undefined);
  upsertMeta('property', 'og:image:alt', image ? seo.imageAlt ?? seo.title : undefined);

  upsertMeta('name', 'twitter:card', 'summary_large_image');
  upsertMeta('name', 'twitter:title', seo.title);
  upsertMeta('name', 'twitter:description', seo.description);
  upsertMeta('name', 'twitter:image', image || undefined);

  replaceJsonLd(seo.jsonLd);
}

/** React hook wrapper. Pass the values that should trigger a refresh. */
export function usePageSeo(seo: PageSeo, deps: DependencyList = []): void {
  useEffect(() => {
    applySeo(seo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
