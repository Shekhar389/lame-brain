import express, { type Express } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { config } from './core/config.js';
import { createApiRouter } from './core/router.js';
import { errorHandler } from './core/middleware/error-handler.middleware.js';
import { NotFoundError } from './core/errors.js';

export function createApp(): Express {
  const app = express();

  // Security and utilities middleware
  app.use(helmet());
  app.use(
    cors({
      origin: config.CORS_ORIGIN,
      credentials: true,
    })
  );
  app.use(express.json());

  // Mount API modules under /api/v1
  app.use('/api/v1', createApiRouter());

  // Catch unmatched routes and forward to error handler
  app.use((req, _res, next) => {
    next(new NotFoundError('Endpoint', `${req.method} ${req.originalUrl}`));
  });

  // Global centralized error handler
  app.use(errorHandler);

  return app;
}
