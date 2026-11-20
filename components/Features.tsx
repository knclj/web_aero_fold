import React from 'react';
import { motion } from 'framer-motion';
import { Layers, ShieldCheck, Wind, Zap } from 'lucide-react';

const Features: React.FC = () => {
  const featureList = [
    {
      icon: <Layers className="h-8 w-8" />,
      title: 'Packable by design',
      desc: 'Folds flat into its own pouch, so it stores easily at home and travels as a spare bag.',
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: 'Opens in seconds',
      desc: 'Unfold, load and go. A soft-sided build with no rigid frame and no tools.',
    },
    {
      icon: <Wind className="h-8 w-8" />,
      title: 'Lightweight carry',
      desc: 'Durable fabric and simple hardware keep the bag comfortable to carry when full.',
    },
    {
      icon: <ShieldCheck className="h-8 w-8" />,
      title: 'Custom-ready',
      desc: 'Add your logo, woven label and retail packaging for wholesale and corporate orders.',
    },
  ];

  return (
    <section className="relative overflow-hidden bg-[#0a0a0a] py-32 md:py-48">
      <div className="absolute right-0 top-0 h-full w-1/2 translate-x-1/2 skew-x-12 transform bg-zinc-900/20" />

      <div className="container relative z-10 mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 items-center gap-24 lg:grid-cols-2">
          <div>
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="mb-4 block text-xs uppercase tracking-[0.5em] text-zinc-500"
            >
              The details
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-12 text-5xl font-black uppercase tracking-tighter md:text-7xl"
            >
              Made to fold.
              {' '}
              <br />
              Built to travel.
            </motion.h2>

            <div className="grid grid-cols-1 gap-x-12 gap-y-16 sm:grid-cols-2">
              {featureList.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="space-y-4"
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-sm bg-zinc-800 text-white">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-bold uppercase tracking-widest">
                    {feature.title}
                  </h3>
                  <p className="text-sm font-light leading-relaxed text-zinc-500">
                    {feature.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="relative aspect-square"
          >
            <div className="absolute inset-0 animate-pulse rounded-full border border-zinc-800" />
            <div className="absolute inset-10 rounded-full border border-zinc-700/50" />
            <img
              src="https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=2000&auto=format&fit=crop"
              alt="Detail of a foldable travel bag's fabric and stitching"
              width={1000}
              height={1000}
              loading="lazy"
              decoding="async"
              className="h-full w-full rounded-sm object-cover grayscale transition-all duration-1000 hover:grayscale-0"
            />
            <div className="absolute -bottom-10 -right-10 hidden bg-white p-8 text-black md:block">
              <span className="block text-4xl font-black tracking-tighter">PACK</span>
              <span className="text-[10px] font-bold uppercase tracking-widest">
                Flat · Go further
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Features;
