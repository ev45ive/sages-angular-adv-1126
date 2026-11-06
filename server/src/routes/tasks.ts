import { Router } from 'express';
import { store } from '../store.js';
import { authMiddleware } from '../middleware/auth.js';
import type { TaskCreateRequest, TaskUpdateRequest } from '../types.js';

// mergeParams: true → inherits :dealId from the parent mount point
const router = Router({ mergeParams: true });

router.use(authMiddleware);

/**
 * GET /deals/:dealId/tasks
 * List all tasks for a deal.
 */
router.get('/', (req, res) => {
  const { dealId } = req.params as any;
  const tasks = store.getTasks(dealId);

  if (!tasks) {
    res.status(404).json({
      error: { status: 404, message: 'Deal not found', code: 'NOT_FOUND' },
    });
    return;
  }

  res.json(tasks);
});

/**
 * POST /deals/:dealId/tasks
 * Create a new task within a deal.
 */
router.post('/', (req, res) => {
  const data = req.body as TaskCreateRequest;

  if (!data.title) {
    res.status(400).json({
      error: { status: 400, message: 'Task title is required', code: 'VALIDATION_ERROR' },
    });
    return;
  }

  const task = store.addTask(req.params.dealId, data);

  if (!task) {
    res.status(404).json({
      error: { status: 404, message: 'Deal not found', code: 'NOT_FOUND' },
    });
    return;
  }

  res.status(201).json(task);
});

/**
 * PATCH /deals/:dealId/tasks/:taskId
 * Update a task (toggle complete, edit fields).
 */
router.patch('/:taskId', (req, res) => {
  const updated = store.updateTask(
    req.params.dealId,
    req.params.taskId,
    req.body as TaskUpdateRequest,
  );

  if (!updated) {
    res.status(404).json({
      error: { status: 404, message: 'Task not found', code: 'NOT_FOUND' },
    });
    return;
  }

  res.json(updated);
});

/**
 * DELETE /deals/:dealId/tasks/:taskId
 * Remove a task from a deal.
 */
router.delete('/:taskId', (req, res) => {
  const deleted = store.deleteTask(req.params.dealId, req.params.taskId);

  if (!deleted) {
    res.status(404).json({
      error: { status: 404, message: 'Task not found', code: 'NOT_FOUND' },
    });
    return;
  }

  res.status(204).send();
});

export default router;
