export interface ProductImage {
  id: number;
  url: string;
}

export interface Product {
  id: number;
  title: string;
  category: string;
  description: string;
  priceCents: number | null;
  published: boolean;
  sortOrder: number;
  images: ProductImage[];
  createdAt: string;
  updatedAt: string;
}

/** Payload accepted by the admin create/update endpoints. */
export interface ProductInput {
  title: string;
  category: string;
  description: string;
  priceCents: number | null;
  published: boolean;
  images: string[];
}

export interface LoginResponse {
  user: string;
}

export interface SessionStatus {
  authenticated: boolean;
  user?: string;
}

export const SECTION_TYPES = [
  'banner',
  'text',
  'imageText',
  'specs',
  'features',
  'gallery',
  'faq',
  'cta',
] as const;

export type SectionType = (typeof SECTION_TYPES)[number];

export interface DetailSection {
  id: string;
  type: SectionType;
  content: Record<string, unknown>;
}

export interface AdminProduct extends Product {
  isCustomized: boolean;
}

export interface ProductDetailResponse {
  product: Product;
  sections: DetailSection[];
  isCustomized: boolean;
}
