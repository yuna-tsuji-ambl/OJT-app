import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateStartupEnv } from './bootstrap/validateStartupEnv.js';
import { createPersistence } from './repositories/createPersistence.js';
import { createConditionRouter } from './routes/conditionRoutes.js';
import { createQuestRouter } from './routes/questRoutes.js';
import { createStatusRouter } from './routes/statusRoutes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, '..', 'public');
const port = Number(process.env.PORT) || 8080;

const app = express();
app.use(express.json());

let persistenceReady = false;

app.get('/health', (_request, response) => {
  response.status(persistenceReady ? 200 : 503).json({
    status: persistenceReady ? 'ok' : 'starting',
  });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server listening on port ${port}`);
  void initializeApp();
});

async function initializeApp(): Promise<void> {
  try {
    validateStartupEnv();

    const dbProvider =
      process.env.DB_PROVIDER === 'firestore' ? 'firestore' : 'memory';
    console.log(`Initializing persistence (DB_PROVIDER=${dbProvider})...`);

    const {
      conditionRecordStore,
      questStore,
      sheetRepository,
      trainerStatusStore,
      chatMessageStore,
    } = await createPersistence();

    const apiRouter = express.Router();

    apiRouter.get('/health', (_request, response) => {
      response.json({
        status: 'ok',
        service: 'ojt-app-api',
        dbProvider,
      });
    });

    apiRouter.use(createConditionRouter(conditionRecordStore));
    apiRouter.use(createQuestRouter(questStore, sheetRepository));
    apiRouter.use(createStatusRouter(trainerStatusStore, chatMessageStore));

    app.use('/api', apiRouter);

    if (fs.existsSync(publicDir)) {
      app.use(express.static(publicDir));
      app.get('*', (_request, response) => {
        response.sendFile(path.join(publicDir, 'index.html'));
      });
    }

    persistenceReady = true;
    console.log('Application initialized successfully');
  } catch (error) {
    console.error('Failed to initialize application:', error);
    process.exit(1);
  }
}
