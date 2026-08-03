import { Router, type Request, type Response } from 'express';
import { sendSharedAuthErrorResponse } from '../http/expressErrorResponse.js';
import { readExpressUserContext } from '../http/expressUserContext.js';

export async function handleGetMe(
  request: Request,
  response: Response,
): Promise<void> {
  try {
    const context = await readExpressUserContext(request);
    response.status(200).json(context);
  } catch (error) {
    sendSharedAuthErrorResponse(response, error);
  }
}

export function createMeRouter(): Router {
  const router = Router();
  router.get('/me', (request, response, next) => {
    handleGetMe(request, response).catch(next);
  });
  return router;
}
