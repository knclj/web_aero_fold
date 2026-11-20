import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, MessageCircle, X } from 'lucide-react';
import { Link } from '../lib/router';
import { whatsappLink } from '../lib/format';

const navLinks = [
  { name: 'Shop', href: '#gallery' },
  { name: 'Why AERO-FOLD', href: '#philosophy' },
  { name: 'Wholesale', href: '#wholesale' },
  { name: 'FAQ', href: '#faq' },
  { name: 'Contact', href: '#contact' },
];

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed left-0 top-0 z-50 w-full transition-all duration-500 ${
        isScrolled
          ? 'bg-[#0a0a0a]/85 py-4 backdrop-blur-md'
          : 'bg-transparent py-8'
      }`}
    >
      <div className="container mx-auto flex items-center justify-between px-6 md:px-12">
        <Link
          to="/"
          aria-label="AERO-FOLD home"
          className="text-2xl font-black tracking-[0.2em] text-white transition-opacity hover:opacity-70"
        >
          AERO-FOLD
        </Link>

        <nav aria-label="Main navigation" className="hidden items-center space-x-8 lg:flex">
          {navLinks.map((link, idx) => (
            <motion.a
              key={link.name}
              href={link.href}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              className="text-[11px] font-medium uppercase tracking-widest text-zinc-400 transition-colors hover:text-white"
            >
              {link.name}
            </motion.a>
          ))}
          <motion.a
            href={whatsappLink('Hello AERO-FOLD, I would like to ask about your foldable travel bags.')}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.1 }}
            aria-label="Chat with AERO-FOLD on WhatsApp"
            className="ml-2 text-white"
          >
            <MessageCircle size={20} />
          </motion.a>
        </nav>

        <div className="flex items-center space-x-4 lg:hidden">
          <a
            href={whatsappLink('Hello AERO-FOLD, I would like to ask about your foldable travel bags.')}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat with AERO-FOLD on WhatsApp"
            className="text-white"
          >
            <MessageCircle size={20} />
          </a>
          <button
            type="button"
            onClick={() => setIsMenuOpen((open) => !open)}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            className="text-white"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-b border-zinc-800 bg-[#0a0a0a] lg:hidden"
          >
            <nav aria-label="Mobile navigation" className="flex flex-col space-y-6 p-8">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="text-2xl font-light uppercase tracking-widest text-zinc-400 hover:text-white"
                >
                  {link.name}
                </a>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
