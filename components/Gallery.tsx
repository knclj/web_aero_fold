import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { formatPrice } from '../lib/format';
import { Link } from '../lib/router';
import type { Product } from '../types/product';

interface GalleryProps {
  products: Product[];
  loading?: boolean;
  error?: string | null;
}

const Gallery: React.FC<GalleryProps> = ({ products, loading = false, error = null }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
  };

  return (
    <section id="gallery" className="scroll-mt-24 bg-white py-32 text-black">
      <div className="container mx-auto px-6 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-20 flex flex-col justify-between gap-8 md:flex-row md:items-end"
        >
          <div>
            <span className="mb-4 block text-xs uppercase tracking-[0.5em] text-zinc-500">
              The collection
            </span>
            <h2 className="text-5xl font-black uppercase tracking-tighter md:text-7xl">
              Packable bags.
            </h2>
          </div>
          <p className="max-w-sm text-sm font-light leading-relaxed text-zinc-500">
            {products.length > 0
              ? `${products.length} foldable travel bags — packable duffels, weekenders and carry-on totes that fold flat between trips.`
              : 'Foldable travel bags that pack flat between trips: packable duffels, weekenders and carry-on totes.'}
          </p>
        </motion.div>

        {loading && (
          <p className="py-24 text-center text-sm uppercase tracking-widest text-zinc-500">
            Loading collection…
          </p>
        )}

        {error && <p className="py-24 text-center text-sm text-red-600">{error}</p>}

        {!loading && !error && products.length === 0 && (
          <p className="py-24 text-center text-sm uppercase tracking-widest text-zinc-500">
            The collection is being updated. Please check back soon.
          </p>
        )}

        {!loading && !error && products.length > 0 && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.01 }}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            {products.map((product) => {
              const image = product.images[0]?.url;
              return (
                <Link
                  key={product.id}
                  to={`/product/${product.id}`}
                  aria-label={`View ${product.title}, a foldable travel bag`}
                  className="group block"
                >
                  <motion.div variants={itemVariants}>
                    <div className="relative aspect-[3/4] overflow-hidden bg-zinc-100">
                      {image ? (
                        <img
                          src={image}
                          alt={`${product.title} — foldable travel bag`}
                          width={800}
                          height={1000}
                          loading="lazy"
                          decoding="async"
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:grayscale-[0.5]"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[10px] uppercase tracking-[0.3em] text-zinc-400">
                          No image
                        </div>
                      )}

                      <div className="absolute left-4 top-4 z-10">
                        <span className="bg-white/80 px-2 py-1 text-[10px] font-bold uppercase tracking-widest backdrop-blur">
                          AF-{String(product.id).padStart(3, '0')}
                        </span>
                      </div>

                      <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all duration-500 group-hover:bg-black/40 group-hover:opacity-100">
                        <span className="inline-flex items-center gap-2 border border-white/70 px-5 py-3 text-[10px] font-bold uppercase tracking-[0.25em] text-white">
                          View details
                          <ArrowUpRight size={14} />
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start justify-between gap-3 pt-4">
                      <div>
                        <h3 className="text-sm font-bold uppercase tracking-wide">
                          {product.title}
                        </h3>
                        <p className="mt-1 text-[10px] uppercase tracking-[0.25em] text-zinc-500">
                          {product.category || 'Travel bag'} · {formatPrice(product.priceCents)}
                        </p>
                      </div>
                      <ArrowUpRight
                        size={16}
                        className="mt-1 shrink-0 text-zinc-400 transition-colors group-hover:text-black"
                      />
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
