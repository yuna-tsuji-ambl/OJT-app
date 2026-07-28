export const MESSAGE_THREAD_HISTORY_LOG_LABEL = 'スレッド履歴' as const;

export function scrollMessageThreadHistoryToBottom(element: HTMLElement): void {
  element.scrollTop = element.scrollHeight;
}
