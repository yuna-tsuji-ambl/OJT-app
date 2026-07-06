import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createApiApp } from './bootstrap/createApiApp.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, '..', 'public');
const port = Number(process.env.PORT) || 8080;

async function start(): Promise<void> {
  const app = await createApiApp(publicDir);

  app.listen(port, '0.0.0.0', () => {
    console.log(`Server listening on port ${port}`);
  });
}

void start().catch((error) => {
  console.error('Failed to initialize application:', error);
  process.exit(1);
});
