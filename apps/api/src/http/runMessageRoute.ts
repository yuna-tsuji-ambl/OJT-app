import type { Request, Response } from 'express';
import type { UserContext } from '../domain/types.js';
import { sendMessageErrorResponse } from './expressErrorResponse.js';
import { readExpressUserContext } from './expressUserContext.js';

type MessageRouteHandler = (
  context: UserContext,
  request: Request,
) => Promise<unknown>;

interface RunMessageRouteOptions {
  successStatus?: number;
  emptyBody?: boolean;
}

export async function runMessageRoute(
  request: Request,
  response: Response,
  handler: MessageRouteHandler,
  options: RunMessageRouteOptions = {},
): Promise<void> {
  try {
    const context = readExpressUserContext(request);
    const result = await handler(context, request);

    if (response.headersSent) {
      return;
    }

    if (options.emptyBody) {
      response.status(options.successStatus ?? 200).send();
      return;
    }

    response.status(options.successStatus ?? 200).json(result);
  } catch (error) {
    sendMessageErrorResponse(response, error);
  }
}
