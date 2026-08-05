import type { Request, Response } from 'express';
import type { UserContext } from '../domain/types.js';
import { sendLearningErrorResponse } from './expressErrorResponse.js';
import { readExpressUserContext } from './expressUserContext.js';

type LearningRouteHandler = (
  context: UserContext,
  request: Request,
) => Promise<unknown>;

interface RunLearningRouteOptions {
  successStatus?: number;
}

export async function runLearningRoute(
  request: Request,
  response: Response,
  handler: LearningRouteHandler,
  options: RunLearningRouteOptions = {},
): Promise<void> {
  try {
    const context = readExpressUserContext(request);
    const result = await handler(context, request);

    if (options.successStatus === 204) {
      response.status(204).send();
      return;
    }

    response.status(options.successStatus ?? 200).json(result);
  } catch (error) {
    sendLearningErrorResponse(response, error);
  }
}
