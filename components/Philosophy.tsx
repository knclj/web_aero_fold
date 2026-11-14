
import React from 'react';
import { motion } from 'framer-motion';

const Philosophy: React.FC = () => {
  const phrases = [
    { text: "We believe travel should be weightless.", color: "text-white" },
    { text: "AERO-FOLD engineers bags that disappear when not in use.", color: "text-zinc-500" },
    { text: "Advanced origami-inspired mechanics meet Italian leather.", color: "text-zinc-600" }
  ];

  return (
    <section id="philosophy" className="py-32 md:py-64 bg-[#0a0a0a]">
      <div className="container mx-auto px-6 md:px-12">
        <div className="max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.5 }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-xs uppercase tracking-[0.5em] text-zinc-500 mb-12 block">Philosophy</span>
            
            <div className="space-y-12">
              {phrases.map((phrase, idx) => (
                <RevealText key={idx} text={phrase.text} className={`text-4xl md:text-6xl font-light tracking-tight leading-tight ${phrase.color}`} />
              ))}
            </div>
          </motion.div>
        </div>

        <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-12 border-t border-zinc-800 pt-16">
          <FeatureBlock 
            title="Compact" 
            desc="Folds down to 5% of its original size. Fits in your pocket, expands for your world." 
          />
          <FeatureBlock 
            title="Durable" 
            desc="Reinforced carbon-fiber joints tested for over 100,000 fold cycles." 
          />
          <FeatureBlock 
            title="Effortless" 
            desc="Magnetic auto-lock system. Open or fold in less than 3 seconds." 
          />
        </div>
      </div>
    </section>
  );
};

const RevealText: React.FC<{ text: string; className: string }> = ({ text, className }) => {
  return (
    <motion.h2 
      initial={{ opacity: 0.2, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, margin: "-100px" }}
      transition={{ duration: 1, ease: "easeOut" }}
      className={className}
    >
      {text}
    </motion.h2>
  );
};

const FeatureBlock: React.FC<{ title: string; desc: string }> = ({ title, desc }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="group"
  >
    <h3 className="text-xl font-semibold uppercase tracking-widest mb-4 group-hover:text-zinc-400 transition-colors">{title}</h3>
    <p className="text-zinc-500 font-light leading-relaxed">{desc}</p>
  </motion.div>
);

export default Philosophy;
