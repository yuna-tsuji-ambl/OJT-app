import type {
  MessageThread,
  SendMessageResult,
  ThreadChatMessage,
} from './messageTypes.js';

export function createSendMessageResult(
  thread: MessageThread,
  message: ThreadChatMessage,
): SendMessageResult {
  return { thread, message };
}

export function buildMessageCreatedResults(
  thread: MessageThread,
  messages: ThreadChatMessage[],
): SendMessageResult[] {
  return messages.map((message) => createSendMessageResult(thread, message));
}
