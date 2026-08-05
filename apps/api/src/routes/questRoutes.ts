import { Router } from 'express';
import {
  approveQuest,
  createQuest,
  getPendingQuestList,
  getQuestList,
  getTrainerQuestProgressList,
  requestClearQuest,
} from '../quest.js';
import { parseCreateQuestBody } from '../http/questRequestTypes.js';
import { readRouteParam } from '../http/expressRouteParams.js';
import { runQuestRoute } from '../http/runQuestRoute.js';
import type { AssignmentRepository } from '../repositories/assignmentRepository.js';

export function createQuestRouter(
  assignmentRepository: AssignmentRepository,
): Router {
  const router = Router();

  router.get(
    '/quests',
    (request, response) =>
      void runQuestRoute(request, response, (context) =>
        getQuestList(context.userId, context.role, assignmentRepository),
      ),
  );

  router.get(
    '/quests/pending',
    (request, response) =>
      void runQuestRoute(request, response, (context) =>
        getPendingQuestList(context.userId, context.role, assignmentRepository),
      ),
  );

  router.get(
    '/quests/progress',
    (request, response) =>
      void runQuestRoute(request, response, (context) =>
        getTrainerQuestProgressList(
          context.userId,
          context.role,
          assignmentRepository,
        ),
      ),
  );

  router.post('/quests', (request, response) => {
    const body = parseCreateQuestBody(request.body);

    if (!body) {
      response.status(400).json({ error: 'Invalid quest input' });
      return;
    }

    void runQuestRoute(
      request,
      response,
      (context) =>
        createQuest(context.userId, context.role, body, assignmentRepository),
      { successStatus: 201 },
    );
  });

  router.post(
    '/quests/:questId/request',
    (request, response) =>
      void runQuestRoute(request, response, (context) =>
        requestClearQuest(
          readRouteParam(request.params.questId),
          context.userId,
          context.role,
          assignmentRepository,
        ),
      ),
  );

  router.post(
    '/quests/:questId/approve',
    (request, response) =>
      void runQuestRoute(request, response, (context) =>
        approveQuest(
          readRouteParam(request.params.questId),
          context.userId,
          context.role,
          assignmentRepository,
        ),
      ),
  );

  return router;
}
