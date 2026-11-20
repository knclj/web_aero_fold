import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, MessageCircle } from 'lucide-react';
import { SITE_PHONE_DISPLAY, SITE_PHONE_SCHEMA } from '../lib/site';
import { whatsappLink } from '../lib/format';

const Footer: React.FC = () => {
  const year = new Date().getFullYear();

  return (
    <footer
      id="contact"
      className="scroll-mt-24 border-t border-zinc-900 bg-[#0a0a0a] pb-12 pt-28"
    >
      <div className="container mx-auto px-6 md:px-12">
        <div className="mb-24 flex flex-col items-start justify-between gap-16 lg:flex-row">
          <div className="max-w-2xl">
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-10 text-6xl font-black uppercase leading-[0.8] tracking-tighter md:text-9xl"
            >
              Start your <br />
              <span className="text-zinc-700">journey.</span>
            </motion.h2>

            <p className="mb-8 max-w-md text-sm font-light leading-relaxed text-zinc-500">
              Questions about a foldable travel bag, a custom logo order or
              wholesale pricing? Message us and we will help you choose the
              right bag.
            </p>

            <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
              <a
                href={whatsappLink('Hello AERO-FOLD, I would like to get the collection and wholesale information.')}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 text-sm font-bold uppercase tracking-[0.25em] transition-colors hover:text-zinc-400"
              >
                <MessageCircle size={18} />
                Chat on WhatsApp
                <ArrowUpRight
                  size={16}
                  className="transition-transform group-hover:-translate-y-1 group-hover:translate-x-1"
                />
              </a>
              <a
                href="#gallery"
                className="group flex items-center gap-3 text-sm font-bold uppercase tracking-[0.25em] transition-colors hover:text-zinc-400"
              >
                Shop the collection
                <ArrowUpRight
                  size={16}
                  className="transition-transform group-hover:-translate-y-1 group-hover:translate-x-1"
                />
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 sm:gap-20">
            <FooterCol
              title="Explore"
              links={[
                { label: 'Foldable travel bags', href: '#gallery' },
                { label: 'Why AERO-FOLD', href: '#philosophy' },
                { label: 'Wholesale & custom', href: '#wholesale' },
                { label: 'Travel bag FAQ', href: '#faq' },
              ]}
            />
            <FooterCol
              title="Contact"
              links={[
                {
                  label: 'WhatsApp',
                  href: whatsappLink('Hello AERO-FOLD, I have a question.'),
                  external: true,
                },
                { label: SITE_PHONE_DISPLAY, href: `tel:${SITE_PHONE_SCHEMA}` },
                {
                  label: 'Request a quote',
                  href: whatsappLink('Hello AERO-FOLD, I would like a quote.'),
                  external: true,
                },
              ]}
            />
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-8 border-t border-zinc-900 pt-12 md:flex-row">
          <a href="/" className="text-2xl font-black tracking-widest text-white">
            AERO-FOLD
          </a>

          <p className="text-[10px] uppercase tracking-widest text-zinc-600">
            Foldable travel bags · Packable duffels · Weekenders
          </p>

          <p className="text-[10px] uppercase tracking-widest text-zinc-600">
            © {year} AERO-FOLD. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

interface FooterLink {
  label: string;
  href: string;
  external?: boolean;
}

const FooterCol: React.FC<{ title: string; links: FooterLink[] }> = ({ title, links }) => (
  <div className="space-y-6">
    <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] text-zinc-500">
      {title}
    </h3>
    <ul className="space-y-4">
      {links.map((link) => (
        <li key={link.label}>
          <a
            href={link.href}
            {...(link.external
              ? { target: '_blank', rel: 'noopener noreferrer' }
              : {})}
            className="text-sm font-light text-zinc-400 transition-colors hover:text-white"
          >
            {link.label}
          </a>
        </li>
      ))}
    </ul>
  </div>
);

export default Footer;
