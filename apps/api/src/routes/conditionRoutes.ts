import { Router } from 'express';
import {
  getConditionGraphData,
  getLatestConditionRecord,
  listConditionAlerts,
  submitConditionRecord,
} from '../condition.js';
import { parseConditionDraftBody } from '../http/conditionRequestTypes.js';
import { readRouteParam } from '../http/expressRouteParams.js';
import { runConditionRoute } from '../http/runConditionRoute.js';
import type { ConditionRecordStore } from '../repositories/conditionRecordStore.js';

export function createConditionRouter(store: ConditionRecordStore): Router {
  const router = Router();

  router.post('/condition', (request, response) => {
    const draft = parseConditionDraftBody(request.body);

    if (!draft) {
      response.status(400).json({ error: 'Invalid condition input' });
      return;
    }

    void runConditionRoute(request, response, (context) =>
      submitConditionRecord(draft, context.userId, context.role, store),
    );
  });

  router.get(
    '/condition/alerts',
    (request, response) =>
      void runConditionRoute(request, response, (context) =>
        listConditionAlerts(context.userId, context.role, store),
      ),
  );

  router.get(
    '/condition/trainees/:traineeId/latest',
    (request, response) =>
      void runConditionRoute(request, response, (context) =>
        getLatestConditionRecord(
          readRouteParam(request.params.traineeId),
          context.userId,
          context.role,
          store,
        ),
      ),
  );

  router.get(
    '/condition/trainees/:traineeId/graph',
    (request, response) =>
      void runConditionRoute(request, response, (context) =>
        getConditionGraphData(
          readRouteParam(request.params.traineeId),
          context.userId,
          context.role,
          store,
        ),
      ),
  );

  return router;
}
