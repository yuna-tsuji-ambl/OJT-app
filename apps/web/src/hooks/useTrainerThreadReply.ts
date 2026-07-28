import { useCallback, useState } from 'react';
import {
  sendTrainerStampReply,
  sendTrainerTemplateReply,
} from '../api/messageThreadApi';
import type { AuthUser } from '../auth/types';
import type { SyncMessageThreadViews } from '../domain/messageThreadView';
import {
  createTrainerStampReplyPayload,
  createTrainerTemplateReplyPayload,
} from '../domain/trainerThreadReply';

export function useTrainerThreadReply(
  selectedThreadId: string | null,
  syncThreadViews: SyncMessageThreadViews,
) {
  const [selectedReplyTemplateId, setSelectedReplyTemplateId] = useState('');

  const sendReply = useCallback(
    async (authUser: AuthUser): Promise<void> => {
      if (!selectedThreadId || !selectedReplyTemplateId) {
        return;
      }

      await sendTrainerTemplateReply(
        createTrainerTemplateReplyPayload(
          selectedThreadId,
          selectedReplyTemplateId,
        ),
        authUser,
      );
      setSelectedReplyTemplateId('');
      await syncThreadViews(authUser, selectedThreadId);
    },
    [selectedReplyTemplateId, selectedThreadId, syncThreadViews],
  );

  const sendStampReply = useCallback(
    async (authUser: AuthUser, stampId: string): Promise<void> => {
      if (!selectedThreadId) {
        return;
      }

      await sendTrainerStampReply(
        createTrainerStampReplyPayload(selectedThreadId, stampId),
        authUser,
      );
      await syncThreadViews(authUser, selectedThreadId);
    },
    [selectedThreadId, syncThreadViews],
  );

  return {
    selectedReplyTemplateId,
    setSelectedReplyTemplateId,
    sendReply,
    sendStampReply,
  };
}
