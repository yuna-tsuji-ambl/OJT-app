import { Router, type Request, type Response } from 'express';
import {
  approveQuest,
  getPendingQuestList,
  getQuestList,
  requestClearQuest,
} from '../quest.js';
import { sendQuestErrorResponse } from '../http/expressErrorResponse.js';
import { readExpressUserContext } from '../http/expressUserContext.js';
import { readRouteParam } from '../http/expressRouteParams.js';
import type { QuestStore } from '../repositories/questStore.js';
import type { SheetRepository } from '../repositories/sheetRepository.js';

async function handleGetQuestList(
  request: Request,
  response: Response,
  questStore: QuestStore,
  sheetRepository: SheetRepository,
): Promise<void> {
  try {
    const context = readExpressUserContext(request);
    const quests = await getQuestList(
      context.userId,
      context.role,
      sheetRepository,
      questStore,
    );
    response.json(quests);
  } catch (error) {
    sendQuestErrorResponse(response, error);
  }
}

async function handleGetPendingQuestList(
  request: Request,
  response: Response,
  questStore: QuestStore,
): Promise<void> {
  try {
    const context = readExpressUserContext(request);
    const quests = await getPendingQuestList(
      context.userId,
      context.role,
      questStore,
    );
    response.json(quests);
  } catch (error) {
    sendQuestErrorResponse(response, error);
  }
}

async function handleRequestQuestClear(
  request: Request,
  response: Response,
  questStore: QuestStore,
): Promise<void> {
  try {
    const context = readExpressUserContext(request);
    const quest = await requestClearQuest(
      readRouteParam(request.params.questId),
      context.userId,
      context.role,
      questStore,
    );
    response.json(quest);
  } catch (error) {
    sendQuestErrorResponse(response, error);
  }
}

async function handleApproveQuest(
  request: Request,
  response: Response,
  questStore: QuestStore,
  sheetRepository: SheetRepository,
): Promise<void> {
  try {
    const context = readExpressUserContext(request);
    const quest = await approveQuest(
      readRouteParam(request.params.questId),
      context.userId,
      context.role,
      questStore,
      sheetRepository,
    );
    response.json(quest);
  } catch (error) {
    sendQuestErrorResponse(response, error);
  }
}

export function createQuestRouter(
  questStore: QuestStore,
  sheetRepository: SheetRepository,
): Router {
  const router = Router();

  router.get(
    '/quests',
    (request, response) =>
      void handleGetQuestList(request, response, questStore, sheetRepository),
  );

  router.get(
    '/quests/pending',
    (request, response) =>
      void handleGetPendingQuestList(request, response, questStore),
  );

  router.post(
    '/quests/:questId/request',
    (request, response) =>
      void handleRequestQuestClear(request, response, questStore),
  );

  router.post(
    '/quests/:questId/approve',
    (request, response) =>
      void handleApproveQuest(request, response, questStore, sheetRepository),
  );

  return router;
}
