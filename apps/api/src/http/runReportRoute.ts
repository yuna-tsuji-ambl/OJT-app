import type { Request, Response } from 'express';
import type { UserContext } from '../domain/types.js';
import { sendReportErrorResponse } from './expressErrorResponse.js';
import { readExpressUserContext } from './expressUserContext.js';

type ReportRouteHandler = (
  context: UserContext,
  request: Request,
) => Promise<unknown>;

interface RunReportRouteOptions {
  successStatus?: number;
}

export async function runReportRoute(
  request: Request,
  response: Response,
  handler: ReportRouteHandler,
  options: RunReportRouteOptions = {},
): Promise<void> {
  try {
    const context = await readExpressUserContext(request);
    const result = await handler(context, request);
    response.status(options.successStatus ?? 200).json(result);
  } catch (error) {
    sendReportErrorResponse(response, error);
  }
}
