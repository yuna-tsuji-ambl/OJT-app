/** メッセージ BM / アナウンス共通のメモ最大文字数 */
export const MESSAGE_MEMO_MAX_LENGTH = 500;

export function normalizeOptionalMemo(memo: string): string | undefined {
  const trimmed = memo.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function isMemoWithinMaxLength(
  memo: string,
  maxLength: number = MESSAGE_MEMO_MAX_LENGTH,
): boolean {
  return memo.length <= maxLength;
}

export function buildMemoTooLongMessage(
  maxLength: number = MESSAGE_MEMO_MAX_LENGTH,
): string {
  return `Memo must be at most ${maxLength} characters`;
}
