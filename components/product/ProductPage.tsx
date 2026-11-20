import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowUpRight,
  ImageOff,
  QrCode,
  Share2,
} from 'lucide-react';
import { Link } from '../../lib/router';
import { fetchProduct, fetchProducts, ProductNotFoundError } from '../../lib/products';
import { formatPrice, whatsappLink } from '../../lib/format';
import { defaultSections } from '../../lib/sections';
import {
  breadcrumbJsonLd,
  productJsonLd,
  productKeywords,
  productMetaDescription,
  productPlainDescription,
  productSeoTitle,
} from '../../lib/seo-data';
import { usePageSeo } from '../../lib/seo';
import { DEFAULT_ROBOTS, NOINDEX_ROBOTS } from '../../lib/site';
import type { DetailSection, Product } from '../../types/product';
import { SectionRenderer } from './Sections';

const ShareQrModal = React.lazy(() => import('./ShareQrModal'));

interface ProductPageProps {
  id: string;
  /** Admin preview: allows unpublished products and live section overrides. */
  preview?: boolean;
  overrideSections?: DetailSection[];
}

const ProductPage: React.FC<ProductPageProps> = ({
  id,
  preview = false,
  overrideSections,
}) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [sections, setSections] = useState<DetailSection[]>([]);
  const [isCustomized, setIsCustomized] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showQr, setShowQr] = useState(false);
  const [related, setRelated] = useState<Product[]>([]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setNotFound(false);
    setProduct(null);
    setActiveImage(0);

    fetchProduct(id, { preview })
      .then((data) => {
        if (cancelled) return;
        setProduct(data.product);
        setSections(data.sections);
        setIsCustomized(data.isCustomized);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        if (err instanceof ProductNotFoundError) {
          setNotFound(true);
        } else {
          setError(err instanceof Error ? err.message : 'Failed to load product');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id, preview]);

  const renderedSections = useMemo(() => {
    if (!product) return [];
    if (overrideSections && overrideSections.length > 0) {
      return overrideSections;
    }
    // The product summary above already renders the description; skip the
    // duplicate default text section and keep the gallery + CTA sections.
    return isCustomized
      ? sections
      : defaultSections(product).filter((section) => section.type !== 'text');
  }, [product, isCustomized, sections, overrideSections]);

  const seo = useMemo(
    () => ({
      title: notFound
        ? 'Product not found | AERO-FOLD'
        : product
          ? productSeoTitle(product)
          : 'Product | AERO-FOLD',
      description: product
        ? productMetaDescription(product)
        : 'Browse AERO-FOLD foldable travel bags, packable duffels and carry-on totes.',
      path: `/product/${product?.id ?? id}`,
      image: product?.images[0]?.url ?? '/og-cover.png',
      imageAlt: product
        ? `${product.title} — foldable travel bag by AERO-FOLD`
        : 'AERO-FOLD foldable travel bags',
      type: 'product' as const,
      keywords: product ? productKeywords(product) : undefined,
      robots: preview || !product ? NOINDEX_ROBOTS : DEFAULT_ROBOTS,
      canonical: !preview && Boolean(product),
      jsonLd:
        product && !preview
          ? [productJsonLd(product), breadcrumbJsonLd(product)]
          : [],
    }),
    [product, renderedSections, id, preview, notFound],
  );

  usePageSeo(seo, [seo]);

  useEffect(() => {
    if (!product) {
      setRelated([]);
      return;
    }
    let cancelled = false;
    setRelated([]);

    fetchProducts()
      .then((all) => {
        if (cancelled) return;
        const sameCategory = all.filter(
          (item) => item.id !== product.id && item.category === product.category,
        );
        const otherBags = all.filter(
          (item) => item.id !== product.id && item.category !== product.category,
        );
        setRelated([...sameCategory, ...otherBags].slice(0, 3));
      })
      .catch(() => {
        // Related products are a progressive enhancement.
      });

    return () => {
      cancelled = true;
    };
  }, [product]);

  const images = product?.images ?? [];
  const mainImage = images[activeImage]?.url ?? images[0]?.url ?? '';

  return (
    <div className="min-h-screen bg-white text-black">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0a0a0a] text-white">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6 md:px-12">
          <Link
            to="/"
            className="text-sm font-black tracking-[0.25em] transition-opacity hover:opacity-70"
          >
            AERO-FOLD
          </Link>
          <Link
            to="/"
            state={{ scrollTo: 'gallery' }}
            className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-zinc-400 transition-colors hover:text-white"
          >
            <ArrowLeft size={14} />
            All products
          </Link>
          <button
            type="button"
            onClick={() => setShowQr(true)}
            disabled={!product}
            className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-zinc-400 transition-colors hover:text-white disabled:opacity-30"
          >
            <QrCode size={16} />
            <span className="hidden sm:inline">Scan / Share</span>
          </button>
        </div>
      </header>

      {loading ? <ProductSkeleton /> : null}

      {notFound ? (
        <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-6 text-center">
          <p className="text-[11px] uppercase tracking-[0.4em] text-zinc-400">
            404
          </p>
          <h1 className="mt-4 text-3xl font-black uppercase tracking-tight">
            This product could not be found
          </h1>
          <p className="mt-4 text-sm font-light text-zinc-500">
            It may have been unpublished or removed. Browse the current
            collection instead.
          </p>
          <Link
            to="/"
            state={{ scrollTo: 'gallery' }}
            className="mt-8 inline-flex items-center gap-2 bg-black px-6 py-3 text-[11px] font-bold uppercase tracking-[0.25em] text-white"
          >
            Back to collection
            <ArrowUpRight size={14} />
          </Link>
        </div>
      ) : null}

      {error ? (
        <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-6 text-center">
          <h1 className="text-2xl font-black uppercase tracking-tight">
            Something went wrong
          </h1>
          <p className="mt-4 text-sm font-light text-zinc-500">{error}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-8 bg-black px-6 py-3 text-[11px] font-bold uppercase tracking-[0.25em] text-white"
          >
            Try again
          </button>
        </div>
      ) : null}

      {product ? (
        <>
          <main>
            <nav aria-label="Breadcrumb" className="mx-auto max-w-7xl px-6 pb-4 pt-6 md:px-12">
              <ol className="flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-zinc-400">
                <li>
                  <Link to="/" className="transition-colors hover:text-black">
                    Home
                  </Link>
                </li>
                <li aria-hidden="true">/</li>
                <li>
                  <Link
                    to="/"
                    state={{ scrollTo: 'gallery' }}
                    className="transition-colors hover:text-black"
                  >
                    Foldable travel bags
                  </Link>
                </li>
                <li aria-hidden="true">/</li>
                <li aria-current="page" className="text-zinc-700">
                  {product.title}
                </li>
              </ol>
            </nav>

            <section className="grid lg:grid-cols-2">
              <div className="bg-[#f4f4f2]">
                <div className="flex aspect-[4/5] items-center justify-center overflow-hidden">
                  {mainImage ? (
                    <img
                      src={mainImage}
                      alt={`${product.title} — foldable travel bag`}
                      width={800}
                      height={1000}
                      fetchPriority="high"
                      decoding="async"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-3 text-zinc-400">
                      <ImageOff size={40} strokeWidth={1} />
                      <span className="text-[10px] uppercase tracking-[0.3em]">
                        No image yet
                      </span>
                    </div>
                  )}
                </div>
                {images.length > 1 ? (
                  <div className="grid grid-cols-5 gap-2 p-3">
                    {images.slice(0, 10).map((image, index) => (
                      <button
                        key={image.id}
                        type="button"
                        onClick={() => setActiveImage(index)}
                        aria-label={`View ${product.title} image ${index + 1}`}
                        className={`aspect-square overflow-hidden border-2 transition-colors ${
                          index === activeImage
                            ? 'border-black'
                            : 'border-transparent opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={image.url}
                          alt={`${product.title} — thumbnail ${index + 1}`}
                          width={160}
                          height={160}
                          loading="lazy"
                          decoding="async"
                          className="h-full w-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="flex flex-col justify-center px-6 py-12 md:px-12 lg:py-20">
                <div className="mx-auto w-full max-w-xl">
                  <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.35em] text-zinc-400">
                    <span>{product.category || 'Collection'}</span>
                    <span className="h-px w-8 bg-zinc-300" />
                    <span>AF-{String(product.id).padStart(3, '0')}</span>
                  </div>

                  <h1 className="mt-6 text-4xl font-black uppercase leading-[0.95] tracking-tighter md:text-6xl">
                    {product.title}
                  </h1>

                  <p className="mt-6 text-2xl font-light tracking-tight">
                    {formatPrice(product.priceCents)}
                  </p>

                  <p className="mt-6 whitespace-pre-line text-sm font-light leading-relaxed text-zinc-600 md:text-base">
                    {productPlainDescription(product)}
                  </p>

                  <p className="mt-3 text-xs font-light text-zinc-500">
                    Need custom colors, logos or a wholesale quote?{' '}
                    <Link
                      to="/"
                      state={{ scrollTo: 'wholesale' }}
                      className="font-semibold text-black underline decoration-zinc-300 underline-offset-4 hover:decoration-black"
                    >
                      Ask about custom orders
                    </Link>
                    .
                  </p>

                  <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                    <a
                      href={whatsappLink(
                        `Hi AERO-FOLD, I'm interested in the ${product.title}. Could you share availability, shipping and a quote?`,
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex flex-1 items-center justify-center gap-2 bg-black px-6 py-4 text-[11px] font-bold uppercase tracking-[0.25em] text-white transition-opacity hover:opacity-80"
                    >
                      Inquire on WhatsApp
                      <ArrowUpRight size={14} />
                    </a>
                    <button
                      type="button"
                      onClick={() => setShowQr(true)}
                      className="inline-flex items-center justify-center gap-2 border border-black px-6 py-4 text-[11px] font-bold uppercase tracking-[0.25em] transition-colors hover:bg-black hover:text-white"
                    >
                      <Share2 size={14} />
                      Share
                    </button>
                  </div>

                  <dl className="mt-10 grid grid-cols-2 gap-4 border-t border-zinc-200 pt-6 text-xs">
                    <div>
                      <dt className="text-[10px] uppercase tracking-[0.3em] text-zinc-400">
                        Category
                      </dt>
                      <dd className="mt-1 font-medium">
                        {product.category || 'Travel bag'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[10px] uppercase tracking-[0.3em] text-zinc-400">
                        Reference
                      </dt>
                      <dd className="mt-1 font-medium">
                        AF-{String(product.id).padStart(3, '0')}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[10px] uppercase tracking-[0.3em] text-zinc-400">
                        Availability
                      </dt>
                      <dd className="mt-1 font-medium">Made to order</dd>
                    </div>
                    <div>
                      <dt className="text-[10px] uppercase tracking-[0.3em] text-zinc-400">
                        Shipping
                      </dt>
                      <dd className="mt-1 font-medium">Worldwide, quoted</dd>
                    </div>
                  </dl>
                </div>
              </div>
            </section>

            {renderedSections.map((section) => (
              <SectionRenderer
                key={section.id}
                section={section}
                product={product}
              />
            ))}

            {related.length > 0 ? (
              <section
                aria-labelledby="related-heading"
                className="border-t border-zinc-200 bg-[#f4f4f2] py-20"
              >
                <div className="mx-auto max-w-7xl px-6 md:px-12">
                  <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                    <div>
                      <span className="mb-3 block text-[10px] uppercase tracking-[0.4em] text-zinc-500">
                        Keep exploring
                      </span>
                      <h2
                        id="related-heading"
                        className="text-3xl font-black uppercase tracking-tighter md:text-4xl"
                      >
                        More foldable travel bags
                      </h2>
                    </div>
                    <Link
                      to="/"
                      state={{ scrollTo: 'gallery' }}
                      className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-500 transition-colors hover:text-black"
                    >
                      View all
                      <ArrowUpRight size={14} />
                    </Link>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    {related.map((item) => (
                      <Link key={item.id} to={`/product/${item.id}`} className="group block">
                        <div className="aspect-[4/5] overflow-hidden bg-white">
                          {item.images[0] ? (
                            <img
                              src={item.images[0].url}
                              alt={`${item.title} — foldable travel bag`}
                              width={800}
                              height={1000}
                              loading="lazy"
                              decoding="async"
                              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                          ) : null}
                        </div>
                        <h3 className="mt-4 text-sm font-bold uppercase tracking-wide">
                          {item.title}
                        </h3>
                        <p className="mt-1 text-[10px] uppercase tracking-[0.3em] text-zinc-500">
                          {item.category || 'Travel bag'}
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
              </section>
            ) : null}
          </main>

          <footer className="border-t border-white/10 bg-[#0a0a0a] py-10 text-white">
            <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 text-[10px] uppercase tracking-[0.3em] text-zinc-500 md:flex-row md:px-12">
              <Link to="/" className="font-black tracking-[0.25em] text-white">
                AERO-FOLD
              </Link>
              <span>Reshape your journey</span>
              <Link
                to="/"
                state={{ scrollTo: 'gallery' }}
                className="transition-colors hover:text-white"
              >
                Back to collection
              </Link>
            </div>
          </footer>
        </>
      ) : null}

      {showQr && product ? (
        <React.Suspense fallback={null}>
          <ShareQrModal product={product} onClose={() => setShowQr(false)} />
        </React.Suspense>
      ) : null}
    </div>
  );
};

const ProductSkeleton: React.FC = () => (
  <div className="grid animate-pulse lg:grid-cols-2">
    <div className="aspect-[4/5] bg-[#f4f4f2]" />
    <div className="flex flex-col justify-center px-6 py-12 md:px-12 lg:py-20">
      <div className="mx-auto w-full max-w-xl space-y-5">
        <div className="h-3 w-40 bg-zinc-100" />
        <div className="h-12 w-3/4 bg-zinc-100" />
        <div className="h-6 w-32 bg-zinc-100" />
        <div className="space-y-3 pt-4">
          <div className="h-3 w-full bg-zinc-100" />
          <div className="h-3 w-5/6 bg-zinc-100" />
          <div className="h-3 w-2/3 bg-zinc-100" />
        </div>
        <div className="h-14 w-full bg-zinc-100" />
      </div>
    </div>
  </div>
);

export default ProductPage;
