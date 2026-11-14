import type {
  DetailSection,
  Product,
  SectionType,
} from '../types/product';

export type FieldKind = 'text' | 'textarea' | 'select' | 'image' | 'images' | 'list';

export interface FieldOption {
  label: string;
  value: string;
}

export interface FieldDef {
  key: string;
  label: string;
  kind: FieldKind;
  placeholder?: string;
  help?: string;
  rows?: number;
  options?: FieldOption[];
  /** For `list` fields: label of one item and the fields inside each item. */
  itemLabel?: string;
  itemFields?: FieldDef[];
  newItem?: () => Record<string, unknown>;
}

export interface SectionDefinition {
  type: SectionType;
  label: string;
  description: string;
  create: (product: Product) => Record<string, unknown>;
  fields: FieldDef[];
}

export const FEATURE_ICONS: FieldOption[] = [
  { label: '盾牌 / 耐用', value: 'shield' },
  { label: '闪电 / 轻量', value: 'zap' },
  { label: '层叠 / 收纳', value: 'layers' },
  { label: '地球 / 出行', value: 'globe' },
  { label: '包裹 / 容量', value: 'package' },
  { label: '奖章 / 品质', value: 'award' },
  { label: '卡车 / 物流', value: 'truck' },
  { label: '标签 / 定制', value: 'tag' },
];

const eyebrowField: FieldDef = {
  key: 'eyebrow',
  label: '眉题（小字）',
  kind: 'text',
  placeholder: '例如：CRAFTSMANSHIP',
};

const titleField: FieldDef = {
  key: 'title',
  label: '标题',
  kind: 'text',
  placeholder: '区块标题',
};

const bodyField: FieldDef = {
  key: 'body',
  label: '正文',
  kind: 'textarea',
  rows: 7,
  placeholder: '支持多段：空一行即分段',
};

function imageField(key = 'image', label = '图片地址'): FieldDef {
  return {
    key,
    label,
    kind: 'image',
    placeholder: 'https://…',
    help: '填写图片外链地址，右侧可预览。',
  };
}

export const SECTION_DEFS: Record<SectionType, SectionDefinition> = {
  banner: {
    type: 'banner',
    label: '横幅大图',
    description: '整屏宽度的图片 + 大标题，适合开场或主题氛围。',
    create: (product) => ({
      eyebrow: 'AERO-FOLD',
      title: 'Built for the journey',
      subtitle: 'A new standard for travel, designed around the way you move.',
      image: product.images[0]?.url ?? '',
    }),
    fields: [
      eyebrowField,
      titleField,
      {
        key: 'subtitle',
        label: '副标题',
        kind: 'textarea',
        rows: 3,
        placeholder: '一句话说明',
      },
      imageField(),
    ],
  },

  text: {
    type: 'text',
    label: '文字段落',
    description: '居中的标题 + 多段正文，适合讲故事或介绍材质。',
    create: (product) => ({
      eyebrow: product.category || 'THE STORY',
      title: 'Designed with intent',
      body:
        product.description ||
        'Tell the story behind this product — the materials, the details, and why it was made.',
    }),
    fields: [eyebrowField, titleField, bodyField],
  },

  imageText: {
    type: 'imageText',
    label: '图文左右',
    description: '左图右文（或反之），带可选按钮，适合细节展开。',
    create: (product) => ({
      eyebrow: 'CRAFTSMANSHIP',
      title: 'Every detail, considered',
      body:
        product.description ||
        'Describe the details that make this piece different: the shell, the stitching, the hardware.',
      image: product.images[0]?.url ?? '',
      imagePosition: 'left',
      ctaLabel: '',
      ctaHref: '',
    }),
    fields: [
      eyebrowField,
      titleField,
      bodyField,
      imageField(),
      {
        key: 'imagePosition',
        label: '图片位置',
        kind: 'select',
        options: [
          { label: '左侧', value: 'left' },
          { label: '右侧', value: 'right' },
        ],
      },
      {
        key: 'ctaLabel',
        label: '按钮文字（可选）',
        kind: 'text',
        placeholder: '例如：ASK ABOUT THIS BAG',
      },
      {
        key: 'ctaHref',
        label: '按钮链接（可选）',
        kind: 'text',
        placeholder: 'https://wa.me/… 或 /product/1',
      },
    ],
  },

  specs: {
    type: 'specs',
    label: '产品参数',
    description: '两列表格：尺寸、重量、材质、容量等硬指标。',
    create: () => ({ title: 'Specifications', rows: [] }),
    fields: [
      titleField,
      {
        key: 'rows',
        label: '参数行',
        kind: 'list',
        itemLabel: '一行参数',
        itemFields: [
          { key: 'label', label: '名称', kind: 'text', placeholder: 'Capacity' },
          { key: 'value', label: '数值', kind: 'text', placeholder: '38 L' },
        ],
        newItem: () => ({ label: '', value: '' }),
      },
    ],
  },

  features: {
    type: 'features',
    label: '卖点卡片',
    description: '三列图标卡片，适合罗列 3–6 个核心卖点。',
    create: () => ({ title: 'Why this bag', items: [] }),
    fields: [
      titleField,
      {
        key: 'items',
        label: '卖点',
        kind: 'list',
        itemLabel: '一个卖点',
        itemFields: [
          {
            key: 'icon',
            label: '图标',
            kind: 'select',
            options: FEATURE_ICONS,
          },
          { key: 'title', label: '标题', kind: 'text', placeholder: 'Cabin friendly' },
          {
            key: 'body',
            label: '说明',
            kind: 'textarea',
            rows: 3,
            placeholder: '一两句话说明这个卖点。',
          },
        ],
        newItem: () => ({ icon: 'shield', title: '', body: '' }),
      },
    ],
  },

  gallery: {
    type: 'gallery',
    label: '图片画廊',
    description: '多图网格，适合展示不同角度、配色与上身效果。',
    create: (product) => ({
      title: 'Gallery',
      images: product.images.map((image) => image.url).slice(0, 12),
    }),
    fields: [
      titleField,
      {
        key: 'images',
        label: '图片',
        kind: 'images',
        help: '可添加多张图片地址，按顺序展示。',
      },
    ],
  },

  faq: {
    type: 'faq',
    label: '常见问题',
    description: '可折叠的问答列表，减少来回沟通。',
    create: () => ({ title: 'Questions, answered', items: [] }),
    fields: [
      titleField,
      {
        key: 'items',
        label: '问答',
        kind: 'list',
        itemLabel: '一组问答',
        itemFields: [
          {
            key: 'question',
            label: '问题',
            kind: 'text',
            placeholder: 'Can it fit in an overhead bin?',
          },
          {
            key: 'answer',
            label: '回答',
            kind: 'textarea',
            rows: 3,
            placeholder: '给出清晰、简短的回答。',
          },
        ],
        newItem: () => ({ question: '', answer: '' }),
      },
    ],
  },

  cta: {
    type: 'cta',
    label: '询价行动区',
    description: '深色收尾区块，带 WhatsApp 按钮，适合放在页面最后。',
    create: (product) => ({
      eyebrow: 'MADE TO ORDER',
      title: 'Interested in this piece?',
      body: `Tell us where you are travelling and how you pack. We will reply with availability, shipping options and a final quote for the ${product.title}.`,
      buttonLabel: 'Ask on WhatsApp',
    }),
    fields: [
      eyebrowField,
      titleField,
      {
        key: 'body',
        label: '正文',
        kind: 'textarea',
        rows: 4,
        placeholder: '说明下一步如何联系你。',
      },
      {
        key: 'buttonLabel',
        label: '按钮文字',
        kind: 'text',
        placeholder: 'Ask on WhatsApp',
      },
    ],
  },
};

export const SECTION_LIST: SectionDefinition[] = Object.values(SECTION_DEFS);

function newId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `sec-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createSection(
  type: SectionType,
  product: Product,
): DetailSection {
  return {
    id: newId(),
    type,
    content: SECTION_DEFS[type].create(product),
  };
}

/** Default detail page used until an admin saves a custom layout. */
export function defaultSections(product: Product): DetailSection[] {
  const sections: DetailSection[] = [];
  if (product.description?.trim()) {
    sections.push(createSection('text', product));
  }
  if (product.images.length > 1) {
    sections.push(createSection('gallery', product));
  }
  sections.push(createSection('cta', product));
  return sections;
}
