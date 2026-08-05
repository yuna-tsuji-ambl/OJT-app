import { MESSAGE_UPDATE_TYPE } from './messageRealtimeConstants.js';
import type {
  MessageCreatedUpdateEvent,
  MessageRealtimeHub,
  MessageUpdateListener,
} from './messageRealtimeTypes.js';
import type {
  SendMessageResult,
  MessageThread,
  ThreadChatMessage,
} from './messageTypes.js';
import { buildMessageCreatedResults } from './sendMessageResult.js';

export function createMessageCreatedEvent(
  result: SendMessageResult,
): MessageCreatedUpdateEvent {
  return {
    type: MESSAGE_UPDATE_TYPE.MESSAGE_CREATED,
    thread: result.thread,
    message: result.message,
  };
}

export function publishMessageCreated(
  realtimeHub: MessageRealtimeHub | undefined,
  trainerId: string,
  traineeId: string,
  result: SendMessageResult,
): void {
  if (!realtimeHub) {
    return;
  }

  realtimeHub.publish(trainerId, traineeId, createMessageCreatedEvent(result));
}

export function notifyMessageCreated(
  realtimeHub: MessageRealtimeHub | undefined,
  result: SendMessageResult,
): void {
  publishMessageCreated(
    realtimeHub,
    result.thread.trainerId,
    result.thread.traineeId,
    result,
  );
}

export function dispatchMessageCreatedUpdates(
  listener: MessageUpdateListener,
  results: SendMessageResult[],
): void {
  for (const result of results) {
    listener(createMessageCreatedEvent(result));
  }
}

export function dispatchMissedMessageCreatedUpdates(
  listener: MessageUpdateListener,
  thread: MessageThread,
  messages: ThreadChatMessage[],
): void {
  dispatchMessageCreatedUpdates(
    listener,
    buildMessageCreatedResults(thread, messages),
  );
}
