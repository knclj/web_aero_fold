
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, Instagram, Twitter, Linkedin } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer id="contact" className="bg-[#0a0a0a] border-t border-zinc-900 pt-32 pb-12">
      <div className="container mx-auto px-6 md:px-12">
        <div className="flex flex-col lg:flex-row justify-between items-start gap-16 mb-32">
          <div className="max-w-2xl">
            <motion.h2 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-6xl md:text-9xl font-black uppercase tracking-tighter leading-[0.8] mb-12"
            >
              Start Your <br />
              <span className="text-zinc-800 hover:text-white transition-colors cursor-pointer">Journey.</span>
            </motion.h2>
            
            <motion.button 
              whileHover={{ x: 10 }}
              className="flex items-center gap-4 text-xl uppercase tracking-[0.3em] font-bold group"
            >
              Get The Collection <ArrowUpRight className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </motion.button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-16">
            <FooterCol title="Brand" links={['Philosophy', 'Materials', 'Innovation', 'Careers']} />
            <FooterCol title="Service" links={['Support', 'Track Order', 'Warranty', 'Concierge']} />
            <FooterCol title="Legal" links={['Privacy', 'Terms', 'Cookies', 'Returns']} />
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center pt-12 border-t border-zinc-900 gap-8">
          <div className="text-2xl font-black tracking-widest text-white">AERO-FOLD</div>
          
          <div className="flex gap-8">
            <SocialLink icon={<Instagram size={20} />} href="#" />
            <SocialLink icon={<Twitter size={20} />} href="#" />
            <SocialLink icon={<Linkedin size={20} />} href="#" />
          </div>

          <p className="text-zinc-600 text-[10px] uppercase tracking-widest">
            © 2024 AERO-FOLD Engineering & Fashion. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

const FooterCol: React.FC<{ title: string; links: string[] }> = ({ title, links }) => (
  <div className="space-y-6">
    <h4 className="text-[10px] uppercase tracking-[0.4em] font-bold text-zinc-500">{title}</h4>
    <ul className="space-y-4">
      {links.map((link) => (
        <li key={link}>
          <a href="#" className="text-sm font-light text-zinc-400 hover:text-white transition-colors">{link}</a>
        </li>
      ))}
    </ul>
  </div>
);

const SocialLink: React.FC<{ icon: React.ReactNode; href: string }> = ({ icon, href }) => (
  <motion.a 
    href={href} 
    whileHover={{ y: -3, color: '#ffffff' }}
    className="text-zinc-600 transition-colors"
  >
    {icon}
  </motion.a>
);

export default Footer;
