import { Router } from 'express';
import { mockUsers } from '../data/mock-users.js';
import { authMiddleware } from '../middleware/auth.js';
import type { LoginRequest, LoginResponse } from '../types.js';

const router = Router();

/**
 * POST /auth/login
 * Mock: accepts any email/password combo and returns tokens for the default user.
 */
router.post('/login', (req, res) => {
  const { email, password } = req.body as LoginRequest;

  if (!email || !password) {
    res.status(400).json({
      error: { status: 400, message: 'Email and password are required', code: 'VALIDATION_ERROR' },
    });
    return;
  }

  const user = mockUsers[0]; // always use default mock user

  const response: LoginResponse = {
    accessToken: `mock-access-${user.id}`,
    refreshToken: `mock-refresh-${user.id}`,
    expiresIn: 900, // 15 min
  };

  res.json(response);
});

/**
 * POST /auth/refresh
 * Validates the mock refresh token and returns a new token pair.
 */
router.post('/refresh', (req, res) => {
  const { refreshToken } = req.body as { refreshToken: string };

  if (!refreshToken?.startsWith('mock-refresh-')) {
    res.status(401).json({
      error: { status: 401, message: 'Invalid refresh token', code: 'INVALID_REFRESH_TOKEN' },
    });
    return;
  }

  const userId = refreshToken.replace('mock-refresh-', '');
  const user = mockUsers.find((u) => u.id === userId);

  if (!user) {
    res.status(401).json({
      error: { status: 401, message: 'Invalid refresh token', code: 'INVALID_REFRESH_TOKEN' },
    });
    return;
  }

  const response: LoginResponse = {
    accessToken: `mock-access-${user.id}`,
    refreshToken: `mock-refresh-${user.id}`,
    expiresIn: 900,
  };

  res.json(response);
});

/**
 * GET /auth/me
 * Returns the authenticated user's profile (without password).
 */
router.get('/me', authMiddleware, (req, res) => {
  const userId = (req as any).userId as string;
  const user = mockUsers.find((u) => u.id === userId);

  if (!user) {
    res.status(404).json({
      error: { status: 404, message: 'User not found', code: 'NOT_FOUND' },
    });
    return;
  }

  const { password, ...profile } = user;
  res.json(profile);
});

export default router;
