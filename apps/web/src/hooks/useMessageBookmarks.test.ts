import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { MessageBookmark } from '@ojt-app/shared';
import type { AuthUser } from '../auth/types';
import { useMessageBookmarks } from './useMessageBookmarks';

const fetchMessageBookmarks = vi.fn();
const createMessageBookmark = vi.fn();
const deleteMessageBookmark = vi.fn();
const updateMessageBookmarkMemo = vi.fn();

vi.mock('../api/messageBookmarkApi', () => ({
  fetchMessageBookmarks: (...args: unknown[]) => fetchMessageBookmarks(...args),
  createMessageBookmark: (...args: unknown[]) => createMessageBookmark(...args),
  deleteMessageBookmark: (...args: unknown[]) => deleteMessageBookmark(...args),
  updateMessageBookmarkMemo: (...args: unknown[]) =>
    updateMessageBookmarkMemo(...args),
}));

const TRAINEE_USER: AuthUser = {
  userId: 'trainee-1',
  role: 'trainee',
};

function threadBookmark(
  id: string,
  threadId: string,
  createdAt = '2026-08-01T00:00:00.000Z',
): MessageBookmark {
  return {
    id,
    ownerUserId: TRAINEE_USER.userId,
    targetType: 'thread',
    threadId,
    createdAt,
  };
}

function messageBookmark(
  id: string,
  threadId: string,
  messageId: string,
  createdAt = '2026-08-01T00:00:00.000Z',
): MessageBookmark {
  return {
    id,
    ownerUserId: TRAINEE_USER.userId,
    targetType: 'message',
    threadId,
    messageId,
    createdAt,
  };
}

describe('useMessageBookmarks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetchMessageBookmarks.mockResolvedValue([]);
    createMessageBookmark.mockResolvedValue(
      threadBookmark('bm-new', 'thread-a'),
    );
    deleteMessageBookmark.mockResolvedValue(undefined);
    updateMessageBookmarkMemo.mockResolvedValue(
      messageBookmark('bm-new', 'thread-a', 'msg-1'),
    );
  });

  it('U-BM01: トークブックマークを追加する', async () => {
    const { result } = renderHook(() => useMessageBookmarks(TRAINEE_USER));

    await waitFor(() => {
      expect(fetchMessageBookmarks).toHaveBeenCalledWith(TRAINEE_USER);
    });

    fetchMessageBookmarks.mockResolvedValue([
      threadBookmark('bm-1', 'thread-a'),
    ]);

    await act(async () => {
      await result.current.toggleThreadBookmark('thread-a');
    });

    expect(createMessageBookmark).toHaveBeenCalledWith(TRAINEE_USER, {
      targetType: 'thread',
      threadId: 'thread-a',
    });
    expect(result.current.bookmarkedThreadIds.has('thread-a')).toBe(true);
  });

  it('U-BM02: トークブックマークを解除する', async () => {
    fetchMessageBookmarks.mockResolvedValue([
      threadBookmark('bm-1', 'thread-a'),
    ]);

    const { result } = renderHook(() => useMessageBookmarks(TRAINEE_USER));

    await waitFor(() => {
      expect(result.current.bookmarkedThreadIds.has('thread-a')).toBe(true);
    });

    fetchMessageBookmarks.mockResolvedValue([]);

    await act(async () => {
      await result.current.toggleThreadBookmark('thread-a');
    });

    expect(deleteMessageBookmark).toHaveBeenCalledWith(TRAINEE_USER, 'bm-1');
    expect(result.current.bookmarkedThreadIds.has('thread-a')).toBe(false);
  });

  it('U-BM10/U-BM11: メッセージブックマークを ON/OFF する', async () => {
    const { result } = renderHook(() => useMessageBookmarks(TRAINEE_USER));

    await waitFor(() => {
      expect(fetchMessageBookmarks).toHaveBeenCalled();
    });

    createMessageBookmark.mockResolvedValue(
      messageBookmark('bm-m1', 'thread-a', 'msg-1'),
    );
    fetchMessageBookmarks.mockResolvedValue([
      messageBookmark('bm-m1', 'thread-a', 'msg-1'),
    ]);

    await act(async () => {
      await result.current.toggleMessageBookmark('thread-a', 'msg-1');
    });

    expect(createMessageBookmark).toHaveBeenCalledWith(TRAINEE_USER, {
      targetType: 'message',
      threadId: 'thread-a',
      messageId: 'msg-1',
    });
    expect(result.current.bookmarkedMessageIds.has('msg-1')).toBe(true);

    fetchMessageBookmarks.mockResolvedValue([]);

    await act(async () => {
      await result.current.toggleMessageBookmark('thread-a', 'msg-1');
    });

    expect(deleteMessageBookmark).toHaveBeenCalledWith(TRAINEE_USER, 'bm-m1');
    expect(result.current.bookmarkedMessageIds.has('msg-1')).toBe(false);
  });

  it('連打時は同一対象の二重リクエストを抑止する', async () => {
    let resolveCreate: ((value: MessageBookmark) => void) | undefined;
    createMessageBookmark.mockImplementation(
      () =>
        new Promise<MessageBookmark>((resolve) => {
          resolveCreate = resolve;
        }),
    );

    const { result } = renderHook(() => useMessageBookmarks(TRAINEE_USER));

    await waitFor(() => {
      expect(fetchMessageBookmarks).toHaveBeenCalled();
    });

    await act(async () => {
      const first = result.current.toggleThreadBookmark('thread-a');
      const second = result.current.toggleThreadBookmark('thread-a');
      resolveCreate?.(threadBookmark('bm-1', 'thread-a'));
      fetchMessageBookmarks.mockResolvedValue([
        threadBookmark('bm-1', 'thread-a'),
      ]);
      await Promise.all([first, second]);
    });

    expect(createMessageBookmark).toHaveBeenCalledTimes(1);
  });

  it('API エラー時は bookmarkError を設定する', async () => {
    createMessageBookmark.mockRejectedValue(new Error('追加に失敗しました'));

    const { result } = renderHook(() => useMessageBookmarks(TRAINEE_USER));

    await waitFor(() => {
      expect(fetchMessageBookmarks).toHaveBeenCalled();
    });

    await act(async () => {
      await result.current.toggleThreadBookmark('thread-a');
    });

    expect(result.current.bookmarkError).toBe('追加に失敗しました');
  });

  it('U-BM-FE01: 取得失敗時は bookmarkError を立てず空一覧のまま', async () => {
    fetchMessageBookmarks.mockRejectedValue(
      new Error('ブックマークを取得できませんでした'),
    );

    const { result } = renderHook(() => useMessageBookmarks(TRAINEE_USER));

    await waitFor(() => {
      expect(fetchMessageBookmarks).toHaveBeenCalled();
    });

    expect(result.current.bookmarkError).toBeNull();
    expect(result.current.bookmarks).toEqual([]);
  });

  it('U-BM18: メッセージBMのメモを更新する', async () => {
    fetchMessageBookmarks.mockResolvedValue([
      messageBookmark('bm-1', 'thread-a', 'msg-1'),
    ]);
    updateMessageBookmarkMemo.mockResolvedValue(
      messageBookmark('bm-1', 'thread-a', 'msg-1'),
    );

    const { result } = renderHook(() => useMessageBookmarks(TRAINEE_USER));

    await waitFor(() => {
      expect(result.current.messageBookmarks).toHaveLength(1);
    });

    fetchMessageBookmarks.mockResolvedValue([
      {
        ...messageBookmark('bm-1', 'thread-a', 'msg-1'),
        memo: '個人メモ',
      },
    ]);

    await act(async () => {
      await result.current.updateBookmarkMemo('bm-1', '個人メモ');
    });

    expect(updateMessageBookmarkMemo).toHaveBeenCalledWith(
      TRAINEE_USER,
      'bm-1',
      '個人メモ',
    );
    expect(result.current.messageBookmarks[0]?.memo).toBe('個人メモ');
  });
});
