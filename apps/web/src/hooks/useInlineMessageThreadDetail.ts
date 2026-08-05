import { useCallback, useEffect, useRef, useState } from 'react';
import {
  createInitialInlineMessageThreadDetailState,
  createOpenInlineMessageThreadDetailState,
  type InlineMessageThreadDetailState,
  type MessageThreadSelection,
} from '@ojt-app/shared';

export function useInlineMessageThreadDetail() {
  const [detailState, setDetailState] = useState(
    createInitialInlineMessageThreadDetailState,
  );
  const selectedThreadIdRef = useRef<MessageThreadSelection>(null);

  useEffect(() => {
    selectedThreadIdRef.current = detailState.selectedThreadId;
  }, [detailState.selectedThreadId]);

  const applyDetailState = useCallback(
    (nextState: InlineMessageThreadDetailState) => {
      setDetailState(nextState);
      selectedThreadIdRef.current = nextState.selectedThreadId;
    },
    [],
  );

  const clearInlineThreadSelection = useCallback(() => {
    applyDetailState(createInitialInlineMessageThreadDetailState());
  }, [applyDetailState]);

  const openInlineDetail = useCallback(
    (threadId: NonNullable<MessageThreadSelection>) => {
      applyDetailState(createOpenInlineMessageThreadDetailState(threadId));
    },
    [applyDetailState],
  );

  useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent) => {
      if (!event.persisted) {
        return;
      }

      const reset = () => {
        clearInlineThreadSelection();
      };

      reset();
      requestAnimationFrame(reset);
    };

    window.addEventListener('pageshow', handlePageShow);

    return () => {
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, [clearInlineThreadSelection]);

  return {
    detailState,
    selectedThreadIdRef,
    clearInlineThreadSelection,
    openInlineDetail,
    applyDetailState,
  };
}
