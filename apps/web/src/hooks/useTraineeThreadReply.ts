import { useCallback, useState } from 'react';
import {
  sendTraineeThreadStampMessage,
  sendTraineeThreadTextMessage,
} from '../api/messageThreadApi';
import type { AuthUser } from '../auth/types';
import type { SyncMessageThreadViews } from '../domain/messageThreadView';
import {
  createTraineeThreadStampReplyPayload,
  createTraineeThreadTextReplyPayload,
} from '../domain/traineeThreadReply';

export function useTraineeThreadReply(
  selectedThreadId: string | null,
  syncThreadViews: SyncMessageThreadViews,
) {
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [freeTextContent, setFreeTextContent] = useState('');

  const sendThreadMessage = useCallback(
    async (authUser: AuthUser): Promise<void> => {
      if (!selectedThreadId || !freeTextContent.trim()) {
        return;
      }

      await sendTraineeThreadTextMessage(
        createTraineeThreadTextReplyPayload(
          selectedThreadId,
          freeTextContent.trim(),
        ),
        authUser,
      );
      setFreeTextContent('');
      await syncThreadViews(authUser, selectedThreadId);
    },
    [freeTextContent, selectedThreadId, syncThreadViews],
  );

  const sendStampReply = useCallback(
    async (authUser: AuthUser, stampId: string): Promise<void> => {
      if (!selectedThreadId) {
        return;
      }

      await sendTraineeThreadStampMessage(
        createTraineeThreadStampReplyPayload(selectedThreadId, stampId),
        authUser,
      );
      await syncThreadViews(authUser, selectedThreadId);
    },
    [selectedThreadId, syncThreadViews],
  );

  return {
    selectedTemplateId,
    freeTextContent,
    setSelectedTemplateId,
    setFreeTextContent,
    sendThreadMessage,
    sendStampReply,
  };
}
