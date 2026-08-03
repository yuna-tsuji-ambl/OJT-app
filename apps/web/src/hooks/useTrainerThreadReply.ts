import { useCallback, useState } from 'react';
import {
  sendTrainerStampReply,
  sendTrainerTemplateReply,
  sendTrainerTextReply,
} from '../api/messageThreadApi';
import type { AuthUser } from '../auth/types';
import {
  hasDualSendPayload,
  resolveDualSendParts,
} from '../domain/messageDualSend';
import type { SyncMessageThreadViews } from '../domain/messageThreadView';
import {
  createTrainerStampReplyPayload,
  createTrainerTemplateReplyPayload,
  createTrainerTextReplyPayload,
} from '../domain/trainerThreadReply';

export function useTrainerThreadReply(
  selectedThreadId: string | null,
  syncThreadViews: SyncMessageThreadViews,
) {
  const [selectedReplyTemplateId, setSelectedReplyTemplateId] = useState('');
  const [replyFreeTextContent, setReplyFreeTextContent] = useState('');
  const [sendError, setSendError] = useState<string | null>(null);

  const sendReply = useCallback(
    async (authUser: AuthUser): Promise<void> => {
      if (!selectedThreadId) {
        return;
      }

      const parts = resolveDualSendParts(
        selectedReplyTemplateId,
        replyFreeTextContent,
      );

      if (!hasDualSendPayload(parts)) {
        return;
      }

      setSendError(null);

      try {
        if (parts.templateId) {
          await sendTrainerTemplateReply(
            createTrainerTemplateReplyPayload(
              selectedThreadId,
              parts.templateId,
            ),
            authUser,
          );
          setSelectedReplyTemplateId('');
        }

        if (parts.freeText) {
          await sendTrainerTextReply(
            createTrainerTextReplyPayload(selectedThreadId, parts.freeText),
            authUser,
          );
          setReplyFreeTextContent('');
        }

        await syncThreadViews(authUser, selectedThreadId);
      } catch (error: unknown) {
        setSendError(
          error instanceof Error ? error.message : '返信の送信に失敗しました',
        );
      }
    },
    [
      replyFreeTextContent,
      selectedReplyTemplateId,
      selectedThreadId,
      syncThreadViews,
    ],
  );

  const sendStampReply = useCallback(
    async (authUser: AuthUser, stampId: string): Promise<void> => {
      if (!selectedThreadId) {
        return;
      }

      setSendError(null);

      try {
        await sendTrainerStampReply(
          createTrainerStampReplyPayload(selectedThreadId, stampId),
          authUser,
        );
        await syncThreadViews(authUser, selectedThreadId);
      } catch (error: unknown) {
        setSendError(
          error instanceof Error
            ? error.message
            : 'スタンプの送信に失敗しました',
        );
      }
    },
    [selectedThreadId, syncThreadViews],
  );

  return {
    selectedReplyTemplateId,
    setSelectedReplyTemplateId,
    replyFreeTextContent,
    setReplyFreeTextContent,
    sendReply,
    sendStampReply,
    sendError,
  };
}
