import type { Request, Response } from 'express';
import type { UserContext } from '../domain/types.js';
import { sendAssignmentErrorResponse } from './expressErrorResponse.js';
import { readExpressUserContext } from './expressUserContext.js';

type AssignmentRouteHandler = (
  context: UserContext,
  request: Request,
) => Promise<unknown>;

interface RunAssignmentRouteOptions {
  successStatus?: number;
  emptyBody?: boolean;
}

export async function runAssignmentRoute(
  request: Request,
  response: Response,
  handler: AssignmentRouteHandler,
  options: RunAssignmentRouteOptions = {},
): Promise<void> {
  try {
    const context = await readExpressUserContext(request);
    const result = await handler(context, request);

    if (options.emptyBody) {
      response.status(options.successStatus ?? 200).send();
      return;
    }

    response.status(options.successStatus ?? 200).json(result);
  } catch (error) {
    sendAssignmentErrorResponse(response, error);
  }
}
