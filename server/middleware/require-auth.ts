import type { RequestHandler } from 'express';
import {
  parseCookies,
  SESSION_COOKIE,
  verifySessionToken,
} from '../lib/session.js';

export const requireAuth: RequestHandler = (req, res, next) => {
  const token = parseCookies(req.headers.cookie)[SESSION_COOKIE];
  if (!verifySessionToken(token)) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  next();
};
