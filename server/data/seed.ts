/**
 * Initial catalogue used once, when the database is created empty.
 * It mirrors the original hard-coded gallery (32 products, remote images).
 */
const IMAGE_BASE =
  'https://raw.githubusercontent.com/knclj/picserver/vijery/bag_produts';

export interface SeedProduct {
  title: string;
  category: string;
  description: string;
  priceCents: number | null;
  image: string;
}

export function seedProducts(): SeedProduct[] {
  return Array.from({ length: 32 }, (_, i) => ({
    title: `Series ${String(i + 1).padStart(2, '0')}`,
    category: i % 2 === 0 ? 'Traveler' : 'Executive',
    description: '',
    priceCents: null,
    image: `${IMAGE_BASE}/800${i + 1}.jpg`,
  }));
}
