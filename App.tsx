import React from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import Header from './components/Header';
import Hero from './components/Hero';
import Philosophy from './components/Philosophy';
import Gallery from './components/Gallery';
import Features from './components/Features';
import Footer from './components/Footer';
import ProductPage from './components/product/ProductPage';
import AdminGate from './components/admin/AdminGate';
import AdminApp from './components/admin/AdminApp';
import AdminProductEditor from './components/admin/AdminProductEditor';
import AdminProductForm from './components/admin/AdminProductForm';
import PreviewPage from './components/admin/PreviewPage';
import { RouterProvider, matchPath, useRouter } from './lib/router';

const HomePage: React.FC = () => {
  return (
    <div className="relative min-h-screen bg-[#0a0a0a] text-white overflow-hidden">
      <ScrollProgress />

      <Header />

      <main>
        <Hero />
        <Philosophy />
        <Gallery />
        <Features />
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

  return <HomePage />;
};

const App: React.FC = () => {
  return (
    <RouterProvider>
      <Routes />
    </RouterProvider>
  );
};

const ScrollProgress: React.FC = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 bg-white z-[100] origin-left"
      style={{ scaleX }}
    />
  );
};

const WhatsAppButton: React.FC = () => {
  return (
    <motion.a
      href="https://wa.me/8613510961291"
      target="_blank"
      rel="noopener noreferrer"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className="fixed bottom-8 right-8 z-50 bg-[#25D366] p-4 rounded-full shadow-2xl flex items-center justify-center text-white"
    >
      <MessageCircle size={28} />
    </motion.a>
  );
};

export default App;
