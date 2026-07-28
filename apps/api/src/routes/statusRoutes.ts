import { Router, type Request, type Response } from 'express';

import { getTrainerStatus, updateTrainerStatus } from '../status.js';

import { sendStatusErrorResponse } from '../http/expressErrorResponse.js';

import { readExpressUserContext } from '../http/expressUserContext.js';

import { readRouteParam } from '../http/expressRouteParams.js';

import { parseStatusUpdateBody } from '../http/statusRequestTypes.js';

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

export function createStatusRouter(
  trainerStatusStore: TrainerStatusStore,
): Router {
  const router = Router();

  router.put(
    '/status',

    (request, response) =>
      void handleUpdateTrainerStatus(request, response, trainerStatusStore),
  );

  router.get(
    '/status/trainer/:trainerId',

    (request, response) =>
      void handleGetTrainerStatus(request, response, trainerStatusStore),
  );

  return router;
}
