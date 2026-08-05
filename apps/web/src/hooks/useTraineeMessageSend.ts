import { useCallback, useState } from 'react';
import {
  sendTraineeTemplateMessage,
  sendTraineeTextMessage,
  sendTraineeThreadTextMessage,
} from '../api/messageThreadApi';
import type { AuthUser } from '../auth/types';
import {
  formatMessageSendError,
  hasDualSendPayload,
  resolveDualSendParts,
  runDualSendSequence,
} from '../domain/messageDualSend';
import { DEFAULT_TRAINER_ID } from '../domain/participantConstants';
import { createTraineeThreadTextReplyPayload } from '../domain/traineeThreadReply';
import type { SendMessageResult } from '@ojt-app/shared';

export function useTraineeMessageSend(_user: AuthUser | null) {
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [freeTextContent, setFreeTextContent] = useState('');
  const [sendError, setSendError] = useState<string | null>(null);

  const sendMessage = useCallback(
    async (authUser: AuthUser): Promise<SendMessageResult | undefined> => {
      const parts = resolveDualSendParts(selectedTemplateId, freeTextContent);

      if (!hasDualSendPayload(parts)) {
        return undefined;
      }

      setSendError(null);

      try {
        let createdThreadId: string | undefined;

        const { templateResult, freeTextResult } = await runDualSendSequence(
          parts,
          async (templateId) => {
            const result = await sendTraineeTemplateMessage(
              DEFAULT_TRAINER_ID,
              templateId,
              authUser,
            );
            createdThreadId = result.thread.id;
            setSelectedTemplateId('');
            return result;
          },
          async (freeText) => {
            const result = createdThreadId
              ? await sendTraineeThreadTextMessage(
                  createTraineeThreadTextReplyPayload(
                    createdThreadId,
                    freeText,
                  ),
                  authUser,
                )
              : await sendTraineeTextMessage(
                  DEFAULT_TRAINER_ID,
                  freeText,
                  authUser,
                );
            setFreeTextContent('');
            return result;
          },
        );

        return freeTextResult ?? templateResult;
      } catch (error: unknown) {
        setSendError(
          formatMessageSendError(error, 'メッセージの送信に失敗しました'),
        );
        return undefined;
      }
    },
    [freeTextContent, selectedTemplateId],
  );

  return {
    selectedTemplateId,
    freeTextContent,
    setSelectedTemplateId,
    setFreeTextContent,
    sendMessage,
    sendError,
  };
}
