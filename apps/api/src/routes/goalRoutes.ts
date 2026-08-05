import { Router, type Response } from 'express';
import { INVALID_GOAL_INPUT_MESSAGE } from '../domain/errors.js';
import { createGoal, deleteGoal, listGoals, updateGoal } from '../goal.js';
import {
  parseCreateGoalBody,
  parseListGoalsQuery,
  parseUpdateGoalBody,
} from '../http/goalRequestTypes.js';
import { readRouteParam } from '../http/expressRouteParams.js';
import { runGoalRoute } from '../http/runGoalRoute.js';
import type { GoalRepository } from '../repositories/goalRepository.js';

function respondInvalidGoalInput(response: Response): void {
  response.status(400).json({ error: INVALID_GOAL_INPUT_MESSAGE });
}

export function createGoalRouter(goalRepository: GoalRepository): Router {
  const router = Router();

  router.get('/goals', (request, response) =>
    runGoalRoute(request, response, (context) =>
      listGoals(
        parseListGoalsQuery(request.query),
        context.userId,
        context.role,
        goalRepository,
      ),
    ),
  );

  router.post('/goals', (request, response) => {
    const body = parseCreateGoalBody(request.body);

    if (!body) {
      respondInvalidGoalInput(response);
      return;
    }

    return runGoalRoute(
      request,
      response,
      (context) =>
        createGoal(body, context.userId, context.role, goalRepository),
      { successStatus: 201 },
    );
  });

  router.put('/goals/:id', (request, response) => {
    const body = parseUpdateGoalBody(request.body);

    if (!body) {
      respondInvalidGoalInput(response);
      return;
    }

    return runGoalRoute(request, response, (context) =>
      updateGoal(
        readRouteParam(request.params.id),
        body,
        context.userId,
        context.role,
        goalRepository,
      ),
    );
  });

  router.delete('/goals/:id', (request, response) =>
    runGoalRoute(
      request,
      response,
      (context) =>
        deleteGoal(
          readRouteParam(request.params.id),
          context.userId,
          context.role,
          goalRepository,
        ),
      { successStatus: 204 },
    ),
  );

  return router;
}
