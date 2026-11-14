import { Router } from 'express';
import { createHash, timingSafeEqual } from 'node:crypto';
import {
  createSessionToken,
  parseCookies,
  SESSION_COOKIE,
  sessionCookieOptions,
  verifySessionToken,
} from '../lib/session.js';

const router = Router();

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const attempts = new Map<string, { count: number; resetAt: number }>();

function adminPassword(): string {
  const password = process.env.ADMIN_PASSWORD;
  if (password) return password;
  if (process.env.NODE_ENV === 'production') {
    throw new Error('[auth] ADMIN_PASSWORD is required in production');
  }
  return 'admin123';
}

function safeEqual(a: string, b: string): boolean {
  // Hash first so the comparison is always constant-time regardless of length.
  const left = createHash('sha256').update(a).digest();
  const right = createHash('sha256').update(b).digest();
  return timingSafeEqual(left, right);
}

router.post('/login', (req, res) => {
  const ip = req.ip ?? 'unknown';
  const now = Date.now();
  const entry = attempts.get(ip);
  if (entry && entry.resetAt > now && entry.count >= MAX_ATTEMPTS) {
    res
      .status(429)
      .json({ error: 'Too many attempts, please try again later' });
    return;
  }

  const password =
    typeof req.body?.password === 'string' ? req.body.password : '';
  if (!password || !safeEqual(password, adminPassword())) {
    const next =
      entry && entry.resetAt > now
        ? entry
        : { count: 0, resetAt: now + WINDOW_MS };
    next.count += 1;
    attempts.set(ip, next);
    res.status(401).json({ error: 'Invalid password' });
    return;
  }

  attempts.delete(ip);
  res.cookie(SESSION_COOKIE, createSessionToken('admin'), sessionCookieOptions());
  res.json({ user: 'admin' });
});

router.post('/logout', (_req, res) => {
  const { maxAge: _maxAge, ...clearOptions } = sessionCookieOptions();
  res.clearCookie(SESSION_COOKIE, clearOptions);
  res.json({ ok: true });
});

router.get('/me', (req, res) => {
  const token = parseCookies(req.headers.cookie)[SESSION_COOKIE];
  const session = verifySessionToken(token);
  if (!session) {
    res.json({ authenticated: false });
    return;
  }
  res.json({ authenticated: true, user: session.user });
});

export default router;
