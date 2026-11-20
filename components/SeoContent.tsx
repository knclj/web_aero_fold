import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowUpRight, Check, Plus } from 'lucide-react';
import { HOME_FAQ } from '../lib/faq';
import { whatsappLink } from '../lib/format';
import { SITE_PHONE_DISPLAY } from '../lib/site';

const reveal = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.7 },
};

/** Keyword-focused introduction for the home page. */
export const SeoIntro: React.FC = () => {
  const collections = [
    {
      title: 'Packable duffels',
      body: 'Soft-sided duffels that fold flat for storage and open into a generous weekend or gym bag.',
    },
    {
      title: 'Weekender bags',
      body: 'A clean, carry-on-friendly shape for two- or three-day trips, with room for clothes and a laptop.',
    },
    {
      title: 'Carry-on totes',
      body: 'Lightweight totes that pack into a suitcase and become a second bag at your destination.',
    },
  ];

  return (
    <section
      id="foldable-travel-bags"
      className="bg-white px-6 py-24 text-black md:px-12 md:py-32"
    >
      <div className="mx-auto grid max-w-7xl gap-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
        <motion.div {...reveal}>
          <span className="mb-5 block text-[10px] uppercase tracking-[0.5em] text-zinc-500">
            Foldable travel bags
          </span>
          <h2 className="max-w-3xl text-4xl font-black uppercase leading-[0.95] tracking-tighter md:text-6xl">
            One bag. Packed flat.
            {' '}
            <br />
            <span className="text-zinc-400">Ready for the next trip.</span>
          </h2>
          <p className="mt-8 max-w-2xl text-base font-light leading-relaxed text-zinc-600 md:text-lg">
            AERO-FOLD designs lightweight packable duffels, weekender bags and
            carry-on totes for weekend trips, business travel and everyday
            errands. Each bag folds flat for storage, then opens into a
            full-size carry bag when you need extra capacity. Custom logos and
            wholesale orders are available.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
            <a
              href="#gallery"
              className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.25em] underline decoration-zinc-300 decoration-1 underline-offset-8 transition-colors hover:decoration-black"
            >
              Shop the collection
              <ArrowRight size={14} />
            </a>
            <a
              href="#wholesale"
              className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.25em] text-zinc-500 transition-colors hover:text-black"
            >
              Wholesale &amp; custom
              <ArrowUpRight size={14} />
            </a>
          </div>
        </motion.div>

        <motion.div {...reveal} className="grid gap-px bg-zinc-200 sm:grid-cols-3 lg:grid-cols-1">
          {collections.map((item, index) => (
            <a
              key={item.title}
              href="#gallery"
              className="group bg-white p-6 transition-colors hover:bg-[#f4f4f2]"
            >
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400">
                0{index + 1}
              </span>
              <h3 className="mt-3 text-lg font-bold uppercase tracking-wide">
                {item.title}
              </h3>
              <p className="mt-2 text-sm font-light leading-relaxed text-zinc-500">
                {item.body}
              </p>
            </a>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

/** B2B / OEM landing section, linked from the header and footer. */
export const Wholesale: React.FC = () => {
  const steps = [
    ['Share your brief', 'Tell us the bag style, target quantity, logo and delivery date.'],
    ['Approve a sample', 'We confirm fabric, colors, branding and packaging before production.'],
    ['Production & shipping', 'We quote air or sea freight and keep you updated until delivery.'],
  ];

  return (
    <section id="wholesale" className="scroll-mt-24 bg-[#0a0a0a] px-6 py-24 text-white md:px-12 md:py-32">
      <div className="mx-auto grid max-w-7xl gap-16 lg:grid-cols-2">
        <motion.div {...reveal}>
          <span className="mb-5 block text-[10px] uppercase tracking-[0.5em] text-zinc-500">
            Wholesale &amp; OEM
          </span>
          <h2 className="text-4xl font-black uppercase leading-[0.95] tracking-tighter md:text-6xl">
            Custom foldable bags
            {' '}
            <br />
            <span className="text-zinc-600">for your brand.</span>
          </h2>
          <p className="mt-8 max-w-xl text-base font-light leading-relaxed text-zinc-400">
            Add your logo, woven label and retail packaging to our packable
            duffels, weekenders and totes. Minimum order quantity depends on the
            style, fabric and level of customization — send your requirements
            and we will confirm the options, sample cost and lead time.
          </p>
          <a
            href={whatsappLink(
              'Hello AERO-FOLD, I would like a wholesale quote for custom foldable travel bags. Here is my brief:',
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-10 inline-flex items-center gap-3 bg-white px-7 py-4 text-[11px] font-bold uppercase tracking-[0.25em] text-black transition-opacity hover:opacity-80"
          >
            Request a wholesale quote
            <ArrowUpRight size={15} />
          </a>
          <p className="mt-5 text-xs font-light text-zinc-500">
            WhatsApp {SITE_PHONE_DISPLAY}
          </p>
        </motion.div>

        <motion.ol {...reveal} className="space-y-8 border-t border-zinc-800 pt-10 lg:border-l lg:border-t-0 lg:pl-12 lg:pt-0">
          {steps.map(([title, body], index) => (
            <li key={title} className="flex gap-5">
              <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center border border-zinc-700 text-[11px] font-bold">
                {index + 1}
              </span>
              <div>
                <h3 className="text-sm font-bold uppercase tracking-[0.2em]">
                  {title}
                </h3>
                <p className="mt-2 text-sm font-light leading-relaxed text-zinc-500">
                  {body}
                </p>
              </div>
            </li>
          ))}
          <li className="flex items-start gap-3 border-t border-zinc-800 pt-8 text-xs font-light text-zinc-500">
            <Check size={16} className="mt-0.5 shrink-0" />
            Custom colors, logo printing, woven labels and retail packaging.
          </li>
        </motion.ol>
      </div>
    </section>
  );
};

/** Visible FAQ that mirrors the FAQPage structured data. */
export const HomeFaq: React.FC = () => (
  <section id="faq" className="scroll-mt-24 bg-[#f4f2ee] px-6 py-24 text-black md:px-12 md:py-32">
    <div className="mx-auto max-w-5xl">
      <motion.div {...reveal}>
        <span className="mb-5 block text-[10px] uppercase tracking-[0.5em] text-zinc-500">
          Travel bag FAQ
        </span>
        <h2 className="text-4xl font-black uppercase leading-[0.95] tracking-tighter md:text-6xl">
          Questions, answered.
        </h2>
        <p className="mt-6 max-w-2xl text-sm font-light leading-relaxed text-zinc-600 md:text-base">
          What to know before choosing a foldable travel bag, ordering custom
          bags or shipping an order.
        </p>
      </motion.div>

      <div className="mt-14 divide-y divide-zinc-300 border-y border-zinc-300">
        {HOME_FAQ.map((faq) => (
          <details key={faq.question} className="group">
            <summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-6 text-left [&::-webkit-details-marker]:hidden">
              <h3 className="text-base font-semibold md:text-lg">{faq.question}</h3>
              <Plus
                size={20}
                className="mt-0.5 shrink-0 text-zinc-400 transition-transform duration-300 group-open:rotate-45"
              />
            </summary>
            <p className="max-w-3xl pb-7 text-sm font-light leading-relaxed text-zinc-600 md:text-base">
              {faq.answer}
            </p>
          </details>
        ))}
      </div>

      <p className="mt-10 text-sm font-light text-zinc-500">
        Still have a question?{' '}
        <a
          href={whatsappLink('Hello AERO-FOLD, I have a question about your foldable travel bags.')}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-black underline decoration-zinc-300 underline-offset-4 hover:decoration-black"
        >
          Message us on WhatsApp
        </a>
        .
      </p>
    </div>
  </section>
);
