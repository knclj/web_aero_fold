import { Router } from 'express';
import {
  getDetailSections,
  getProduct,
  hasCustomDetail,
  listProducts,
} from '../db.js';
import { parseCookies, SESSION_COOKIE, verifySessionToken } from '../lib/session.js';

const router = Router();

router.get('/', (_req, res) => {
  res.json(listProducts(false));
});

router.get('/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    res.status(404).json({ error: 'Product not found' });
    return;
  }

  // The admin editor embeds /product/:id in an iframe while previewing an
  // unpublished product, which is allowed only for a valid admin session.
  const preview = req.query.preview === '1';
  const session = preview
    ? verifySessionToken(parseCookies(req.headers.cookie)[SESSION_COOKIE])
    : null;

  const product = getProduct(id, Boolean(session));
  if (!product) {
    res.status(404).json({ error: 'Product not found' });
    return;
  }

  res.json({
    product,
    sections: getDetailSections(id),
    isCustomized: hasCustomDetail(id),
  });
});

export default router;
