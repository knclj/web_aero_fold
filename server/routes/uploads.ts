import { Router } from 'express';
import multer, { MulterError } from 'multer';
import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { requireAuth } from '../middleware/require-auth.js';
import { UPLOAD_DIR } from '../lib/upload-files.js';

const MAX_FILE_BYTES = 8 * 1024 * 1024;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_BYTES, files: 1 },
});

interface ImageSignature {
  ext: string;
  mime: string;
  matches: (buffer: Buffer) => boolean;
}

const SIGNATURES: ImageSignature[] = [
  {
    ext: '.jpg',
    mime: 'image/jpeg',
    matches: (b) => b.length > 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  },
  {
    ext: '.png',
    mime: 'image/png',
    matches: (b) =>
      b.length > 8 &&
      b[0] === 0x89 &&
      b[1] === 0x50 &&
      b[2] === 0x4e &&
      b[3] === 0x47,
  },
  {
    ext: '.gif',
    mime: 'image/gif',
    matches: (b) => b.length > 6 && b.subarray(0, 4).toString('ascii') === 'GIF8',
  },
  {
    ext: '.webp',
    mime: 'image/webp',
    matches: (b) =>
      b.length > 12 &&
      b.subarray(0, 4).toString('ascii') === 'RIFF' &&
      b.subarray(8, 12).toString('ascii') === 'WEBP',
  },
  {
    ext: '.avif',
    mime: 'image/avif',
    matches: (b) =>
      b.length > 12 &&
      b.subarray(4, 8).toString('ascii') === 'ftyp' &&
      ['avif', 'avis'].includes(b.subarray(8, 12).toString('ascii')),
  },
];

function detectImage(buffer: Buffer): ImageSignature | null {
  return SIGNATURES.find((signature) => signature.matches(buffer)) ?? null;
}

const router = Router();

router.use(requireAuth);

router.post('/', (req, res) => {
  upload.single('file')(req, res, async (error: unknown) => {
    if (error) {
      const message =
        error instanceof MulterError && error.code === 'LIMIT_FILE_SIZE'
          ? '图片不能超过 8MB'
          : '上传失败，请重试';
      res.status(400).json({ error: message });
      return;
    }

    const file = req.file;
    if (!file) {
      res.status(400).json({ error: '请选择要上传的图片' });
      return;
    }

    const format = detectImage(file.buffer);
    if (!format) {
      res.status(400).json({
        error: '仅支持 JPG、PNG、WebP、GIF 或 AVIF 图片',
      });
      return;
    }

    const filename = `${randomUUID()}${format.ext}`;
    try {
      await writeFile(path.join(UPLOAD_DIR, filename), file.buffer);
    } catch (err) {
      console.error('[uploads] Failed to write file:', err);
      res.status(500).json({ error: '保存图片失败，请重试' });
      return;
    }

    res.status(201).json({
      url: `/uploads/${filename}`,
      size: file.size,
      mime: format.mime,
    });
  });
});

export default router;
