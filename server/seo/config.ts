import fs from 'node:fs';
import path from 'node:path';
import { normalizeSiteUrl } from '../../lib/seo-data.js';

function loadDotEnv(): void {
  const file = path.resolve(process.cwd(), '.env');
  if (!fs.existsSync(file)) return;
  let raw = '';
  try {
    raw = fs.readFileSync(file, 'utf8');
  } catch {
    return;
  }
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const match = /^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/.exec(trimmed);
    if (!match) continue;
    const key = match[1];
    if (process.env[key] !== undefined) continue;
    let value = match[2].trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}

loadDotEnv();

/** Public site origin, e.g. https://www.aero-fold.com ('' when not configured). */
export function siteUrl(): string {
  return normalizeSiteUrl(process.env.SITE_URL || process.env.VITE_SITE_URL);
}

export function distDir(): string {
  return path.resolve(process.cwd(), process.env.SEO_DIST_DIR || 'dist');
}

export function seoStateDir(): string {
  return path.resolve(process.cwd(), process.env.SEO_STATE_DIR || '.seo');
}

export function autoRefreshEnabled(): boolean {
  return process.env.SEO_AUTO_REFRESH !== 'false';
}
