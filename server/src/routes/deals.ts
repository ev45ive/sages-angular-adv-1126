import { Router } from 'express';
import { store } from '../store.js';
import { authMiddleware } from '../middleware/auth.js';
import type { DealUpdateRequest } from '../types.js';

const router = Router();

router.use(authMiddleware);

/**
 * GET /deals
 * List all deals (without embedded tasks).
 */
router.get('/', (_req, res) => {
  res.json(store.getDeals());
});

/**
 * GET /deals/:dealId
 * Get a single deal by ID (without embedded tasks).
 */
router.get('/:dealId', (req, res) => {
  const deal = store.getDeal(req.params.dealId);

  if (!deal) {
    res.status(404).json({
      error: { status: 404, message: 'Deal not found', code: 'NOT_FOUND' },
    });
    return;
  }

  res.json(deal);
});

/**
 * PUT /deals/:dealId
 * Update deal fields. Tasks are managed via the /tasks sub-resource.
 */
router.put('/:dealId', (req, res) => {
  const updated = store.updateDeal(req.params.dealId, req.body as DealUpdateRequest);

  if (!updated) {
    res.status(404).json({
      error: { status: 404, message: 'Deal not found', code: 'NOT_FOUND' },
    });
    return;
  }

  res.json(updated);
});

export default router;
