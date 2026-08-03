import type { Request, Response } from 'express';
import type { UserContext } from '../domain/types.js';
import { sendConditionErrorResponse } from './expressErrorResponse.js';
import { readExpressUserContext } from './expressUserContext.js';

type ConditionRouteHandler = (
  context: UserContext,
  request: Request,
) => Promise<unknown>;

interface RunConditionRouteOptions {
  successStatus?: number;
}

export async function runConditionRoute(
  request: Request,
  response: Response,
  handler: ConditionRouteHandler,
  options: RunConditionRouteOptions = {},
): Promise<void> {
  try {
    const context = await readExpressUserContext(request);
    const result = await handler(context, request);
    response.status(options.successStatus ?? 200).json(result);
  } catch (error) {
    sendConditionErrorResponse(response, error);
  }
}
