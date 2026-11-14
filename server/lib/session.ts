import { createHmac, timingSafeEqual } from 'node:crypto';

const isProduction = process.env.NODE_ENV === 'production';
const DEV_SECRET = 'webfold-dev-only-secret-change-me';

export const SESSION_COOKIE = 'wf_session';
export const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function secret(): string {
  const value = process.env.AUTH_SECRET;
  if (value && value.length >= 16) return value;
  if (isProduction) {
    throw new Error(
      '[auth] AUTH_SECRET (at least 16 characters) is required in production',
    );
  }
  return DEV_SECRET;
}

export function createSessionToken(user = 'admin'): string {
  const payload = Buffer.from(
    JSON.stringify({ u: user, exp: Date.now() + SESSION_TTL_MS }),
  ).toString('base64url');
  const signature = createHmac('sha256', secret())
    .update(payload)
    .digest('base64url');
  return `${payload}.${signature}`;
}

export function verifySessionToken(
  token: string | null | undefined,
): { user: string } | null {
  if (!token) return null;
  const [payload, signature] = token.split('.');
  if (!payload || !signature) return null;

  const expected = createHmac('sha256', secret()).update(payload).digest();
  let actual: Buffer;
  try {
    actual = Buffer.from(signature, 'base64url');
  } catch {
    return null;
  }
  if (
    actual.length !== expected.length ||
    !timingSafeEqual(actual, expected)
  ) {
    return null;
  }

  try {
    const data = JSON.parse(
      Buffer.from(payload, 'base64url').toString('utf8'),
    ) as { u?: unknown; exp?: unknown };
    if (typeof data.exp !== 'number' || data.exp < Date.now()) return null;
    return { user: typeof data.u === 'string' ? data.u : 'admin' };
  } catch {
    return null;
  }
}

export function parseCookies(
  header: string | undefined,
): Record<string, string> {
  const cookies: Record<string, string> = {};
  if (!header) return cookies;
  for (const part of header.split(';')) {
    const index = part.indexOf('=');
    if (index < 0) continue;
    const key = part.slice(0, index).trim();
    const value = part.slice(index + 1).trim();
    if (!key) continue;
    try {
      cookies[key] = decodeURIComponent(value);
    } catch {
      cookies[key] = value;
    }
  }
  return cookies;
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: isProduction,
    path: '/',
    maxAge: SESSION_TTL_MS,
  };
}
