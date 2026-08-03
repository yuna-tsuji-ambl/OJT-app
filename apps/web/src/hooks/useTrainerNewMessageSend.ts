import { useCallback, useState } from 'react';
import {
  sendTrainerNewMessage,
  sendTrainerTextMessage,
  sendTrainerTextReply,
} from '../api/messageThreadApi';
import type { AuthUser } from '../auth/types';
import {
  formatMessageSendError,
  hasDualSendPayload,
  resolveDualSendParts,
  runDualSendSequence,
} from '../domain/messageDualSend';
import {
  createTrainerNewMessagePayload,
  createTrainerNewTextMessagePayload,
  createTrainerTextReplyPayload,
} from '../domain/trainerThreadReply';

type ReloadThreads = (authUser: AuthUser) => Promise<void>;

export function useTrainerNewMessageSend(reloadThreads: ReloadThreads) {
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [freeTextContent, setFreeTextContent] = useState('');
  const [sendError, setSendError] = useState<string | null>(null);

  const sendNewMessage = useCallback(
    async (authUser: AuthUser): Promise<void> => {
      const parts = resolveDualSendParts(selectedTemplateId, freeTextContent);

      if (!hasDualSendPayload(parts)) {
        return;
      }

      setSendError(null);

      try {
        let createdThreadId: string | undefined;

        await runDualSendSequence(
          parts,
          async (templateId) => {
            const result = await sendTrainerNewMessage(
              createTrainerNewMessagePayload(templateId),
              authUser,
            );
            createdThreadId = result.thread.id;
            setSelectedTemplateId('');
            return result;
          },
          async (freeText) => {
            if (createdThreadId) {
              await sendTrainerTextReply(
                createTrainerTextReplyPayload(createdThreadId, freeText),
                authUser,
              );
            } else {
              await sendTrainerTextMessage(
                createTrainerNewTextMessagePayload(freeText),
                authUser,
              );
            }
            setFreeTextContent('');
          },
        );

        await reloadThreads(authUser);
      } catch (error: unknown) {
        setSendError(
          formatMessageSendError(error, 'メッセージの送信に失敗しました'),
        );
      }
    },
    [freeTextContent, reloadThreads, selectedTemplateId],
  );

  return {
    selectedTemplateId,
    setSelectedTemplateId,
    freeTextContent,
    setFreeTextContent,
    sendNewMessage,
    sendError,
  };
}
