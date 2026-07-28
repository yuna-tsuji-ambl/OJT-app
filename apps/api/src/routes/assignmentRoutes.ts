import { Router } from 'express';
import {
  approveAssignment,
  createAssignment,
  deleteAssignment,
  getAssignmentList,
  getAssignmentManageList,
  getPendingAssignmentList,
  requestClearAssignment,
  updateAssignment,
} from '../assignment.js';
import { readRouteParam } from '../http/expressRouteParams.js';
import {
  parseCreateAssignmentBody,
  parseUpdateAssignmentBody,
} from '../http/assignmentRequestTypes.js';
import { runAssignmentRoute } from '../http/runAssignmentRoute.js';
import type { AssignmentRepository } from '../repositories/assignmentRepository.js';

export function createAssignmentRouter(
  assignmentRepository: AssignmentRepository,
): Router {
  const router = Router();

  router.get(
    '/assignments',
    (request, response) =>
      void runAssignmentRoute(request, response, (context) =>
        getAssignmentList(context.userId, context.role, assignmentRepository),
      ),
  );

  router.get(
    '/assignments/manage',
    (request, response) =>
      void runAssignmentRoute(request, response, (context) =>
        getAssignmentManageList(
          context.userId,
          context.role,
          assignmentRepository,
        ),
      ),
  );

  router.get(
    '/assignments/pending',
    (request, response) =>
      void runAssignmentRoute(request, response, (context) =>
        getPendingAssignmentList(
          context.userId,
          context.role,
          assignmentRepository,
        ),
      ),
  );

  router.post('/assignments', (request, response) => {
    const body = parseCreateAssignmentBody(request.body);

    if (!body) {
      response.status(400).json({ error: 'Invalid assignment input' });
      return;
    }

    void runAssignmentRoute(
      request,
      response,
      (context) =>
        createAssignment(
          context.userId,
          context.role,
          body,
          assignmentRepository,
        ),
      { successStatus: 201 },
    );
  });

  router.put('/assignments/:assignmentId', (request, response) => {
    const body = parseUpdateAssignmentBody(request.body);

    if (!body) {
      response.status(400).json({ error: 'Invalid assignment input' });
      return;
    }

    void runAssignmentRoute(request, response, (context) =>
      updateAssignment(
        readRouteParam(request.params.assignmentId),
        context.userId,
        context.role,
        body,
        assignmentRepository,
      ),
    );
  });

  router.delete('/assignments/:assignmentId', (request, response) => {
    void runAssignmentRoute(
      request,
      response,
      async (context) => {
        await deleteAssignment(
          readRouteParam(request.params.assignmentId),
          context.userId,
          context.role,
          assignmentRepository,
        );
        return null;
      },
      { successStatus: 204, emptyBody: true },
    );
  });

  router.post(
    '/assignments/:assignmentId/request',
    (request, response) =>
      void runAssignmentRoute(request, response, (context) =>
        requestClearAssignment(
          readRouteParam(request.params.assignmentId),
          context.userId,
          context.role,
          assignmentRepository,
        ),
      ),
  );

  router.post(
    '/assignments/:assignmentId/approve',
    (request, response) =>
      void runAssignmentRoute(request, response, (context) =>
        approveAssignment(
          readRouteParam(request.params.assignmentId),
          context.userId,
          context.role,
          assignmentRepository,
        ),
      ),
  );

  return router;
}
