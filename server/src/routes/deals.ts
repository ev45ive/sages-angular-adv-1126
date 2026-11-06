import { Response, Router } from 'express';
import { store } from '../store.js';
import { authMiddleware } from '../middleware/auth.js';
import type { DealCreateRequest, DealStage, DealUpdateRequest } from '../types.js';

const router = Router();

router.use(authMiddleware);

const STAGES: DealStage[] = ['new', 'negotiation', 'proposal', 'closed-won', 'closed-lost'];

function validationError(res: Response, message: string): void {
  res.status(400).json({ error: { status: 400, message, code: 'VALIDATION_ERROR' } });
}

/**
 * GET /deals?contactId=
 * List deals (without embedded tasks), optionally only those of one contact.
 */
router.get('/', (req, res) => {
  const contactId = req.query.contactId as string | undefined;
  res.json(store.getDeals(contactId));
});

/**
 * POST /deals
 * Create a deal. Tasks are managed via the /tasks sub-resource.
 */
router.post('/', (req, res) => {
  const data = req.body as DealCreateRequest;

  if (!data.title?.trim()) return validationError(res, 'Deal title is required');
  if (!data.contactId) return validationError(res, 'Deal contactId is required');
  if (!store.getContact(data.contactId)) return validationError(res, 'Contact not found');
  if (data.stage && !STAGES.includes(data.stage)) return validationError(res, 'Invalid stage');
  if (data.value !== undefined && !(data.value >= 0)) return validationError(res, 'Invalid value');

  res.status(201).json(store.createDeal(data));
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
