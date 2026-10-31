import { createApp } from './app.js';
import { config } from './core/config.js';

const app = createApp();

const server = app.listen(config.PORT, () => {
  console.log(`[API Server] Running on http://localhost:${config.PORT} (${config.NODE_ENV})`);
});

const shutdown = (signal: string) => {
  console.log(`[API Server] Received ${signal}. Shutting down gracefully...`);
  server.close(() => {
    console.log('[API Server] Closed HTTP connections. Exiting.');
    process.exit(0);
  });

  setTimeout(() => {
    console.error('[API Server] Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000).unref();
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
