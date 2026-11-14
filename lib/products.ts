import type { Product, ProductDetailResponse } from '../types/product';

// 客户端请求统一走 Vite 代理的 /api 前缀（开发环境指向 Express API）。
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';

export class ProductNotFoundError extends Error {
  constructor() {
    super('Product not found');
    this.name = 'ProductNotFoundError';
  }
}

export async function fetchProducts(): Promise<Product[]> {
  const res = await fetch(`${API_BASE}/api/products`);
  if (!res.ok) {
    throw new Error(`Failed to load products (${res.status})`);
  }
  return res.json();
}

export async function fetchProduct(
  id: string | number,
  options: { preview?: boolean } = {},
): Promise<ProductDetailResponse> {
  const query = options.preview ? '?preview=1' : '';
  const res = await fetch(
    `${API_BASE}/api/products/${encodeURIComponent(id)}${query}`,
  );
  if (res.status === 404) throw new ProductNotFoundError();
  if (!res.ok) {
    throw new Error(`Failed to load product (${res.status})`);
  }
  return res.json();
}
