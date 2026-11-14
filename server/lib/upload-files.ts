import { mkdirSync } from 'node:fs';
import { unlink } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { imageReferenceCount } from '../db.js';

export const UPLOAD_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../uploads',
);

mkdirSync(UPLOAD_DIR, { recursive: true });

const UPLOAD_NAME = /^[0-9a-f-]{36}\.(jpe?g|png|gif|webp|avif)$/i;

/**
 * Deletes locally stored images that are no longer referenced by any product.
 * External URLs and invalid names are ignored.
 */
export async function cleanupUnusedUploads(urls: string[]): Promise<void> {
  for (const url of urls) {
    if (!url.startsWith('/uploads/')) continue;
    const name = path.basename(url);
    if (!UPLOAD_NAME.test(name)) continue;
    if (imageReferenceCount(url) > 0) continue;
    await unlink(path.join(UPLOAD_DIR, name)).catch(() => {
      // Already gone or not writable — nothing else to do.
    });
  }
}
