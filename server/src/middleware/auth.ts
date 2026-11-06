import type { Request, Response, NextFunction } from 'express';

/**
 * Mock auth middleware.
 * Validates that the Authorization header contains a Bearer token
 * with the prefix `mock-access-`. Attaches `userId` to the request.
 */
export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;

  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({
      error: { status: 401, message: 'Missing or invalid authorization header', code: 'UNAUTHORIZED' },
    });
    return;
  }

  const token = header.slice(7);

  if (!token.startsWith('mock-access-')) {
    res.status(403).json({
      error: { status: 403, message: 'Invalid access token', code: 'UNAUTHORIZED' },
    });
    return;
  }

  // Attach the user id extracted from the mock token
  (req as any).userId = token.replace('mock-access-', '');
  next();
}
