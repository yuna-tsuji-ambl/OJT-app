import type { MessageThread, MessageThreadListItem } from './messageTypes.js';

interface ThreadActivityTimestamps {
  updatedAt: string;
  createdAt: string;
}

function compareThreadsByLatestActivity(
  left: ThreadActivityTimestamps,
  right: ThreadActivityTimestamps,
): number {
  const updatedDiff =
    new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime();

  if (updatedDiff !== 0) {
    return updatedDiff;
  }

  return (
    new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
  );
}

export function sortMessageThreadsByLatestActivity(
  threads: MessageThread[],
): MessageThread[] {
  return [...threads].sort(compareThreadsByLatestActivity);
}

export function sortMessageThreadListItemsByLatestActivity(
  items: MessageThreadListItem[],
): MessageThreadListItem[] {
  return [...items].sort((left, right) =>
    compareThreadsByLatestActivity(left.thread, right.thread),
  );
}
