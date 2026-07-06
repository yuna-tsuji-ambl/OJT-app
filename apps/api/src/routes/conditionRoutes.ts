import { Router } from 'express';
import {
  getLatestConditionRecord,
  listConditionAlerts,
  submitConditionRecord,
} from '../condition.js';
import { ConditionRecordNotFoundError } from '../domain/errors.js';
import type { ConditionDraft } from '../domain/conditionTypes.js';
import { readExpressUserContext } from '../http/expressUserContext.js';
import type { ConditionRecordStore } from '../repositories/conditionRecordStore.js';

export function createConditionRouter(store: ConditionRecordStore): Router {
  const router = Router();

  router.post('/condition', async (request, response) => {
    try {
      const context = readExpressUserContext(request);
      const result = await submitConditionRecord(
        request.body as ConditionDraft,
        context.userId,
        context.role,
        store,
      );
      response.json(result);
    } catch {
      response.status(401).json({ error: 'Unauthorized' });
    }
  });

  router.get('/condition/alerts', async (request, response) => {
    try {
      const context = readExpressUserContext(request);
      const alerts = await listConditionAlerts(
        context.userId,
        context.role,
        store,
      );
      response.json(alerts);
    } catch {
      response.status(401).json({ error: 'Unauthorized' });
    }
  });

  router.get(
    '/condition/trainees/:traineeId/latest',
    async (request, response) => {
      try {
        const context = readExpressUserContext(request);
        const record = await getLatestConditionRecord(
          request.params.traineeId,
          context.userId,
          context.role,
          store,
        );
        response.json(record);
      } catch (error) {
        if (error instanceof ConditionRecordNotFoundError) {
          response.status(404).json({ error: 'Not found' });
          return;
        }

        response.status(401).json({ error: 'Unauthorized' });
      }
    },
  );

  return router;
}
