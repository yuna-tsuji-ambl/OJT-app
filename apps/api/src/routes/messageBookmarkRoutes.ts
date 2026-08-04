import { Router, type Response } from 'express';
import { INVALID_MESSAGE_BOOKMARK_INPUT_MESSAGE } from '../domain/errors.js';
import { readRouteParam } from '../http/expressRouteParams.js';
import {
  parseCreateMessageBookmarkBody,
  parseListMessageBookmarksQuery,
  parseUpdateMessageBookmarkMemoBody,
} from '../http/messageBookmarkRequestTypes.js';
import { runMessageBookmarkRoute } from '../http/runMessageBookmarkRoute.js';
import {
  createMessageBookmark,
  deleteMessageBookmark,
  listMessageBookmarks,
  updateMessageBookmarkMemo,
} from '../messageBookmark.js';
import type { MessageBookmarkDeps } from '../messageBookmarks/messageBookmarkCommands.js';

function respondInvalidInput(response: Response): void {
  response.status(400).json({ error: INVALID_MESSAGE_BOOKMARK_INPUT_MESSAGE });
}

export function createMessageBookmarkRouter(deps: MessageBookmarkDeps): Router {
  const router = Router();

  router.get('/message-bookmarks', (request, response) => {
    const targetType = parseListMessageBookmarksQuery(
      request.query as Record<string, unknown>,
    );
    if (targetType === null) {
      respondInvalidInput(response);
      return;
    }

    return runMessageBookmarkRoute(request, response, (context) =>
      listMessageBookmarks(context, targetType, deps),
    );
  });

  router.post('/message-bookmarks', (request, response) => {
    const body = parseCreateMessageBookmarkBody(request.body);
    if (!body) {
      respondInvalidInput(response);
      return;
    }

    return runMessageBookmarkRoute(
      request,
      response,
      (context) => createMessageBookmark(body, context, deps),
      { successStatus: 201 },
    );
  });

  router.delete('/message-bookmarks/:id', (request, response) =>
    runMessageBookmarkRoute(
      request,
      response,
      (context) =>
        deleteMessageBookmark(readRouteParam(request.params.id), context, deps),
      { successStatus: 204 },
    ),
  );

  router.patch('/message-bookmarks/:id', (request, response) => {
    const body = parseUpdateMessageBookmarkMemoBody(request.body);
    if (!body) {
      respondInvalidInput(response);
      return;
    }

    return runMessageBookmarkRoute(request, response, (context) =>
      updateMessageBookmarkMemo(
        readRouteParam(request.params.id),
        body,
        context,
        deps,
      ),
    );
  });

  return router;
}
