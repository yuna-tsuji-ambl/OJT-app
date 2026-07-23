import type { MessageThreadListItem } from '@ojt-app/shared';

/** 一覧は `updatedAt` 降順で表示する前提で先頭スレッドを選択する */
export function selectLatestThreadId(
  threads: MessageThreadListItem[],
): string | null {
  return threads[0]?.thread.id ?? null;
}
