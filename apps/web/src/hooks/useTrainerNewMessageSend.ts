import { useCallback, useState } from 'react';
import {
  sendTrainerNewMessage,
  sendTrainerTextMessage,
  sendTrainerTextReply,
} from '../api/messageThreadApi';
import type { AuthUser } from '../auth/types';
import {
  hasDualSendPayload,
  resolveDualSendParts,
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
        if (parts.templateId) {
          const result = await sendTrainerNewMessage(
            createTrainerNewMessagePayload(parts.templateId),
            authUser,
          );
          setSelectedTemplateId('');

          if (parts.freeText) {
            await sendTrainerTextReply(
              createTrainerTextReplyPayload(result.thread.id, parts.freeText),
              authUser,
            );
          }

          setFreeTextContent('');
        } else if (parts.freeText) {
          await sendTrainerTextMessage(
            createTrainerNewTextMessagePayload(parts.freeText),
            authUser,
          );
          setFreeTextContent('');
        }

        await reloadThreads(authUser);
      } catch (error: unknown) {
        setSendError(
          error instanceof Error
            ? error.message
            : 'メッセージの送信に失敗しました',
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
