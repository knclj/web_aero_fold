import type {
  AdminProduct,
  DetailSection,
  LoginResponse,
  Product,
  ProductDetailResponse,
  ProductInput,
  SessionStatus,
} from '../types/product';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    ...(typeof init.body === 'string'
      ? { 'Content-Type': 'application/json' }
      : {}),
    ...((init.headers as Record<string, string> | undefined) ?? {}),
  };

  const res = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    ...init,
    headers,
  });

  if (res.status === 204) return undefined as T;

  const data = (await res.json().catch(() => null)) as
    | { error?: string }
    | null;

  if (!res.ok) {
    throw new ApiError(
      data?.error ?? `Request failed (${res.status})`,
      res.status,
    );
  }
  return data as T;
}

export const adminApi = {
  login(password: string): Promise<LoginResponse> {
    return request<LoginResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ password }),
    });
  },

  logout(): Promise<{ ok: boolean }> {
    return request('/api/auth/logout', { method: 'POST' });
  },

  me(): Promise<SessionStatus> {
    return request<SessionStatus>('/api/auth/me');
  },

  listProducts(): Promise<AdminProduct[]> {
    return request<AdminProduct[]>('/api/admin/products');
  },

  createProduct(
    input: ProductInput,
  ): Promise<{ product: Product; isCustomized: boolean }> {
    return request('/api/admin/products', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  updateProduct(
    id: string | number,
    input: ProductInput,
  ): Promise<{
    product: Product;
    isCustomized: boolean;
    removedImages: string[];
  }> {
    return request(`/api/admin/products/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    });
  },

  deleteProduct(id: string | number): Promise<{ ok: boolean }> {
    return request(`/api/admin/products/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  },

  reorderProducts(ids: number[]): Promise<{ ok: boolean }> {
    return request('/api/admin/products/order', {
      method: 'PUT',
      body: JSON.stringify({ ids }),
    });
  },

  uploadImage(file: File): Promise<{ url: string; size: number; mime: string }> {
    const body = new FormData();
    body.append('file', file);
    return request('/api/admin/uploads', { method: 'POST', body });
  },

  getProduct(id: string | number): Promise<ProductDetailResponse> {
    return request<ProductDetailResponse>(
      `/api/admin/products/${encodeURIComponent(id)}`,
    );
  },

  saveSections(
    id: string | number,
    sections: DetailSection[],
  ): Promise<{ sections: DetailSection[]; isCustomized: boolean }> {
    return request(`/api/admin/products/${encodeURIComponent(id)}/sections`, {
      method: 'PUT',
      body: JSON.stringify({ sections }),
    });
  },

  resetSections(
    id: string | number,
  ): Promise<{ sections: DetailSection[]; isCustomized: boolean }> {
    return request(`/api/admin/products/${encodeURIComponent(id)}/sections`, {
      method: 'DELETE',
    });
  },
};
