import express, { type Express } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { validateStartupEnv } from './validateStartupEnv.js';
import {
  createPersistence,
  resolveDbProvider,
} from '../repositories/createPersistence.js';
import { createAssignmentRouter } from '../routes/assignmentRoutes.js';
import { createConditionRouter } from '../routes/conditionRoutes.js';
import { createMessageRouter } from '../routes/messageRoutes.js';
import { createQuestRouter } from '../routes/questRoutes.js';
import { createGoalRouter } from '../routes/goalRoutes.js';
import { createReportRouter } from '../routes/reportRoutes.js';
import { createStatusRouter } from '../routes/statusRoutes.js';

export async function createApiApp(
  app: Express,
  publicDir: string,
): Promise<void> {
  validateStartupEnv();

  const dbProvider = resolveDbProvider();
  console.log(`Initializing persistence (DB_PROVIDER=${dbProvider})...`);

  const {
    conditionRecordStore,
    assignmentRepository,
    goalRepository,
    reportRepository,
    trainerStatusStore,
    chatMessageStore,
    threadStore,
    threadChatMessageStore,
  } = await createPersistence();

  app.use(express.json());

  const apiRouter = express.Router();

  apiRouter.get('/health', (_request, response) => {
    response.json({
      status: 'ok',
      service: 'ojt-app-api',
      dbProvider,
    });
  });

  apiRouter.use(createConditionRouter(conditionRecordStore));
  apiRouter.use(createQuestRouter(assignmentRepository));
  apiRouter.use(createAssignmentRouter(assignmentRepository));
  apiRouter.use(createGoalRouter(goalRepository));
  apiRouter.use(createReportRouter(reportRepository));
  apiRouter.use(createStatusRouter(trainerStatusStore));
  apiRouter.use(
    createMessageRouter(chatMessageStore, threadStore, threadChatMessageStore),
  );

  app.use('/api', apiRouter);

  if (fs.existsSync(publicDir)) {
    app.use(express.static(publicDir));
    app.get('*', (_request, response) => {
      response.sendFile(path.join(publicDir, 'index.html'));
    });
  }

  console.log('Application initialized successfully');
}
