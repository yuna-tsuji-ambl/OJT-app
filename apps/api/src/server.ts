import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { InMemoryConditionRecordStore } from './repositories/inMemoryConditionRecordStore.js';
import { createInMemoryQuestPersistence } from './repositories/createInMemoryQuestPersistence.js';
import { createConditionRouter } from './routes/conditionRoutes.js';
import { createQuestRouter } from './routes/questRoutes.js';
import { createInMemoryStatusPersistence } from './repositories/createInMemoryStatusPersistence.js';
import { createStatusRouter } from './routes/statusRoutes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, '..', 'public');
const port = Number(process.env.PORT) || 8080;
const conditionRecordStore = new InMemoryConditionRecordStore();
const { questStore, sheetRepository } = createInMemoryQuestPersistence();
const { trainerStatusStore, chatMessageStore } =
  createInMemoryStatusPersistence();

const app = express();
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

const apiRouter = express.Router();

apiRouter.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'ojt-app-api' });
});

apiRouter.use(createConditionRouter(conditionRecordStore));
apiRouter.use(createQuestRouter(questStore, sheetRepository));
apiRouter.use(createStatusRouter(trainerStatusStore, chatMessageStore));

app.use('/api', apiRouter);

if (fs.existsSync(publicDir)) {
  app.use(express.static(publicDir));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(publicDir, 'index.html'));
  });
}

app.listen(port, '0.0.0.0', () => {
  console.log(`Server listening on port ${port}`);
});
