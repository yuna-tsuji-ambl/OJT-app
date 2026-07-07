import type { Request, Response } from 'express';
import type { UserContext } from '../domain/types.js';
import { sendQuestErrorResponse } from './expressErrorResponse.js';
import { readExpressUserContext } from './expressUserContext.js';

type QuestRouteHandler = (
  context: UserContext,
  request: Request,
) => Promise<unknown>;

interface RunQuestRouteOptions {
  successStatus?: number;
}

export async function runQuestRoute(
  request: Request,
  response: Response,
  handler: QuestRouteHandler,
  options: RunQuestRouteOptions = {},
): Promise<void> {
  try {
    const context = readExpressUserContext(request);
    const result = await handler(context, request);
    response.status(options.successStatus ?? 200).json(result);
  } catch (error) {
    sendQuestErrorResponse(response, error);
  }
}
