import type { AuthUser } from '../auth/types';
import type {
  MessageThreadListItem,
  SendMessageResult,
  ThreadChatMessage,
} from '@ojt-app/shared';
import { selectLatestThreadId } from '../domain/messageThreadSelection';
import { fetchWithAuth } from './authHeaders';
import { parseJsonResponse } from './jsonResponse';
import type {
  TrainerMessagePayload,
  TrainerNewMessagePayload,
  TrainerNewTextMessagePayload,
  TrainerStampReplyPayload,
  TrainerTextReplyPayload,
  TrainerThreadReplyPayload,
  TraineeMessagePayload,
  TraineeThreadTemplateReplyPayload,
  TraineeThreadTextReplyPayload,
  TraineeThreadStampReplyPayload,
} from './messageThreadApiTypes';

export type {
  TrainerMessagePayload,
  TrainerNewMessagePayload,
  TrainerNewTextMessagePayload,
  TrainerStampReplyPayload,
  TrainerTextReplyPayload,
  TrainerThreadReplyPayload,
  TraineeMessagePayload,
  TraineeThreadTemplateReplyPayload,
  TraineeThreadTextReplyPayload,
  TraineeThreadStampReplyPayload,
} from './messageThreadApiTypes';

const MESSAGES_ENDPOINT = '/api/status/messages';
const MESSAGE_THREADS_VIEW = 'threads';
const MESSAGE_THREAD_VIEW = 'thread';

async function postMessage(
  payload: TraineeMessagePayload | TrainerMessagePayload,
  user: AuthUser,
  errorMessage: string,
): Promise<SendMessageResult> {
  const response = await fetchWithAuth(MESSAGES_ENDPOINT, user, {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  return parseJsonResponse(response, errorMessage);
}

async function fetchParticipantMessages<T>(
  params: Record<string, string>,
  user: AuthUser,
  errorMessage: string,
): Promise<T> {
  const searchParams = new URLSearchParams(params);
  const response = await fetchWithAuth(
    `${MESSAGES_ENDPOINT}?${searchParams.toString()}`,
    user,
  );

  return parseJsonResponse(response, errorMessage);
}

export async function sendTraineeTemplateMessage(
  trainerId: string,
  templateId: string,
  user: AuthUser,
): Promise<SendMessageResult> {
  return postMessage(
    { trainerId, templateId },
    user,
    'Failed to send template message',
  );
}

export async function sendTraineeTextMessage(
  trainerId: string,
  content: string,
  user: AuthUser,
): Promise<SendMessageResult> {
  return postMessage(
    { trainerId, content },
    user,
    'Failed to send text message',
  );
}

export async function sendTraineeThreadTextMessage(
  payload: TraineeThreadTextReplyPayload,
  user: AuthUser,
): Promise<SendMessageResult> {
  return postMessage(payload, user, 'Failed to send thread text message');
}

export async function sendTraineeThreadTemplateMessage(
  payload: TraineeThreadTemplateReplyPayload,
  user: AuthUser,
): Promise<SendMessageResult> {
  return postMessage(payload, user, 'Failed to send thread template message');
}

export async function sendTraineeThreadStampMessage(
  payload: TraineeThreadStampReplyPayload,
  user: AuthUser,
): Promise<SendMessageResult> {
  return postMessage(payload, user, 'Failed to send thread stamp message');
}

export async function fetchMessageThreads(
  trainerId: string,
  traineeId: string,
  user: AuthUser,
): Promise<MessageThreadListItem[]> {
  return fetchParticipantMessages(
    {
      trainerId,
      traineeId,
      view: MESSAGE_THREADS_VIEW,
    },
    user,
    'Failed to fetch message threads',
  );
}

export async function fetchThreadChatMessages(
  trainerId: string,
  traineeId: string,
  threadId: string,
  user: AuthUser,
): Promise<ThreadChatMessage[]> {
  return fetchParticipantMessages(
    {
      trainerId,
      traineeId,
      view: MESSAGE_THREAD_VIEW,
      threadId,
    },
    user,
    'Failed to fetch thread chat messages',
  );
}

export async function fetchLatestThreadChatMessages(
  trainerId: string,
  traineeId: string,
  user: AuthUser,
): Promise<ThreadChatMessage[]> {
  const threads = await fetchMessageThreads(trainerId, traineeId, user);
  const threadId = selectLatestThreadId(threads);

  if (!threadId) {
    return [];
  }

  return fetchThreadChatMessages(trainerId, traineeId, threadId, user);
}

export async function fetchParticipantThreadHistory(
  trainerId: string,
  traineeId: string,
  threadId: string | null,
  user: AuthUser,
): Promise<ThreadChatMessage[]> {
  if (threadId) {
    return fetchThreadChatMessages(trainerId, traineeId, threadId, user);
  }

  return fetchLatestThreadChatMessages(trainerId, traineeId, user);
}

export async function sendTrainerTemplateReply(
  payload: TrainerThreadReplyPayload,
  user: AuthUser,
): Promise<SendMessageResult> {
  return postMessage(payload, user, 'Failed to send trainer template reply');
}

export async function sendTrainerStampReply(
  payload: TrainerStampReplyPayload,
  user: AuthUser,
): Promise<SendMessageResult> {
  return postMessage(payload, user, 'Failed to send trainer stamp reply');
}

export async function sendTrainerTextReply(
  payload: TrainerTextReplyPayload,
  user: AuthUser,
): Promise<SendMessageResult> {
  return postMessage(payload, user, 'Failed to send trainer text reply');
}

export async function sendTrainerNewMessage(
  payload: TrainerNewMessagePayload,
  user: AuthUser,
): Promise<SendMessageResult> {
  return postMessage(payload, user, 'Failed to send trainer new message');
}

export async function sendTrainerTextMessage(
  payload: TrainerNewTextMessagePayload,
  user: AuthUser,
): Promise<SendMessageResult> {
  return postMessage(payload, user, 'Failed to send trainer text message');
}
