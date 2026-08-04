import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  applyInlineMessageThreadDetailSelection,
  createInitialInlineMessageThreadDetailState,
  FIRST_MESSAGE_THREAD_LIST_PAGE,
  paginateMessageThreads,
  shouldClearInlineMessageThreadDetailOnThreadCountIncrease,
  type MessageThreadId,
  type MessageThreadSelection,
} from '@ojt-app/shared';
import type { AuthUser } from '../auth/types';
import { selectLatestThreadId } from '../domain/messageThreadSelection';
import { createSyncMessageThreadViews } from '../domain/messageThreadView';
import { useInlineMessageThreadDetail } from './useInlineMessageThreadDetail';
import { useMessageThreadHistory } from './useMessageThreadHistory';
import { useMessageThreads } from './useMessageThreads';

export function useMessageThreadRooms(user: AuthUser | null) {
  const [threadListPage, setThreadListPage] = useState(
    FIRST_MESSAGE_THREAD_LIST_PAGE,
  );
  const { threads, reloadThreads } = useMessageThreads(user);
  const previousThreadCountRef = useRef(threads.length);

  const {
    detailState,
    selectedThreadIdRef,
    clearInlineThreadSelection,
    openInlineDetail,
    applyDetailState,
  } = useInlineMessageThreadDetail();

  const { threadMessages, reloadThreadHistory, historyError } =
    useMessageThreadHistory(user, detailState.selectedThreadId);

  const reloadHistoryIfSelected = useCallback(
    (selection: MessageThreadSelection) => {
      if (selection !== null && user) {
        void reloadThreadHistory(user, selection);
      }
    },
    [reloadThreadHistory, user],
  );

  const openInlineDetailWithHistory = useCallback(
    (threadId: MessageThreadId) => {
      openInlineDetail(threadId);
      reloadHistoryIfSelected(threadId);
    },
    [openInlineDetail, reloadHistoryIfSelected],
  );

  const selectThread = useCallback(
    (clickedThreadId: MessageThreadId) => {
      const nextState = applyInlineMessageThreadDetailSelection(
        clickedThreadId,
        selectedThreadIdRef.current,
        applyDetailState,
      );

      reloadHistoryIfSelected(nextState.selectedThreadId);
    },
    [applyDetailState, reloadHistoryIfSelected, selectedThreadIdRef],
  );

  useEffect(() => {
    const previousCount = previousThreadCountRef.current;
    previousThreadCountRef.current = threads.length;

    if (
      shouldClearInlineMessageThreadDetailOnThreadCountIncrease(
        previousCount,
        threads.length,
        detailState,
      )
    ) {
      applyDetailState(createInitialInlineMessageThreadDetailState());
    }
  }, [applyDetailState, detailState, threads.length]);

  // BR-SV07 / BR-SV08: 最新自動選択。一覧が非空→空になったときだけ選択クリア
  const previousThreadsLengthForAutoSelectRef = useRef(threads.length);

  useEffect(() => {
    const previousLength = previousThreadsLengthForAutoSelectRef.current;
    previousThreadsLengthForAutoSelectRef.current = threads.length;

    if (threads.length === 0) {
      if (previousLength > 0 && detailState.selectedThreadId !== null) {
        clearInlineThreadSelection();
      }
      return;
    }

    const latestId = selectLatestThreadId(threads);
    if (!latestId) {
      return;
    }

    const selectedStillExists = threads.some(
      (item) => item.thread.id === detailState.selectedThreadId,
    );

    if (detailState.selectedThreadId === null || !selectedStillExists) {
      openInlineDetailWithHistory(latestId);
    }
  }, [
    clearInlineThreadSelection,
    detailState.selectedThreadId,
    openInlineDetailWithHistory,
    threads,
  ]);

  const paginatedThreads = useMemo(
    () => paginateMessageThreads(threads, threadListPage),
    [threadListPage, threads],
  );

  useEffect(() => {
    if (threadListPage > paginatedThreads.totalPages) {
      setThreadListPage(FIRST_MESSAGE_THREAD_LIST_PAGE);
    }
  }, [paginatedThreads.totalPages, threadListPage]);

  const reloadThreadList = useCallback(
    async (authUser: AuthUser): Promise<void> => {
      await reloadThreads(authUser);
    },
    [reloadThreads],
  );

  const syncThreadViews = useMemo(
    () =>
      createSyncMessageThreadViews(
        reloadThreadList,
        reloadThreadHistory,
        detailState.selectedThreadId,
        openInlineDetailWithHistory,
      ),
    [
      detailState.selectedThreadId,
      openInlineDetailWithHistory,
      reloadThreadHistory,
      reloadThreadList,
    ],
  );

  const goToNextThreadListPage = useCallback(() => {
    setThreadListPage((currentPage) => currentPage + 1);
  }, []);

  return {
    threads,
    visibleThreads: paginatedThreads.items,
    threadListPage,
    threadListTotalPages: paginatedThreads.totalPages,
    goToNextThreadListPage,
    threadMessages,
    historyError,
    inlineDetail: detailState,
    selectThread,
    clearInlineThreadSelection,
    syncThreadViews,
    reloadThreadList,
  };
}
