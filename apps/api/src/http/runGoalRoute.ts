import type { Request, Response } from 'express';
import type { UserContext } from '../domain/types.js';
import { sendGoalErrorResponse } from './expressErrorResponse.js';
import { readExpressUserContext } from './expressUserContext.js';

type GoalRouteHandler = (
  context: UserContext,
  request: Request,
) => Promise<unknown>;

interface RunGoalRouteOptions {
  successStatus?: number;
}

export async function runGoalRoute(
  request: Request,
  response: Response,
  handler: GoalRouteHandler,
  options: RunGoalRouteOptions = {},
): Promise<void> {
  try {
    const context = await readExpressUserContext(request);
    const result = await handler(context, request);

    if (options.successStatus === 204) {
      response.status(204).send();
      return;
    }

    response.status(options.successStatus ?? 200).json(result);
  } catch (error) {
    sendGoalErrorResponse(response, error);
  }
}
