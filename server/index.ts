import express, { type ErrorRequestHandler } from 'express';
import cors from 'cors';
import productsRouter from './routes/products.js';
import authRouter from './routes/auth.js';
import adminRouter from './routes/admin.js';
import uploadsRouter from './routes/uploads.js';
import { UPLOAD_DIR } from './lib/upload-files.js';
import { scheduleSeoRefresh } from './seo/generate.js';

const app = express();
const PORT = Number(process.env.PORT) || 3001;
const HOST = process.env.HOST || '0.0.0.0';
const isProduction = process.env.NODE_ENV === 'production';

if (isProduction) {
  // Needed for correct req.ip (login rate limiting) behind a reverse proxy.
  app.set('trust proxy', 1);
} else {
  // Dev convenience only; Vite proxies /api in normal development.
  app.use(cors({ origin: true, credentials: true }));
}

app.use(express.json({ limit: '1mb' }));
app.use(
  '/uploads',
  express.static(UPLOAD_DIR, { maxAge: '30d', immutable: true, index: false }),
);

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.use('/api/products', productsRouter);
app.use('/api/auth', authRouter);
// Regenerate the crawlable static pages after successful admin mutations.
app.use('/api/admin', (req, res, next) => {
  if (req.method !== 'GET') {
    res.on('finish', () => {
      if (res.statusCode >= 200 && res.statusCode < 400) scheduleSeoRefresh();
    });
  }
  next();
});
app.use('/api/admin', adminRouter);
app.use('/api/admin/uploads', uploadsRouter);

app.use('/api', (_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  console.error('[api] Unhandled error:', err);
  if (res.headersSent) return;
  const status =
    typeof (err as { status?: unknown })?.status === 'number'
      ? (err as { status: number }).status
      : 500;
  res.status(status).json({
    error:
      status === 400
        ? 'Invalid request body'
        : (err as Error)?.message || 'Internal Server Error',
  });
};
app.use(errorHandler);

if (!isProduction && !process.env.ADMIN_PASSWORD) {
  console.warn(
    '[auth] ADMIN_PASSWORD is not set — the admin password is "admin123" (dev only).',
  );
}
if (!isProduction && !process.env.AUTH_SECRET) {
  console.warn(
    '[auth] AUTH_SECRET is not set — using the insecure development secret.',
  );
}

const server = app.listen(PORT, HOST, () => {
  console.log(`API server running at http://localhost:${PORT}`);
});

// Keep dist/ in sync with the database (no-op if dist has not been built yet).
scheduleSeoRefresh();

server.on('error', (err: NodeJS.ErrnoException) => {
  if (err.code === 'EADDRINUSE') {
    console.error(
      `\n[api] Port ${PORT} is already in use.\n` +
        `[api] Stop the process using it (e.g. "lsof -i :${PORT}" or "fuser -k ${PORT}/tcp") and retry.\n`
    );
  } else {
    console.error('[api] Failed to start:', err);
  }
  process.exit(1);
});
