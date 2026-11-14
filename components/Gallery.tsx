import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { fetchProducts } from '../lib/products';
import { formatPrice } from '../lib/format';
import { Link } from '../lib/router';
import type { Product } from '../types/product';

const Gallery: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetchProducts()
      .then((data) => {
        if (!cancelled) setProducts(data);
      })
      .catch((err) => {
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' },
    },
  };

  return (
    <section id="gallery" className="py-32 bg-white text-black">
      <div className="container mx-auto px-6 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-24 flex flex-col md:flex-row md:items-end justify-between gap-8"
        >
          <div>
            <span className="text-xs uppercase tracking-[0.5em] text-zinc-500 mb-4 block">
              Collection 2024
            </span>
            <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter">
              The Lookbook.
            </h2>
          </div>
          <p className="max-w-sm text-zinc-500 text-sm font-light">
            An exploration of form and function.{' '}
            {products.length > 0 ? products.length : '32'} unique variations of
            our signature AERO-FOLD architecture.
          </p>
        </motion.div>

        {loading && (
          <p className="text-center text-zinc-500 text-sm uppercase tracking-widest py-24">
            Loading collection…
          </p>
        )}

        {error && (
          <p className="text-center text-red-600 text-sm py-24">{error}</p>
        )}

        {!loading && !error && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {products.map((product) => {
              const image = product.images[0]?.url;
              return (
                <Link
                  key={product.id}
                  to={`/product/${product.id}`}
                  aria-label={`View ${product.title}`}
                  className="group relative block aspect-[3/4] overflow-hidden bg-zinc-100"
                >
                  <motion.div
                    variants={itemVariants}
                    className="h-full w-full"
                  >
                    {image ? (
                      <img
                        src={image}
                        alt={product.title}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:grayscale-[0.5]"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[10px] uppercase tracking-[0.3em] text-zinc-400">
                        No image
                      </div>
                    )}

                    <div className="absolute inset-0 flex flex-col justify-end bg-black/0 p-8 opacity-0 transition-all duration-500 group-hover:bg-black/60 group-hover:opacity-100">
                      <span className="mb-2 text-[10px] uppercase tracking-[0.3em] text-zinc-400">
                        {product.category}
                      </span>
                      <h4 className="mb-2 text-2xl font-bold uppercase text-white">
                        {product.title}
                      </h4>
                      <div className="mb-4 flex items-center justify-between gap-3">
                        <span className="text-xs uppercase tracking-[0.2em] text-zinc-300">
                          {formatPrice(product.priceCents)}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white">
                          View details
                          <ArrowUpRight size={13} />
                        </span>
                      </div>
                      <div className="h-[1px] w-10 bg-white transition-all duration-500 group-hover:w-full" />
                    </div>

                    <div className="absolute left-4 top-4 z-10">
                      <span className="bg-white/80 px-2 py-1 text-[10px] font-bold uppercase tracking-widest backdrop-blur">
                        AF-{String(product.id).padStart(3, '0')}
                      </span>
                    </div>
                  </motion.div>
                </Link>
              );
            })}
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default Gallery;
