import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { Link } from '../lib/router';
import { usePageSeo } from '../lib/seo';
import { NOINDEX_ROBOTS } from '../lib/site';

const NotFound: React.FC = () => {
  usePageSeo(
    {
      title: 'Page not found | AERO-FOLD',
      description: 'The page you requested could not be found.',
      canonical: false,
      robots: NOINDEX_ROBOTS,
      jsonLd: [],
    },
    [],
  );

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0a0a0a] px-6 text-center text-white">
      <p className="text-[11px] uppercase tracking-[0.4em] text-zinc-500">404</p>
      <h1 className="mt-5 text-4xl font-black uppercase tracking-tight md:text-6xl">
        Page not found
      </h1>
      <p className="mt-5 max-w-md text-sm font-light leading-relaxed text-zinc-400">
        The page may have moved. Browse our foldable travel bags or ask us for
        help choosing a packable duffel, weekender or carry-on tote.
      </p>
      <Link
        to="/"
        className="mt-9 inline-flex items-center gap-2 bg-white px-6 py-3 text-[11px] font-bold uppercase tracking-[0.25em] text-black transition-opacity hover:opacity-80"
      >
        Back to the collection
        <ArrowUpRight size={14} />
      </Link>
    </div>
  );
};

export default NotFound;
