export const WHATSAPP_NUMBER = '8613510961291';

export function whatsappLink(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function formatPrice(cents: number | null | undefined): string {
  if (!cents || cents <= 0) return 'Price on request';
  const hasCents = cents % 100 !== 0;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: hasCents ? 2 : 0,
  }).format(cents / 100);
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'aero-fold';
}

export function toLines(value: string): string[] {
  return value
    .split(/\n{2,}/)
    .map((line) => line.trim())
    .filter(Boolean);
}
