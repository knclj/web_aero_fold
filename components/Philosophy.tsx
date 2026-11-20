import React from 'react';
import { motion } from 'framer-motion';

const Philosophy: React.FC = () => (
  <section id="philosophy" className="scroll-mt-24 bg-[#0a0a0a] py-32 md:py-48">
    <div className="container mx-auto px-6 md:px-12">
      <div className="max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8 }}
        >
          <span className="mb-8 block text-xs uppercase tracking-[0.5em] text-zinc-500">
            Philosophy
          </span>

          <h2 className="text-4xl font-light leading-tight tracking-tight text-white md:text-6xl">
            A foldable bag should
            {' '}
            <br />
            <span className="text-zinc-500">earn its space.</span>
          </h2>

          <p className="mt-10 max-w-2xl text-base font-light leading-relaxed text-zinc-400 md:text-lg">
            AERO-FOLD started with a simple idea: the bag you carry should
            disappear when you do not need it. So we design packable travel bags
            that fold flat, open quickly and stay comfortable on the move — for
            weekend trips, carry-on travel and everyday errands.
          </p>
        </motion.div>
      </div>

      <div className="mt-24 grid grid-cols-1 gap-12 border-t border-zinc-800 pt-16 md:grid-cols-3">
        <FeatureBlock
          title="Packs flat"
          desc="Folds into a compact shape for a drawer, suitcase or carry-on, so it is there when you need extra capacity."
        />
        <FeatureBlock
          title="Simple by design"
          desc="Soft, durable fabric and straightforward hardware keep the bag light, easy to carry and quick to fold."
        />
        <FeatureBlock
          title="Ready to travel"
          desc="A practical layout for weekend trips and everyday use, with custom logos and packaging available for wholesale orders."
        />
      </div>
    </div>
  </section>
);

const FeatureBlock: React.FC<{ title: string; desc: string }> = ({ title, desc }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="group"
  >
    <h3 className="mb-4 text-xl font-semibold uppercase tracking-widest transition-colors group-hover:text-zinc-400">
      {title}
    </h3>
    <p className="font-light leading-relaxed text-zinc-500">{desc}</p>
  </motion.div>
);

export default Philosophy;
