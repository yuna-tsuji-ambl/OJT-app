import { useCallback, useState } from 'react';
import {
  sendTraineeTemplateMessage,
  sendTraineeTextMessage,
  sendTraineeThreadTextMessage,
} from '../api/messageThreadApi';
import type { AuthUser } from '../auth/types';
import {
  hasDualSendPayload,
  resolveDualSendParts,
} from '../domain/messageDualSend';
import { DEFAULT_TRAINER_ID } from '../domain/participantConstants';
import { createTraineeThreadTextReplyPayload } from '../domain/traineeThreadReply';
import type { SendMessageResult } from '@ojt-app/shared';

export function useTraineeMessageSend(_user: AuthUser | null) {
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [freeTextContent, setFreeTextContent] = useState('');

  const sendMessage = useCallback(
    async (authUser: AuthUser): Promise<SendMessageResult | undefined> => {
      const parts = resolveDualSendParts(selectedTemplateId, freeTextContent);

      if (!hasDualSendPayload(parts)) {
        return undefined;
      }

      let result: SendMessageResult | undefined;

      if (parts.templateId) {
        result = await sendTraineeTemplateMessage(
          DEFAULT_TRAINER_ID,
          parts.templateId,
          authUser,
        );
        setSelectedTemplateId('');

        if (parts.freeText) {
          result = await sendTraineeThreadTextMessage(
            createTraineeThreadTextReplyPayload(
              result.thread.id,
              parts.freeText,
            ),
            authUser,
          );
          setFreeTextContent('');
        }
      } else if (parts.freeText) {
        result = await sendTraineeTextMessage(
          DEFAULT_TRAINER_ID,
          parts.freeText,
          authUser,
        );
        setFreeTextContent('');
      }

      return result;
    },
    [freeTextContent, selectedTemplateId],
  );

  return {
    selectedTemplateId,
    freeTextContent,
    setSelectedTemplateId,
    setFreeTextContent,
    sendMessage,
  };
}
