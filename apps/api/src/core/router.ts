import { Router } from 'express';
import { healthRoutes } from '../modules/health/index.js';
import { chatRoutes } from '../modules/chat/index.js';

export function createApiRouter(): Router {
  const router = Router();

  router.use('/health', healthRoutes);
  router.use('/chat', chatRoutes);

  return router;
}
