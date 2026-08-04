import type { Request, Response } from 'express';
import type { UserContext } from '../domain/types.js';
import { sendMessageAnnouncementErrorResponse } from './expressErrorResponse.js';
import { readExpressUserContext } from './expressUserContext.js';

type MessageAnnouncementRouteHandler = (
  context: UserContext,
  request: Request,
) => Promise<unknown>;

interface RunMessageAnnouncementRouteOptions {
  successStatus?: number;
}

export async function runMessageAnnouncementRoute(
  request: Request,
  response: Response,
  handler: MessageAnnouncementRouteHandler,
  options: RunMessageAnnouncementRouteOptions = {},
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
    sendMessageAnnouncementErrorResponse(response, error);
  }
}
