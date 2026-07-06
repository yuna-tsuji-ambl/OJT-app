import { Router, type Request, type Response } from 'express';
import {
  getTrainerStatus,
  listChatMessages,
  sendQuickQuestion,
  sendQuickReply,
  updateTrainerStatus,
} from '../status.js';
import { sendStatusErrorResponse } from '../http/expressErrorResponse.js';
import { readExpressUserContext } from '../http/expressUserContext.js';
import { readQueryParam, readRouteParam } from '../http/expressRouteParams.js';
import {
  parseStatusUpdateBody,
  type QuestionMessageBody,
  type ReplyMessageBody,
} from '../http/statusRequestTypes.js';
import type { ChatMessageStore } from '../repositories/chatMessageStore.js';
import type { TrainerStatusStore } from '../repositories/trainerStatusStore.js';

async function handleUpdateTrainerStatus(
  request: Request,
  response: Response,
  trainerStatusStore: TrainerStatusStore,
): Promise<void> {
  try {
    const context = readExpressUserContext(request);
    const body = parseStatusUpdateBody(request.body);

    if (!body) {
      response.status(400).json({ error: 'Invalid status' });
      return;
    }

    const record = await updateTrainerStatus(
      body.status,
      context.userId,
      context.role,
      trainerStatusStore,
    );
    response.json(record);
  } catch (error) {
    sendStatusErrorResponse(response, error);
  }
}

async function handleGetTrainerStatus(
  request: Request,
  response: Response,
  trainerStatusStore: TrainerStatusStore,
): Promise<void> {
  try {
    const context = readExpressUserContext(request);
    const record = await getTrainerStatus(
      readRouteParam(request.params.trainerId),
      context.userId,
      context.role,
      trainerStatusStore,
    );
    response.json(record);
  } catch (error) {
    sendStatusErrorResponse(response, error);
  }
}

async function handleListMessages(
  request: Request,
  response: Response,
  chatMessageStore: ChatMessageStore,
): Promise<void> {
  try {
    const context = readExpressUserContext(request);
    const trainerId = readQueryParam(request.query.trainerId);
    const traineeId = readQueryParam(request.query.traineeId);

    if (!trainerId || !traineeId) {
      response.status(400).json({ error: 'Invalid query' });
      return;
    }

    const messages = await listChatMessages(
      trainerId,
      traineeId,
      context.userId,
      context.role,
      chatMessageStore,
    );
    response.json(messages);
  } catch (error) {
    sendStatusErrorResponse(response, error);
  }
}

async function handlePostMessage(
  request: Request,
  response: Response,
  chatMessageStore: ChatMessageStore,
): Promise<void> {
  try {
    const context = readExpressUserContext(request);

    if (context.role === 'trainee') {
      const body = request.body as QuestionMessageBody;
      const result = await sendQuickQuestion(
        body.content,
        body.trainerId,
        context.userId,
        context.role,
        chatMessageStore,
      );
      response.json(result);
      return;
    }

    const body = request.body as ReplyMessageBody;
    const result = await sendQuickReply(
      body.content,
      body.traineeId,
      context.userId,
      context.role,
      chatMessageStore,
    );
    response.json(result);
  } catch (error) {
    sendStatusErrorResponse(response, error);
  }
}

export function createStatusRouter(
  trainerStatusStore: TrainerStatusStore,
  chatMessageStore: ChatMessageStore,
): Router {
  const router = Router();

  router.put('/status', (request, response) =>
    void handleUpdateTrainerStatus(request, response, trainerStatusStore),
  );

  router.get('/status/trainer/:trainerId', (request, response) =>
    void handleGetTrainerStatus(request, response, trainerStatusStore),
  );

  router.get('/status/messages', (request, response) =>
    void handleListMessages(request, response, chatMessageStore),
  );

  router.post('/status/messages', (request, response) =>
    void handlePostMessage(request, response, chatMessageStore),
  );

  return router;
}
