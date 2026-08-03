import { useCallback, useState } from 'react';
import {
  sendTraineeThreadStampMessage,
  sendTraineeThreadTemplateMessage,
  sendTraineeThreadTextMessage,
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
  const [sendError, setSendError] = useState<string | null>(null);

  const sendThreadMessage = useCallback(
    async (authUser: AuthUser): Promise<void> => {
      if (!selectedThreadId) {
        return;
      }

      const parts = resolveDualSendParts(selectedTemplateId, freeTextContent);

      if (!hasDualSendPayload(parts)) {
        return;
      }

      setSendError(null);

      try {
        await runDualSendSequence(
          parts,
          async (templateId) => {
            await sendTraineeThreadTemplateMessage(
              createTraineeThreadTemplateReplyPayload(
                selectedThreadId,
                templateId,
              ),
              authUser,
            );
            setSelectedTemplateId('');
          },
          async (freeText) => {
            await sendTraineeThreadTextMessage(
              createTraineeThreadTextReplyPayload(selectedThreadId, freeText),
              authUser,
            );
            setFreeTextContent('');
          },
        );

        await syncThreadViews(authUser, selectedThreadId);
      } catch (error: unknown) {
        setSendError(formatMessageSendError(error, '返信の送信に失敗しました'));
      }
    },
    [freeTextContent, selectedTemplateId, selectedThreadId, syncThreadViews],
  );

  const sendStampReply = useCallback(
    async (authUser: AuthUser, stampId: string): Promise<void> => {
      if (!selectedThreadId) {
        return;
      }

      setSendError(null);

      try {
        await sendTraineeThreadStampMessage(
          createTraineeThreadStampReplyPayload(selectedThreadId, stampId),
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
    selectedTemplateId,
    freeTextContent,
    setSelectedTemplateId,
    setFreeTextContent,
    sendThreadMessage,
    sendStampReply,
    sendError,
  };
}
