import React from 'react';
import {
  Award,
  Globe2,
  Layers,
  Package,
  Plus,
  ShieldCheck,
  Tag,
  Truck,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import type { DetailSection, Product } from '../../types/product';
import { toLines, whatsappLink } from '../../lib/format';

type Content = Record<string, unknown>;

const ICONS: Record<string, LucideIcon> = {
  shield: ShieldCheck,
  zap: Zap,
  layers: Layers,
  globe: Globe2,
  package: Package,
  award: Award,
  truck: Truck,
  tag: Tag,
};

function text(content: Content, key: string, fallback = ''): string {
  const value = content[key];
  return typeof value === 'string' ? value : fallback;
}

function objects(content: Content, key: string): Content[] {
  const value = content[key];
  if (!Array.isArray(value)) return [];
  return value.filter(
    (item): item is Content =>
      Boolean(item) && typeof item === 'object' && !Array.isArray(item),
  );
}

function strings(content: Content, key: string): string[] {
  const value = content[key];
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
}

const Eyebrow: React.FC<{ children: React.ReactNode; light?: boolean }> = ({
  children,
  light,
}) => (
  <span
    className={`mb-4 block text-[11px] uppercase tracking-[0.45em] ${
      light ? 'text-white/60' : 'text-zinc-500'
    }`}
  >
    {children}
  </span>
);

const Banner: React.FC<{ content: Content }> = ({ content }) => {
  const image = text(content, 'image');
  const title = text(content, 'title');
  const subtitle = text(content, 'subtitle');
  const eyebrow = text(content, 'eyebrow');
  if (!title && !image) return null;

  return (
    <section className="relative overflow-hidden bg-zinc-950 text-white">
      {image ? (
        <img
          src={image}
          alt={title ? `${title} — foldable travel bag` : 'Foldable travel bag'}
          width={1600}
          height={900}
          className="absolute inset-0 h-full w-full object-cover opacity-60"
        />
      ) : null}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/10" />
      <div className="relative mx-auto flex min-h-[420px] max-w-7xl flex-col justify-end px-6 py-20 md:min-h-[560px] md:px-12">
        {eyebrow ? <Eyebrow light>{eyebrow}</Eyebrow> : null}
        {title ? (
          <h2 className="max-w-4xl text-4xl font-black uppercase leading-[0.95] tracking-tighter md:text-7xl">
            {title}
          </h2>
        ) : null}
        {subtitle ? (
          <p className="mt-6 max-w-xl text-sm font-light leading-relaxed text-zinc-300 md:text-base">
            {subtitle}
          </p>
        ) : null}
      </div>
    </section>
  );
};

const TextBlock: React.FC<{ content: Content }> = ({ content }) => {
  const eyebrow = text(content, 'eyebrow');
  const title = text(content, 'title');
  const body = text(content, 'body');
  const paragraphs = toLines(body);
  if (!title && paragraphs.length === 0) return null;

  return (
    <section className="bg-white py-20 text-black md:py-28">
      <div className="mx-auto max-w-3xl px-6 md:px-12">
        {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
        {title ? (
          <h2 className="text-3xl font-black uppercase leading-tight tracking-tight md:text-5xl">
            {title}
          </h2>
        ) : null}
        <div className="mt-8 space-y-5 text-base font-light leading-relaxed text-zinc-600 md:text-lg">
          {paragraphs.map((paragraph, index) => (
            <p key={index} className="whitespace-pre-line">
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
};

const ImageText: React.FC<{ content: Content }> = ({ content }) => {
  const image = text(content, 'image');
  const eyebrow = text(content, 'eyebrow');
  const title = text(content, 'title');
  const body = text(content, 'body');
  const position = text(content, 'imagePosition', 'left');
  const ctaLabel = text(content, 'ctaLabel');
  const ctaHref = text(content, 'ctaHref');

  if (!image && !title && !body) return null;

  return (
    <section className="bg-[#f4f4f2] py-20 text-black md:py-28">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-6 md:grid-cols-2 md:gap-16 md:px-12">
        <div
          className={`relative aspect-[4/5] overflow-hidden bg-zinc-200 ${
            position === 'right' ? 'md:order-2' : ''
          }`}
        >
          {image ? (
            <img
              src={image}
              alt={title ? `${title} — foldable travel bag` : 'Foldable travel bag'}
              width={800}
              height={1000}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          ) : null}
        </div>
        <div className={position === 'right' ? 'md:order-1' : ''}>
          {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
          {title ? (
            <h2 className="text-3xl font-black uppercase leading-tight tracking-tight md:text-5xl">
              {title}
            </h2>
          ) : null}
          {body ? (
            <div className="mt-6 space-y-4 text-base font-light leading-relaxed text-zinc-600">
              {toLines(body).map((paragraph, index) => (
                <p key={index} className="whitespace-pre-line">
                  {paragraph}
                </p>
              ))}
            </div>
          ) : null}
          {ctaLabel && ctaHref ? (
            <a
              href={ctaHref}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center gap-3 border border-black px-6 py-3 text-[11px] font-bold uppercase tracking-[0.25em] transition-colors hover:bg-black hover:text-white"
            >
              {ctaLabel}
            </a>
          ) : null}
        </div>
      </div>
    </section>
  );
};

const Specs: React.FC<{ content: Content }> = ({ content }) => {
  const title = text(content, 'title', 'Specifications');
  const rows = objects(content, 'rows').filter(
    (row) => text(row, 'label') || text(row, 'value'),
  );
  if (rows.length === 0) return null;

  return (
    <section className="bg-white py-20 text-black md:py-24">
      <div className="mx-auto max-w-4xl px-6 md:px-12">
        <h2 className="text-2xl font-black uppercase tracking-tight md:text-4xl">
          {title}
        </h2>
        <dl className="mt-10 divide-y divide-zinc-200 border-y border-zinc-200">
          {rows.map((row, index) => (
            <div
              key={index}
              className="grid grid-cols-1 gap-1 py-4 sm:grid-cols-3 sm:gap-6"
            >
              <dt className="text-[11px] font-bold uppercase tracking-[0.25em] text-zinc-500">
                {text(row, 'label')}
              </dt>
              <dd className="text-sm font-light text-zinc-900 sm:col-span-2">
                {text(row, 'value')}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
};

const Features: React.FC<{ content: Content }> = ({ content }) => {
  const title = text(content, 'title', 'Why this bag');
  const items = objects(content, 'items').filter(
    (item) => text(item, 'title') || text(item, 'body'),
  );
  if (items.length === 0) return null;

  return (
    <section className="bg-white py-20 text-black md:py-28">
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        <h2 className="max-w-2xl text-3xl font-black uppercase leading-tight tracking-tight md:text-5xl">
          {title}
        </h2>
        <div className="mt-12 grid grid-cols-1 gap-px bg-zinc-200 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, index) => {
            const Icon = ICONS[text(item, 'icon', 'shield')] ?? ShieldCheck;
            return (
              <div key={index} className="bg-white p-8">
                <Icon size={26} strokeWidth={1.5} className="text-black" />
                <h3 className="mt-6 text-lg font-bold uppercase tracking-wide">
                  {text(item, 'title')}
                </h3>
                <p className="mt-3 text-sm font-light leading-relaxed text-zinc-600">
                  {text(item, 'body')}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

const Gallery: React.FC<{ content: Content }> = ({ content }) => {
  const title = text(content, 'title', 'Gallery');
  const images = strings(content, 'images');
  if (images.length === 0) return null;

  return (
    <section className="bg-[#f4f4f2] py-20 text-black md:py-28">
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        {title ? (
          <h2 className="text-2xl font-black uppercase tracking-tight md:text-4xl">
            {title}
          </h2>
        ) : null}
        <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
          {images.map((image, index) => (
            <div
              key={`${image}-${index}`}
              className="aspect-[4/5] overflow-hidden bg-zinc-200"
            >
              <img
                src={image}
                alt={`${title} — image ${index + 1}`}
                width={800}
                height={1000}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Faq: React.FC<{ content: Content }> = ({ content }) => {
  const title = text(content, 'title', 'Questions, answered');
  const items = objects(content, 'items').filter(
    (item) => text(item, 'question') || text(item, 'answer'),
  );
  if (items.length === 0) return null;

  return (
    <section className="bg-white py-20 text-black md:py-28">
      <div className="mx-auto max-w-3xl px-6 md:px-12">
        <h2 className="text-2xl font-black uppercase tracking-tight md:text-4xl">
          {title}
        </h2>
        <div className="mt-10 border-t border-zinc-200">
          {items.map((item, index) => (
            <details
              key={index}
              className="group border-b border-zinc-200 py-5 [&::-webkit-details-marker]:hidden"
            >
              <summary className="flex cursor-pointer list-none items-start justify-between gap-6">
                <span className="text-sm font-bold uppercase tracking-wide">
                  {text(item, 'question')}
                </span>
                <Plus
                  size={18}
                  className="mt-0.5 shrink-0 transition-transform duration-300 group-open:rotate-45"
                />
              </summary>
              <p className="mt-4 text-sm font-light leading-relaxed text-zinc-600">
                {text(item, 'answer')}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
};

const Cta: React.FC<{ content: Content; product?: Product }> = ({
  content,
  product,
}) => {
  const eyebrow = text(content, 'eyebrow', 'MADE TO ORDER');
  const title = text(content, 'title');
  const body = text(content, 'body');
  const buttonLabel = text(content, 'buttonLabel', 'Ask on WhatsApp');
  if (!title && !body) return null;

  const message = product
    ? `Hi AERO-FOLD, I'm interested in the ${product.title}. Could you share availability, shipping and a quote?`
    : "Hi AERO-FOLD, I'd like to ask about one of your travel bags.";

  return (
    <section className="bg-[#0a0a0a] py-20 text-white md:py-28">
      <div className="mx-auto max-w-4xl px-6 text-center md:px-12">
        {eyebrow ? <Eyebrow light>{eyebrow}</Eyebrow> : null}
        {title ? (
          <h2 className="text-3xl font-black uppercase leading-tight tracking-tighter md:text-6xl">
            {title}
          </h2>
        ) : null}
        {body ? (
          <p className="mx-auto mt-6 max-w-2xl text-sm font-light leading-relaxed text-zinc-400 md:text-base">
            {body}
          </p>
        ) : null}
        <a
          href={whatsappLink(message)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-10 inline-flex items-center gap-3 bg-white px-8 py-4 text-[11px] font-bold uppercase tracking-[0.25em] text-black transition-transform hover:scale-[1.03]"
        >
          {buttonLabel}
        </a>
      </div>
    </section>
  );
};

export const SectionRenderer: React.FC<{
  section: DetailSection;
  product?: Product;
}> = ({ section, product }) => {
  switch (section.type) {
    case 'banner':
      return <Banner content={section.content} />;
    case 'text':
      return <TextBlock content={section.content} />;
    case 'imageText':
      return <ImageText content={section.content} />;
    case 'specs':
      return <Specs content={section.content} />;
    case 'features':
      return <Features content={section.content} />;
    case 'gallery':
      return <Gallery content={section.content} />;
    case 'faq':
      return <Faq content={section.content} />;
    case 'cta':
      return <Cta content={section.content} product={product} />;
    default:
      return null;
  }
};
