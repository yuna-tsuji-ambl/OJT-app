import { useMemo } from 'react';
import type { AuthUser } from '../auth/types';
import type { TrainerThreadReplyFormState } from '../domain/trainerThreadReplyForm';
import { useMessageThreadRooms } from './useMessageThreadRooms';
import { useTrainerNewMessageSend } from './useTrainerNewMessageSend';
import { useTrainerThreadReply } from './useTrainerThreadReply';

export function useTrainerMessages(user: AuthUser | null) {
  const {
    threads,
    threadMessages,
    selectedThreadId,
    selectThread,
    syncThreadViews,
    reloadThreadList,
  } = useMessageThreadRooms(user);
  const {
    selectedTemplateId: selectedNewMessageTemplateId,
    setSelectedTemplateId: setSelectedNewMessageTemplateId,
    freeTextContent: newMessageFreeTextContent,
    setFreeTextContent: setNewMessageFreeTextContent,
    sendNewMessage,
  } = useTrainerNewMessageSend(reloadThreadList);
  const {
    selectedReplyTemplateId,
    setSelectedReplyTemplateId,
    sendReply,
    sendStampReply,
  } = useTrainerThreadReply(selectedThreadId, syncThreadViews);

  const threadReplyForm = useMemo((): TrainerThreadReplyFormState => {
    return {
      selectedReplyTemplateId,
      onSelectTemplate: setSelectedReplyTemplateId,
      onSendTemplateReply: () => {
        if (user) {
          void sendReply(user);
        }
      },
      onSendStampReply: (stampId) => {
        if (user) {
          void sendStampReply(user, stampId);
        }
      },
    };
  }, [
    selectedReplyTemplateId,
    sendReply,
    sendStampReply,
    setSelectedReplyTemplateId,
    user,
  ]);

  return {
    threads,
    threadMessages,
    selectedThreadId,
    selectedNewMessageTemplateId,
    setSelectedNewMessageTemplateId,
    newMessageFreeTextContent,
    setNewMessageFreeTextContent,
    threadReplyForm,
    selectThread,
    sendNewMessage,
  };
}
