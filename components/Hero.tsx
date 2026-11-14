
import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const Hero: React.FC = () => {
  const { scrollY } = useScroll();
  
  // Parallax effects
  const y1 = useTransform(scrollY, [0, 500], [0, -100]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);
  const scale = useTransform(scrollY, [0, 800], [1, 1.2]);
  const blur = useTransform(scrollY, [0, 400], [0, 10]);

  return (
    <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
      {/* Background Image / Placeholder */}
      <motion.div 
        style={{ scale, filter: `blur(${blur}px)` }}
        className="absolute inset-0 z-0 bg-gradient-to-b from-zinc-800 to-[#0a0a0a]"
      >
        <img 
          src="https://images.unsplash.com/photo-1547949003-9792a18a2601?q=80&w=2070&auto=format&fit=crop" 
          alt="AERO-FOLD Bag" 
          className="w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-black/40" />
      </motion.div>

      <div className="container mx-auto px-6 relative z-10 text-center">
        <motion.div style={{ y: y1, opacity }}>
          <motion.span 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-block text-xs md:text-sm uppercase tracking-[0.5em] text-zinc-400 mb-6"
          >
            Engineering meets Fashion
          </motion.span>
          
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="text-6xl md:text-8xl lg:text-9xl font-black uppercase tracking-tight leading-[0.9] mb-8"
          >
            Reshape Your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-400 to-zinc-600">
              Journey.
            </span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="max-w-xl mx-auto text-zinc-400 text-lg md:text-xl font-light tracking-wide"
          >
            The world's most advanced foldable travel shoulder bag. Crafted for the modern nomad.
          </motion.p>
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-[10px] uppercase tracking-[0.3em] text-zinc-500">Scroll</span>
        <div className="w-[1px] h-12 bg-gradient-to-b from-white to-transparent" />
      </motion.div>
    </section>
  );
};

export default Hero;
