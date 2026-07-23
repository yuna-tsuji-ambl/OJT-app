import { Router } from 'express';
import { listChatMessages } from '../status.js';
import { listMessageThreads, listThreadChatMessages } from '../message.js';
import { handleTraineeMessagePost } from '../http/handleTraineeMessagePost.js';
import { handleTrainerMessagePost } from '../http/handleTrainerMessagePost.js';
import { readQueryParam } from '../http/expressRouteParams.js';
import { parseQuestionMessageBody } from '../http/messageRequestTypes.js';
import { runMessageRoute } from '../http/runMessageRoute.js';
import type { ChatMessageStore } from '../repositories/chatMessageStore.js';
import type { MessageThreadStore } from '../repositories/messageThreadStore.js';
import type { ThreadChatMessageStore } from '../repositories/threadChatMessageStore.js';

const MESSAGE_THREADS_VIEW = 'threads';
const MESSAGE_THREAD_VIEW = 'thread';

export function createMessageRouter(
  chatMessageStore: ChatMessageStore,
  threadStore: MessageThreadStore,
  threadChatMessageStore: ThreadChatMessageStore,
): Router {
  const router = Router();

  router.get('/status/messages', (request, response) => {
    const trainerId = readQueryParam(request.query.trainerId);
    const traineeId = readQueryParam(request.query.traineeId);
    const view = readQueryParam(request.query.view);
    const threadId = readQueryParam(request.query.threadId);

    if (!trainerId || !traineeId) {
      response.status(400).json({ error: 'Invalid query' });
      return;
    }

    if (view === MESSAGE_THREAD_VIEW && !threadId) {
      response.status(400).json({ error: 'Invalid query' });
      return;
    }

    void runMessageRoute(request, response, (context) => {
      if (view === MESSAGE_THREADS_VIEW) {
        return listMessageThreads(
          trainerId,
          traineeId,
          context.userId,
          context.role,
          threadStore,
          threadChatMessageStore,
        );
      }

      if (view === MESSAGE_THREAD_VIEW && threadId) {
        return listThreadChatMessages(
          trainerId,
          traineeId,
          threadId,
          context.userId,
          context.role,
          threadStore,
          threadChatMessageStore,
        );
      }

      return listChatMessages(
        trainerId,
        traineeId,
        context.userId,
        context.role,
        chatMessageStore,
      );
    });
  });

  router.post('/status/messages', (request, response) => {
    void runMessageRoute(request, response, async (context) => {
      if (context.role === 'trainee') {
        const body = parseQuestionMessageBody(request.body);

        if (!body) {
          response.status(400).json({ error: 'Invalid body' });
          return;
        }

        const result = await handleTraineeMessagePost(
          body,
          context,
          threadStore,
          threadChatMessageStore,
        );

        if (!result) {
          response.status(400).json({ error: 'Invalid body' });
          return;
        }

        return result;
      }

      const result = await handleTrainerMessagePost(
        request.body,
        context,
        threadStore,
        threadChatMessageStore,
        chatMessageStore,
      );

      if (!result) {
        response.status(400).json({ error: 'Invalid body' });
        return;
      }

      return result;
    });
  });

  return router;
}
