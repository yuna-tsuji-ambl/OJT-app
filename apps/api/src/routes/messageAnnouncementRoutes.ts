import { Router, type Response } from 'express';
import { INVALID_MESSAGE_ANNOUNCEMENT_INPUT_MESSAGE } from '../domain/errors.js';
import { readRouteParam } from '../http/expressRouteParams.js';
import {
  parseCreateMessageAnnouncementBody,
  parseUpdateMessageAnnouncementMemoBody,
} from '../http/messageAnnouncementRequestTypes.js';
import { runMessageAnnouncementRoute } from '../http/runMessageAnnouncementRoute.js';
import {
  createMessageAnnouncement,
  deleteMessageAnnouncement,
  listMessageAnnouncements,
  updateMessageAnnouncementMemo,
} from '../messageAnnouncement.js';
import type { MessageAnnouncementDeps } from '../messageAnnouncements/messageAnnouncementCommands.js';

function respondInvalidInput(response: Response): void {
  response
    .status(400)
    .json({ error: INVALID_MESSAGE_ANNOUNCEMENT_INPUT_MESSAGE });
}

export function createMessageAnnouncementRouter(
  deps: MessageAnnouncementDeps,
): Router {
  const router = Router();

  router.get('/message-announcements', (request, response) =>
    runMessageAnnouncementRoute(request, response, (context) =>
      listMessageAnnouncements(context, deps),
    ),
  );

  router.post('/message-announcements', (request, response) => {
    const body = parseCreateMessageAnnouncementBody(request.body);
    if (!body) {
      respondInvalidInput(response);
      return;
    }

    return runMessageAnnouncementRoute(
      request,
      response,
      (context) => createMessageAnnouncement(body, context, deps),
      { successStatus: 201 },
    );
  });

  router.delete('/message-announcements/:id', (request, response) =>
    runMessageAnnouncementRoute(
      request,
      response,
      (context) =>
        deleteMessageAnnouncement(
          readRouteParam(request.params.id),
          context,
          deps,
        ),
      { successStatus: 204 },
    ),
  );

  router.patch('/message-announcements/:id', (request, response) => {
    const body = parseUpdateMessageAnnouncementMemoBody(request.body);
    if (!body) {
      respondInvalidInput(response);
      return;
    }

    return runMessageAnnouncementRoute(request, response, (context) =>
      updateMessageAnnouncementMemo(
        readRouteParam(request.params.id),
        body,
        context,
        deps,
      ),
    );
  });

  return router;
}
