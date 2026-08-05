import { Router, type Response } from 'express';
import { INVALID_LEARNING_INPUT_MESSAGE } from '../domain/errors.js';
import { createLearningPost, listLearnings } from '../learning.js';
import {
  parseCreateLearningPostBody,
  parseListLearningsQuery,
} from '../http/learningRequestTypes.js';
import { runLearningRoute } from '../http/runLearningRoute.js';
import type { LearningRepository } from '../repositories/learningRepository.js';

function respondInvalidLearningInput(response: Response): void {
  response.status(400).json({ error: INVALID_LEARNING_INPUT_MESSAGE });
}

export function createLearningRouter(
  learningRepository: LearningRepository,
): Router {
  const router = Router();

  router.get('/learnings', (request, response) =>
    runLearningRoute(request, response, (context) =>
      listLearnings(
        parseListLearningsQuery(request.query),
        context.userId,
        context.role,
        learningRepository,
      ),
    ),
  );

  router.post('/learnings', (request, response) => {
    const body = parseCreateLearningPostBody(request.body);

    if (!body) {
      respondInvalidLearningInput(response);
      return;
    }

    return runLearningRoute(
      request,
      response,
      (context) =>
        createLearningPost(
          body,
          context.userId,
          context.role,
          learningRepository,
        ),
      { successStatus: 201 },
    );
  });

  return router;
}
