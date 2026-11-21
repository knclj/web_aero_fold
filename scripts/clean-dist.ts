import { readdir, rm } from 'node:fs/promises';
import path from 'node:path';

/**
 * Clear Vite build output before a production build.
 *
 * Vite's `emptyOutDir` deletes every entry in `dist/`, including the immutable
 * `.user.ini` that BT Panel (宝塔) creates at the site root. That file usually
 * has `chattr +i`, so deletion fails with EPERM and the whole build aborts.
 *
 * This script removes normal build artifacts but deliberately keeps dotfiles
 * and dot-directories (`.user.ini`, `.well-known`, `.htaccess`). Vite is then
 * configured with `emptyOutDir: false`, so it only adds the new build.
 */
const distDir = path.resolve(process.env.SEO_DIST_DIR || 'dist');

let entries: string[];
try {
  entries = await readdir(distDir);
} catch (error) {
  if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
    process.exit(0);
  }
  throw error;
}

let removed = 0;
for (const entry of entries) {
  if (entry.startsWith('.')) continue;
  await rm(path.join(distDir, entry), { recursive: true, force: true });
  removed += 1;
}

console.log(`[clean] Removed ${removed} build output(s) from ${distDir}; kept dotfiles.`);
