import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  isInlineThreadDetailOpen,
  MESSAGE_THREAD_INLINE_DETAIL_CLOSED_STATE,
  MESSAGE_THREAD_INLINE_DETAIL_OPEN_STATE,
} from '@ojt-app/shared';
import type { AuthUser } from '../auth/types';
import { useMessageThreadRooms } from './useMessageThreadRooms';

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

const INLINE_DESELECT_CASES = [
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

describe('U-M23 ルーム選択で履歴取得が走る', () => {
  beforeEach(() => {
    reloadThreadHistory.mockClear();
    reloadThreads.mockClear();
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

describe('U-M24 選択解除でインライン詳細が非表示状態になる', () => {
  beforeEach(() => {
    reloadThreadHistory.mockClear();
    reloadThreads.mockClear();
  });

  it('selectThread_選択中ルーム再クリック_選択解除し履歴取得しない', () => {
    const { result } = renderHook(() => useMessageThreadRooms(TRAINEE_USER));

    act(() => {
      result.current.selectThread(THREAD_A);
    });
    reloadThreadHistory.mockClear();

    act(() => {
      result.current.selectThread(THREAD_A);
    });

    expect(result.current.inlineDetail.selectedThreadId).toBeNull();
    expect(
      isInlineThreadDetailOpen(result.current.inlineDetail.selectedThreadId),
    ).toBe(false);
    expect(result.current.inlineDetail.inlineDetailState).toBe(
      MESSAGE_THREAD_INLINE_DETAIL_CLOSED_STATE,
    );
    expect(reloadThreadHistory).not.toHaveBeenCalled();
  });

  it('selectThread_未ログインで再クリック_選択解除のみ行う', () => {
    const { result } = renderHook(() => useMessageThreadRooms(null));

    act(() => {
      result.current.selectThread(THREAD_A);
    });
    reloadThreadHistory.mockClear();

    act(() => {
      result.current.selectThread(THREAD_A);
    });

    expect(result.current.inlineDetail.selectedThreadId).toBeNull();
    expect(
      isInlineThreadDetailOpen(result.current.inlineDetail.selectedThreadId),
    ).toBe(false);
    expect(reloadThreadHistory).not.toHaveBeenCalled();
  });

  it.each(INLINE_DESELECT_CASES)(
    'selectThread_$labelで同一ルーム再選択_詳細非表示になる',
    ({ authUser, threadId }) => {
      const { result } = renderHook(() => useMessageThreadRooms(authUser));

      act(() => {
        result.current.selectThread(threadId);
      });
      reloadThreadHistory.mockClear();

      act(() => {
        result.current.selectThread(threadId);
      });

      expect(result.current.inlineDetail.selectedThreadId).toBeNull();
      expect(
        isInlineThreadDetailOpen(result.current.inlineDetail.selectedThreadId),
      ).toBe(false);
      expect(reloadThreadHistory).not.toHaveBeenCalled();
    },
  );
});
