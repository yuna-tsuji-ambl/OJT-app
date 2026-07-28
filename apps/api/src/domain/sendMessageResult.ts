import type {
  MessageThread,
  SendMessageResult,
  ThreadChatMessage,
} from './messageTypes.js';
import { touchMessageThreadActivity } from './touchMessageThreadActivity.js';

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
  return messages.map((message) =>
    createSendMessageResult(
      touchMessageThreadActivity(thread, message.createdAt),
      message,
    ),
  );
}
