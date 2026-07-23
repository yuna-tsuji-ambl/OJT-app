import type {
  MessageThread,
  MessageThreadListItem,
  ThreadChatMessage,
} from './messageTypes.js';

export function buildMessageThreadListItem(
  thread: MessageThread,
  messages: ThreadChatMessage[],
): MessageThreadListItem | null {
  const firstMessage = messages[0];

  if (!firstMessage) {
    return null;
  }

  return { thread, firstMessage };
}

export function sortThreadChatMessagesChronologically(
  messages: ThreadChatMessage[],
): ThreadChatMessage[] {
  return [...messages].sort(
    (left, right) =>
      new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime(),
  );
}

export async function listMessageThreadListItems(
  threads: MessageThread[],
  listMessagesByThreadId: (threadId: string) => Promise<ThreadChatMessage[]>,
): Promise<MessageThreadListItem[]> {
  const items: MessageThreadListItem[] = [];

  for (const thread of threads) {
    const messages = sortThreadChatMessagesChronologically(
      await listMessagesByThreadId(thread.id),
    );
    const item = buildMessageThreadListItem(thread, messages);

    if (item) {
      items.push(item);
    }
  }

  return items;
}
