import type { Request, Response } from 'express';
import type { UserContext } from '../domain/types.js';
import { sendMessageBookmarkErrorResponse } from './expressErrorResponse.js';
import { readExpressUserContext } from './expressUserContext.js';

type MessageBookmarkRouteHandler = (
  context: UserContext,
  request: Request,
) => Promise<unknown>;

interface RunMessageBookmarkRouteOptions {
  successStatus?: number;
}

export async function runMessageBookmarkRoute(
  request: Request,
  response: Response,
  handler: MessageBookmarkRouteHandler,
  options: RunMessageBookmarkRouteOptions = {},
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
    sendMessageBookmarkErrorResponse(response, error);
  }
}
