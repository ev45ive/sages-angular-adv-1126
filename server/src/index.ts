import express from 'express';
import cors from 'cors';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';
import swaggerUi from 'swagger-ui-express';

import authRoutes from './routes/auth.js';
import contactsRoutes from './routes/contacts.js';
import dealsRoutes from './routes/deals.js';
import tasksRoutes from './routes/tasks.js';
import { errorHandler } from './middleware/error.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env['PORT'] ?? 3000;

// ─── Global middleware ────────────────────────────────
app.use(cors());
app.use(express.json());

// ─── OpenAPI / Swagger UI ─────────────────────────────
const openapiPath = join(__dirname, '..', 'openapi.yaml');
const openapiDoc = YAML.parse(readFileSync(openapiPath, 'utf-8'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapiDoc));

// ─── API routes ───────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/contacts', contactsRoutes);
app.use('/api/deals', dealsRoutes);
app.use('/api/deals/:dealId/tasks', tasksRoutes);

// ─── Error handler (must be last) ─────────────────────
app.use(errorHandler as any);

// ─── Start ────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 CRM API server running at http://localhost:${PORT}/api`);
  console.log(`📖 Swagger UI at http://localhost:${PORT}/api-docs`);
});
