import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowDown, ArrowUpRight } from 'lucide-react';

const Hero: React.FC = () => {
  const { scrollY } = useScroll();

  // Parallax effects
  const y1 = useTransform(scrollY, [0, 500], [0, -100]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);
  const scale = useTransform(scrollY, [0, 800], [1, 1.2]);
  const blur = useTransform(scrollY, [0, 400], [0, 10]);

  return (
    <section className="relative flex h-screen w-full items-center justify-center overflow-hidden">
      <motion.div
        style={{ scale, filter: `blur(${blur}px)` }}
        className="absolute inset-0 z-0 bg-gradient-to-b from-zinc-800 to-[#0a0a0a]"
      >
        <img
          src="https://images.unsplash.com/photo-1547949003-9792a18a2601?q=80&w=2070&auto=format&fit=crop"
          srcSet="https://images.unsplash.com/photo-1547949003-9792a18a2601?q=80&w=800&auto=format&fit=crop 800w, https://images.unsplash.com/photo-1547949003-9792a18a2601?q=80&w=1200&auto=format&fit=crop 1200w, https://images.unsplash.com/photo-1547949003-9792a18a2601?q=80&w=1600&auto=format&fit=crop 1600w, https://images.unsplash.com/photo-1547949003-9792a18a2601?q=80&w=2070&auto=format&fit=crop 2070w"
          sizes="100vw"
          alt="Travel bag photographed on a forest trail"
          width={2070}
          height={1380}
          fetchPriority="high"
          decoding="async"
          className="h-full w-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-black/45" />
      </motion.div>

      <div className="container relative z-10 mx-auto px-6 text-center">
        <motion.div style={{ y: y1, opacity }}>
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-6 inline-block text-xs uppercase tracking-[0.5em] text-zinc-300 md:text-sm"
          >
            Pack flat. Go further.
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="mb-8 text-6xl font-black uppercase leading-[0.9] tracking-tight md:text-8xl lg:text-9xl"
          >
            Foldable <br />
            <span className="bg-gradient-to-r from-white via-zinc-300 to-zinc-500 bg-clip-text text-transparent">
              travel bags.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="mx-auto max-w-2xl text-base font-light leading-relaxed tracking-wide text-zinc-300 md:text-xl"
          >
            Lightweight packable duffels, weekenders and carry-on totes for
            weekend trips and everyday travel. Fold flat when empty, open in
            seconds.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.55 }}
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <a
              href="#gallery"
              className="inline-flex items-center gap-3 bg-white px-7 py-4 text-[11px] font-bold uppercase tracking-[0.25em] text-black transition-opacity hover:opacity-80"
            >
              Shop foldable bags
              <ArrowDown size={14} />
            </a>
            <a
              href="#wholesale"
              className="inline-flex items-center gap-3 border border-white/30 px-7 py-4 text-[11px] font-bold uppercase tracking-[0.25em] text-white transition-colors hover:bg-white hover:text-black"
            >
              Wholesale &amp; custom
              <ArrowUpRight size={14} />
            </a>
          </motion.div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2"
      >
        <span className="text-[10px] uppercase tracking-[0.3em] text-zinc-500">
          Scroll
        </span>
        <div className="h-12 w-[1px] bg-gradient-to-b from-white to-transparent" />
      </motion.div>
    </section>
  );
};

export default Hero;
