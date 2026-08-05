import { useCallback, useState } from 'react';
import {
  sendTrainerStampReply,
  sendTrainerTemplateReply,
  sendTrainerTextReply,
} from '../api/messageThreadApi';
import type { AuthUser } from '../auth/types';
import {
  formatMessageSendError,
  hasDualSendPayload,
  resolveDualSendParts,
  runDualSendSequence,
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
        await runDualSendSequence(
          parts,
          async (templateId) => {
            await sendTrainerTemplateReply(
              createTrainerTemplateReplyPayload(selectedThreadId, templateId),
              authUser,
            );
            setSelectedReplyTemplateId('');
          },
          async (freeText) => {
            await sendTrainerTextReply(
              createTrainerTextReplyPayload(selectedThreadId, freeText),
              authUser,
            );
            setReplyFreeTextContent('');
          },
        );

        await syncThreadViews(authUser, selectedThreadId);
      } catch (error: unknown) {
        setSendError(formatMessageSendError(error, '返信の送信に失敗しました'));
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
          formatMessageSendError(error, 'スタンプの送信に失敗しました'),
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
