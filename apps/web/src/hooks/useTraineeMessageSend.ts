import { useCallback, useState } from 'react';
import {
  sendTraineeTemplateMessage,
  sendTraineeTextMessage,
} from '../api/messageThreadApi';
import type { AuthUser } from '../auth/types';
import { DEFAULT_TRAINER_ID } from '../domain/participantConstants';
import type { SendMessageResult } from '@ojt-app/shared';
import { useConversationMessages } from './useConversationMessages';

export function useTraineeMessageSend(user: AuthUser | null) {
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [freeTextContent, setFreeTextContent] = useState('');
  const { messages, reloadMessages } = useConversationMessages(user);

  const sendMessage = useCallback(
    async (authUser: AuthUser): Promise<SendMessageResult | undefined> => {
      let result: SendMessageResult | undefined;

      if (selectedTemplateId) {
        result = await sendTraineeTemplateMessage(
          DEFAULT_TRAINER_ID,
          selectedTemplateId,
          authUser,
        );
        setSelectedTemplateId('');
      } else if (freeTextContent.trim()) {
        result = await sendTraineeTextMessage(
          DEFAULT_TRAINER_ID,
          freeTextContent.trim(),
          authUser,
        );
        setFreeTextContent('');
      } else {
        return undefined;
      }

      await reloadMessages(authUser);

      return result;
    },
    [freeTextContent, reloadMessages, selectedTemplateId],
  );

  return {
    messages,
    selectedTemplateId,
    freeTextContent,
    setSelectedTemplateId,
    setFreeTextContent,
    sendMessage,
  };
}
