import React, { Suspense, lazy, useEffect, useState } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import Header from './components/Header';
import Hero from './components/Hero';
import Philosophy from './components/Philosophy';
import Gallery from './components/Gallery';
import Features from './components/Features';
import Footer from './components/Footer';
import { HomeFaq, SeoIntro, Wholesale } from './components/SeoContent';
import ProductPage from './components/product/ProductPage';
import NotFound from './components/NotFound';
import { RouterProvider, matchPath, useRouter } from './lib/router';
import { fetchProducts } from './lib/products';
import { usePageSeo } from './lib/seo';
import { homeJsonLd } from './lib/seo-data';
import { HOME_DESCRIPTION, HOME_KEYWORDS, HOME_TITLE } from './lib/site';
import { whatsappLink } from './lib/format';
import type { Product } from './types/product';

// Admin code is not needed for the public, indexable pages.
const AdminGate = lazy(() => import('./components/admin/AdminGate'));
const AdminApp = lazy(() => import('./components/admin/AdminApp'));
const AdminProductEditor = lazy(() => import('./components/admin/AdminProductEditor'));
const AdminProductForm = lazy(() => import('./components/admin/AdminProductForm'));
const PreviewPage = lazy(() => import('./components/admin/PreviewPage'));

const HomePage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchProducts()
      .then((data) => {
        if (!cancelled) setProducts(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load products');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  usePageSeo(
    {
      title: HOME_TITLE,
      description: HOME_DESCRIPTION,
      keywords: HOME_KEYWORDS,
      path: '/',
      image: '/og-cover.png',
      imageAlt: 'AERO-FOLD foldable travel bags',
      type: 'website',
      jsonLd: homeJsonLd(products),
    },
    [products],
  );

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0a0a0a] text-white">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:bg-white focus:px-4 focus:py-3 focus:text-xs focus:font-bold focus:uppercase focus:tracking-widest focus:text-black"
      >
        Skip to content
      </a>
      <ScrollProgress />

      <Header />

      <main id="main-content">
        <Hero />
        <SeoIntro />
        <Philosophy />
        <Gallery products={products} loading={loading} error={error} />
        <Features />
        <Wholesale />
        <HomeFaq />
      </main>

      <Footer />

      <WhatsAppButton />
    </div>
  );
};

const Routes: React.FC = () => {
  const { pathname } = useRouter();
  const path = pathname.replace(/\/+$/, '') || '/';

  const previewMatch = matchPath('/admin/preview/product/:id', path);
  if (previewMatch?.id) {
    return <PreviewPage id={previewMatch.id} />;
  }

  if (path === '/admin/products/new') {
    return (
      <AdminGate>
        <AdminProductForm />
      </AdminGate>
    );
  }

  const productFormMatch = matchPath('/admin/products/:id/edit', path);
  if (productFormMatch?.id) {
    return (
      <AdminGate>
        <AdminProductForm id={productFormMatch.id} />
      </AdminGate>
    );
  }

  const editorMatch = matchPath('/admin/product/:id', path);
  if (editorMatch?.id) {
    return (
      <AdminGate>
        <AdminProductEditor id={editorMatch.id} />
      </AdminGate>
    );
  }

  if (path === '/admin') {
    return (
      <AdminGate>
        <AdminApp />
      </AdminGate>
    );
  }

  const productMatch = matchPath('/product/:id', path);
  if (productMatch?.id) {
    return <ProductPage id={productMatch.id} />;
  }

  if (path !== '/') return <NotFound />;

  return <HomePage />;
};

const App: React.FC = () => {
  return (
    <RouterProvider>
      <Suspense fallback={<RouteFallback />}>
        <Routes />
      </Suspense>
    </RouterProvider>
  );
};

const RouteFallback: React.FC = () => (
  <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a]">
    <span className="text-[10px] uppercase tracking-[0.4em] text-zinc-500">
      Loading…
    </span>
  </div>
);

const ScrollProgress: React.FC = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      className="fixed left-0 right-0 top-0 z-[100] h-1 origin-left bg-white"
      style={{ scaleX }}
    />
  );
};

const WhatsAppButton: React.FC = () => (
  <motion.a
    href={whatsappLink('Hello AERO-FOLD, I would like to ask about your foldable travel bags.')}
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Chat with AERO-FOLD on WhatsApp"
    initial={{ scale: 0, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.9 }}
    className="fixed bottom-8 right-8 z-50 flex items-center justify-center rounded-full bg-[#25D366] p-4 text-white shadow-2xl"
  >
    <MessageCircle size={28} />
  </motion.a>
);

export default App;
