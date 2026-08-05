import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  isInlineThreadDetailOpen,
  MESSAGE_THREAD_INLINE_DETAIL_OPEN_STATE,
  type MessageThreadListItem,
} from '@ojt-app/shared';
import type { AuthUser } from '../auth/types';
import { useMessageThreadRooms } from './useMessageThreadRooms';
import { useMessageThreads } from './useMessageThreads';

const THREAD_A = 'thread-a';
const THREAD_B = 'thread-b';
const REALISTIC_THREAD_ID = 'thread-r-m17-0';

const TRAINEE_USER: AuthUser = {
  userId: 'trainee-1',
  role: 'trainee',
};

const TRAINER_USER: AuthUser = {
  userId: 'trainer-1',
  role: 'trainer',
};

const THREAD_SELECTION_CASES = [
  {
    label: '新卒コンテキスト',
    authUser: TRAINEE_USER,
    threadId: THREAD_A,
  },
  {
    label: 'トレーナーコンテキスト',
    authUser: TRAINER_USER,
    threadId: THREAD_B,
  },
  {
    label: '実在threadId形式',
    authUser: TRAINEE_USER,
    threadId: REALISTIC_THREAD_ID,
  },
] as const;

const RESELECT_KEEP_CASES = [
  {
    label: '新卒コンテキスト',
    authUser: TRAINEE_USER,
    threadId: THREAD_A,
  },
  {
    label: 'トレーナーコンテキスト',
    authUser: TRAINER_USER,
    threadId: THREAD_B,
  },
  {
    label: '実在threadId形式',
    authUser: TRAINEE_USER,
    threadId: REALISTIC_THREAD_ID,
  },
] as const;

const reloadThreadHistory = vi.fn().mockResolvedValue([]);
const reloadThreads = vi.fn().mockResolvedValue(undefined);

function createThreadItem(threadId: string): MessageThreadListItem {
  return {
    thread: {
      id: threadId,
      trainerId: 'trainer-1',
      traineeId: 'trainee-1',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
    firstMessage: {
      id: `msg-${threadId}`,
      threadId,
      senderId: 'trainee-1',
      receiverId: 'trainer-1',
      content: `preview-${threadId}`,
      type: 'text',
      createdAt: '2026-01-01T00:00:00.000Z',
    },
  };
}

vi.mock('./useMessageThreads', () => ({
  useMessageThreads: vi.fn(() => ({
    threads: [],
    reloadThreads,
  })),
}));

vi.mock('./useMessageThreadHistory', () => ({
  useMessageThreadHistory: vi.fn(() => ({
    threadMessages: [],
    reloadThreadHistory,
    historyError: null,
  })),
}));

const mockedUseMessageThreads = vi.mocked(useMessageThreads);

describe('U-M23 ルーム選択で履歴取得が走る', () => {
  beforeEach(() => {
    reloadThreadHistory.mockClear();
    reloadThreads.mockClear();
    mockedUseMessageThreads.mockReturnValue({
      threads: [],
      reloadThreads,
    });
  });

  it('selectThread_ルーム選択_選択ID更新と履歴取得が1回呼ばれる', () => {
    const { result } = renderHook(() => useMessageThreadRooms(TRAINEE_USER));

    act(() => {
      result.current.selectThread(THREAD_A);
    });

    expect(result.current.inlineDetail.selectedThreadId).toBe(THREAD_A);
    expect(result.current.inlineDetail.inlineDetailState).toBe(
      MESSAGE_THREAD_INLINE_DETAIL_OPEN_STATE,
    );
    expect(reloadThreadHistory).toHaveBeenCalledTimes(1);
    expect(reloadThreadHistory).toHaveBeenCalledWith(TRAINEE_USER, THREAD_A);
  });

  it('selectThread_未ログイン_選択IDのみ更新し履歴取得しない', () => {
    const { result } = renderHook(() => useMessageThreadRooms(null));

    act(() => {
      result.current.selectThread(THREAD_A);
    });

    expect(result.current.inlineDetail.selectedThreadId).toBe(THREAD_A);
    expect(reloadThreadHistory).not.toHaveBeenCalled();
  });

  it.each(THREAD_SELECTION_CASES)(
    'selectThread_$labelでルーム選択_当該threadIdで履歴取得する',
    ({ authUser, threadId }) => {
      const { result } = renderHook(() => useMessageThreadRooms(authUser));

      act(() => {
        result.current.selectThread(threadId);
      });

      expect(result.current.inlineDetail.selectedThreadId).toBe(threadId);
      expect(reloadThreadHistory).toHaveBeenCalledTimes(1);
      expect(reloadThreadHistory).toHaveBeenCalledWith(authUser, threadId);
    },
  );
});

describe('U-SV06 / BR-SV09 再クリックでも選択維持', () => {
  beforeEach(() => {
    reloadThreadHistory.mockClear();
    reloadThreads.mockClear();
    mockedUseMessageThreads.mockReturnValue({
      threads: [],
      reloadThreads,
    });
  });

  it('selectThread_選択中ルーム再クリック_選択を維持し履歴を再取得しない', () => {
    const { result } = renderHook(() => useMessageThreadRooms(TRAINEE_USER));

    act(() => {
      result.current.selectThread(THREAD_A);
    });
    reloadThreadHistory.mockClear();

    act(() => {
      result.current.selectThread(THREAD_A);
    });

    expect(result.current.inlineDetail.selectedThreadId).toBe(THREAD_A);
    expect(
      isInlineThreadDetailOpen(result.current.inlineDetail.selectedThreadId),
    ).toBe(true);
    expect(result.current.inlineDetail.inlineDetailState).toBe(
      MESSAGE_THREAD_INLINE_DETAIL_OPEN_STATE,
    );
    expect(reloadThreadHistory).toHaveBeenCalledTimes(1);
  });

  it.each(RESELECT_KEEP_CASES)(
    'selectThread_$labelで同一ルーム再選択_詳細を維持する',
    ({ authUser, threadId }) => {
      const { result } = renderHook(() => useMessageThreadRooms(authUser));

      act(() => {
        result.current.selectThread(threadId);
      });
      reloadThreadHistory.mockClear();

      act(() => {
        result.current.selectThread(threadId);
      });

      expect(result.current.inlineDetail.selectedThreadId).toBe(threadId);
      expect(
        isInlineThreadDetailOpen(result.current.inlineDetail.selectedThreadId),
      ).toBe(true);
    },
  );
});

describe('U-SV09 最新トーク自動選択', () => {
  beforeEach(() => {
    reloadThreadHistory.mockClear();
    reloadThreads.mockClear();
  });

  it('threads読み込み後_先頭トークを自動選択する', async () => {
    mockedUseMessageThreads.mockReturnValue({
      threads: [createThreadItem(THREAD_A), createThreadItem(THREAD_B)],
      reloadThreads,
    });

    const { result } = renderHook(() => useMessageThreadRooms(TRAINEE_USER));

    await waitFor(() => {
      expect(result.current.inlineDetail.selectedThreadId).toBe(THREAD_A);
    });
    expect(result.current.inlineDetail.inlineDetailState).toBe(
      MESSAGE_THREAD_INLINE_DETAIL_OPEN_STATE,
    );
    expect(reloadThreadHistory).toHaveBeenCalledWith(TRAINEE_USER, THREAD_A);
  });
});
