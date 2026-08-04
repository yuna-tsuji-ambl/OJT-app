import { describe, expect, it } from 'vitest';
import {
  MESSAGE_MEMO_MAX_LENGTH,
  buildMemoTooLongMessage,
  isMemoWithinMaxLength,
  normalizeOptionalMemo,
} from './messageMemo.js';

describe('messageMemo', () => {
  it('空白のみは未設定扱いに正規化する', () => {
    expect(normalizeOptionalMemo('  ')).toBeUndefined();
    expect(normalizeOptionalMemo('  hello  ')).toBe('hello');
  });

  it('最大長を判定する', () => {
    expect(isMemoWithinMaxLength('a'.repeat(MESSAGE_MEMO_MAX_LENGTH))).toBe(
      true,
    );
    expect(isMemoWithinMaxLength('a'.repeat(MESSAGE_MEMO_MAX_LENGTH + 1))).toBe(
      false,
    );
    expect(buildMemoTooLongMessage()).toContain(
      String(MESSAGE_MEMO_MAX_LENGTH),
    );
  });
});
