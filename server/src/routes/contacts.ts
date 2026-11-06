import { Router } from 'express';
import { store } from '../store.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.use(authMiddleware);

/**
 * GET /contacts?q=&offset=&limit=
 * Search contacts by name, email, or company.
 */
router.get('/', (req, res) => {
  const q = req.query.q as string | undefined;
  const offset = parseInt(req.query.offset as string) || 0;
  const limit = parseInt(req.query.limit as string) || 20;

  const result = store.searchContacts(q, offset, limit);
  res.json({ contacts: result });
});

/**
 * GET /contacts/check-email?email=
 * Returns { exists: boolean } — used by async form validators.
 * MUST be registered before /:contactId to avoid route collision.
 */
router.get('/check-email', (req, res) => {
  const email = req.query.email as string;

  if (!email) {
    res.status(400).json({
      error: { status: 400, message: 'Email query parameter is required', code: 'VALIDATION_ERROR' },
    });
    return;
  }

  res.json({ exists: store.checkEmail(email) });
});

/**
 * GET /contacts/:contactId
 * Get a single contact by ID.
 */
router.get('/:contactId', (req, res) => {
  const contact = store.getContact(req.params.contactId);

  if (!contact) {
    res.status(404).json({
      error: { status: 404, message: 'Contact not found', code: 'NOT_FOUND' },
    });
    return;
  }

  res.json(contact);
});

export default router;
