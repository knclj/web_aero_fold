
import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Zap, Layers, Wind } from 'lucide-react';

const Features: React.FC = () => {
  const featureList = [
    {
      icon: <Layers className="w-8 h-8" />,
      title: "Aerospace Fabric",
      desc: "Constructed from a custom ripstop weave used in lunar deployable structures. Waterproof and tear-proof."
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Active Folding",
      desc: "A patented geometric hinge system that remembers its shape. Folds into a flat 1-inch profile instantly."
    },
    {
      icon: <Wind className="w-8 h-8" />,
      title: "0.4kg Payload",
      desc: "Engineered to be so light you'll forget it's there, until you need to carry your world."
    },
    {
      icon: <ShieldCheck className="w-8 h-8" />,
      title: "RFiD Shielding",
      desc: "Integrated Faraday lining protecting your digital identity while you move through transit hubs."
    }
  ];

  return (
    <section className="py-32 md:py-64 bg-[#0a0a0a] relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-zinc-900/20 skew-x-12 transform translate-x-1/2" />

      <div className="container mx-auto px-6 md:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <div>
            <motion.span 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="text-xs uppercase tracking-[0.5em] text-zinc-500 mb-4 block"
            >
              The Blueprint
            </motion.span>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-12"
            >
              Mastery in <br /> Small Spaces.
            </motion.h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-16">
              {featureList.map((f, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="space-y-4"
                >
                  <div className="text-white bg-zinc-800 w-16 h-16 flex items-center justify-center rounded-sm">
                    {f.icon}
                  </div>
                  <h4 className="text-lg font-bold uppercase tracking-widest">{f.title}</h4>
                  <p className="text-zinc-500 text-sm font-light leading-relaxed">
                    {f.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="relative aspect-square"
          >
             <div className="absolute inset-0 border border-zinc-800 rounded-full animate-pulse" />
             <div className="absolute inset-10 border border-zinc-700/50 rounded-full" />
             <img 
               src="https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=2000&auto=format&fit=crop" 
               alt="AERO-FOLD Detail" 
               className="w-full h-full object-cover rounded-sm grayscale group-hover:grayscale-0 transition-all duration-1000"
             />
             <div className="absolute -bottom-10 -right-10 bg-white text-black p-8 hidden md:block">
                <span className="block text-4xl font-black tracking-tighter">100%</span>
                <span className="text-[10px] uppercase tracking-widest font-bold">Carbon Neutral</span>
             </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Features;
