import { useCallback, useState } from 'react';
import {
  sendTraineeThreadStampMessage,
  sendTraineeThreadTemplateMessage,
  sendTraineeThreadTextMessage,
} from '../api/messageThreadApi';
import type { AuthUser } from '../auth/types';
import {
  hasDualSendPayload,
  resolveDualSendParts,
} from '../domain/messageDualSend';
import type { SyncMessageThreadViews } from '../domain/messageThreadView';
import {
  createTraineeThreadStampReplyPayload,
  createTraineeThreadTemplateReplyPayload,
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
      if (!selectedThreadId) {
        return;
      }

      const parts = resolveDualSendParts(selectedTemplateId, freeTextContent);

      if (!hasDualSendPayload(parts)) {
        return;
      }

      if (parts.templateId) {
        await sendTraineeThreadTemplateMessage(
          createTraineeThreadTemplateReplyPayload(
            selectedThreadId,
            parts.templateId,
          ),
          authUser,
        );
        setSelectedTemplateId('');
      }

      if (parts.freeText) {
        await sendTraineeThreadTextMessage(
          createTraineeThreadTextReplyPayload(selectedThreadId, parts.freeText),
          authUser,
        );
        setFreeTextContent('');
      }

      await syncThreadViews(authUser, selectedThreadId);
    },
    [freeTextContent, selectedTemplateId, selectedThreadId, syncThreadViews],
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
