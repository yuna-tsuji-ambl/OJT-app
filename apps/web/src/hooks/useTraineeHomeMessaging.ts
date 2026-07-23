import { useCallback, useMemo } from 'react';
import type { AuthUser } from '../auth/types';
import type { TraineeThreadReplyFormState } from '../domain/traineeThreadReplyForm';
import { useTraineeMessageSend } from './useTraineeMessageSend';
import { useTraineeThreadReply } from './useTraineeThreadReply';
import { useMessageThreadRooms } from './useMessageThreadRooms';

export function useTraineeHomeMessaging(user: AuthUser | null) {
  const {
    messages,
    selectedTemplateId,
    freeTextContent,
    setSelectedTemplateId,
    setFreeTextContent,
    sendMessage: sendTraineeMessage,
  } = useTraineeMessageSend(user);
  const {
    threads,
    threadMessages,
    selectedThreadId,
    selectThread,
    syncThreadViews,
  } = useMessageThreadRooms(user);
  const {
    selectedTemplateId: threadSelectedTemplateId,
    freeTextContent: threadFreeTextContent,
    setSelectedTemplateId: setThreadSelectedTemplateId,
    setFreeTextContent: setThreadFreeTextContent,
    sendThreadMessage,
    sendStampReply,
  } = useTraineeThreadReply(selectedThreadId, syncThreadViews);

  const sendMessage = useCallback(
    async (authUser: AuthUser): Promise<void> => {
      await sendTraineeMessage(authUser);
      await syncThreadViews(authUser);
    },
    [sendTraineeMessage, syncThreadViews],
  );

  const threadReplyForm = useMemo((): TraineeThreadReplyFormState => {
    return {
      selectedTemplateId: threadSelectedTemplateId,
      freeTextContent: threadFreeTextContent,
      onSelectTemplate: setThreadSelectedTemplateId,
      onFreeTextChange: setThreadFreeTextContent,
      onSend: () => {
        if (user) {
          void sendThreadMessage(user);
        }
      },
      onSendStampReply: (stampId) => {
        if (user) {
          void sendStampReply(user, stampId);
        }
      },
    };
  }, [
    threadFreeTextContent,
    threadSelectedTemplateId,
    sendStampReply,
    sendThreadMessage,
    setThreadFreeTextContent,
    setThreadSelectedTemplateId,
    user,
  ]);

  return {
    messages,
    threadMessages,
    threads,
    selectedThreadId,
    selectedTemplateId,
    freeTextContent,
    threadReplyForm,
    setSelectedTemplateId,
    setFreeTextContent,
    selectThread,
    sendMessage,
  };
}
