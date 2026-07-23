import { useCallback, useState } from 'react';
import { sendTrainerNewMessage } from '../api/messageThreadApi';
import type { AuthUser } from '../auth/types';
import { createTrainerNewMessagePayload } from '../domain/trainerThreadReply';

type ReloadThreads = (authUser: AuthUser) => Promise<void>;

export function useTrainerNewMessageSend(reloadThreads: ReloadThreads) {
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [freeTextContent, setFreeTextContent] = useState('');

  const sendNewMessage = useCallback(
    async (authUser: AuthUser): Promise<void> => {
      if (!selectedTemplateId) {
        return;
      }

      await sendTrainerNewMessage(
        createTrainerNewMessagePayload(selectedTemplateId),
        authUser,
      );
      setSelectedTemplateId('');
      setFreeTextContent('');
      await reloadThreads(authUser);
    },
    [reloadThreads, selectedTemplateId],
  );

  return {
    selectedTemplateId,
    setSelectedTemplateId,
    freeTextContent,
    setFreeTextContent,
    sendNewMessage,
  };
}
