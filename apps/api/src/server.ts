import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createApiApp } from './bootstrap/createApiApp.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, '..', 'public');
const port = Number(process.env.PORT) || 8080;

let persistenceReady = false;

async function start(): Promise<void> {
  const app = express();

  app.get('/health', (_request, response) => {
    response.status(persistenceReady ? 200 : 503).json({
      status: persistenceReady ? 'ok' : 'starting',
    });
  });

  try {
    await createApiApp(app, publicDir);
    persistenceReady = true;
  } catch (error) {
    console.error('Failed to initialize application:', error);
    process.exit(1);
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Server listening on port ${port}`);
  });
}

void start().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
