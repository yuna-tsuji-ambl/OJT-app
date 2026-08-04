import { useEffect, useMemo, useState } from 'react';
import { fetchTrainerStatus } from '../api/statusApi';
import { useAuth } from '../auth/AuthContext';
import { MessageAnnouncementCountButton } from '../components/MessageAnnouncementCountButton';
import { MessageBookmarkDetailSlot } from '../components/MessageBookmarkDetailSlot';
import { MessageBookmarkThreadSidebar } from '../components/MessageBookmarkThreadSidebar';
import { MessageSplitView } from '../components/MessageSplitView';
import { QuestionForm } from '../components/QuestionForm';
import { TrainerStatusPanel } from '../components/TrainerStatusPanel';
import { TraineeStampReplyBar } from '../components/TraineeStampReplyBar';
import {
  THREAD_QUESTION_FREE_TEXT_FIELD_ID,
  THREAD_QUESTION_TEMPLATE_FIELD_ID,
} from '../domain/messageSendForm';
import { DEFAULT_TRAINER_ID } from '../domain/statusConstants';
import type { TrainerStatusType } from '../domain/statusConstants';
import { useMessageBookmarkAnnouncementPanels } from '../hooks/useMessageBookmarkAnnouncementPanels';
import { useTraineeHomeMessaging } from '../hooks/useTraineeHomeMessaging';

export function TraineeHomePage() {
  const { user } = useAuth();
  const [trainerStatus, setTrainerStatus] = useState<TrainerStatusType | ''>(
    '',
  );

  const {
    threadMessages,
    visibleThreads,
    threadListPage,
    threadListTotalPages,
    goToNextThreadListPage,
    inlineDetail,
    historyError,
    selectedTemplateId,
    freeTextContent,
    threadReplyForm,
    setSelectedTemplateId,
    setFreeTextContent,
    selectThread,
    sendMessage,
    sendError,
  } = useTraineeHomeMessaging(user);

  const {
    messageBookmarks,
    bookmarkedThreadIds,
    bookmarkedMessageIds,
    bookmarkedOnly,
    setBookmarkedOnly,
    threadSortOption,
    setThreadSortOption,
    messageSortOption,
    setMessageSortOption,
    showBookmarkedMessages,
    viewThreads,
    toggleThreadBookmark,
    toggleMessageBookmark,
    updateBookmarkMemo,
    bookmarkError,
    announcements,
    announcedMessageIds,
    announcementCount,
    announcementSortOption,
    setAnnouncementSortOption,
    announcementRoleFilter,
    setAnnouncementRoleFilter,
    showAnnouncements,
    toggleShowAnnouncements,
    toggleShowBookmarkedMessages,
    selectThreadFromSideUi,
    selectThreadFromAnnouncementUi,
    toggleMessageAnnouncement,
    updateAnnouncementMemo,
    announcementError,
  } = useMessageBookmarkAnnouncementPanels(user);

  const filteredThreads = useMemo(
    () => viewThreads(visibleThreads),
    [viewThreads, visibleThreads],
  );

  useEffect(() => {
    if (!user) {
      return;
    }

    void fetchTrainerStatus(DEFAULT_TRAINER_ID, user).then((record) => {
      setTrainerStatus(record.status);
    });
  }, [user]);

  if (!user) {
    return null;
  }

  const {
    selectedTemplateId: threadSelectedTemplateId,
    freeTextContent: threadFreeTextContent,
    onSelectTemplate,
    onFreeTextChange,
    onSend,
    onSendStampReply,
  } = threadReplyForm;

  const selectedThreadId = inlineDetail.selectedThreadId;

  return (
    <section
      className="page-section page-section--wide page-section--messaging"
      aria-labelledby="home-heading"
    >
      <div className="page-section__title-row">
        <h1 id="home-heading">ホーム</h1>
        <div className="page-section__title-meta">
          {trainerStatus ? <TrainerStatusPanel status={trainerStatus} /> : null}
          <MessageAnnouncementCountButton
            count={announcementCount}
            pressed={showAnnouncements}
            onClick={toggleShowAnnouncements}
          />
        </div>
      </div>

      {sendError ? <div role="alert">{sendError}</div> : null}
      {bookmarkError ? <div role="alert">{bookmarkError}</div> : null}
      {announcementError ? <div role="alert">{announcementError}</div> : null}

      <MessageSplitView
        sendForm={
          <QuestionForm
            selectedTemplateId={selectedTemplateId}
            freeTextContent={freeTextContent}
            onSelectTemplate={setSelectedTemplateId}
            onFreeTextChange={setFreeTextContent}
            onSend={() => void sendMessage(user)}
          />
        }
        threadList={
          <MessageBookmarkThreadSidebar
            bookmarkedOnly={bookmarkedOnly}
            onBookmarkedOnlyChange={setBookmarkedOnly}
            threadSortOption={threadSortOption}
            onThreadSortOptionChange={setThreadSortOption}
            showBookmarkedMessages={showBookmarkedMessages}
            onToggleBookmarkedMessages={toggleShowBookmarkedMessages}
            threads={filteredThreads}
            page={threadListPage}
            totalPages={threadListTotalPages}
            onNextPage={goToNextThreadListPage}
            inlineDetail={inlineDetail}
            onSelectThread={(threadId) =>
              selectThreadFromSideUi(threadId, selectThread)
            }
            bookmarkedThreadIds={bookmarkedThreadIds}
            onToggleThreadBookmark={(threadId) =>
              void toggleThreadBookmark(threadId)
            }
          />
        }
        detail={
          showAnnouncements || showBookmarkedMessages || selectedThreadId ? (
            <MessageBookmarkDetailSlot
              showAnnouncements={showAnnouncements}
              announcements={announcements}
              announcementSortOption={announcementSortOption}
              onAnnouncementSortOptionChange={setAnnouncementSortOption}
              announcementRoleFilter={announcementRoleFilter}
              onAnnouncementRoleFilterChange={setAnnouncementRoleFilter}
              onSelectAnnouncement={(threadId) =>
                selectThreadFromAnnouncementUi(threadId, selectThread)
              }
              onRemoveAnnouncement={(threadId, messageId) =>
                void toggleMessageAnnouncement(threadId, messageId)
              }
              onUpdateAnnouncementMemo={(announcementId, memo) =>
                void updateAnnouncementMemo(announcementId, memo)
              }
              showBookmarkedMessages={showBookmarkedMessages}
              messageBookmarks={messageBookmarks}
              viewer={user}
              messageSortOption={messageSortOption}
              onMessageSortOptionChange={setMessageSortOption}
              onSelectBookmarkedMessage={(threadId) =>
                selectThreadFromSideUi(threadId, selectThread)
              }
              onRemoveMessageBookmark={(threadId, messageId) =>
                void toggleMessageBookmark(threadId, messageId)
              }
              onUpdateBookmarkMemo={(bookmarkId, memo) =>
                void updateBookmarkMemo(bookmarkId, memo)
              }
              selectedThreadId={selectedThreadId}
              messages={threadMessages}
              historyError={historyError}
              bookmarkedMessageIds={bookmarkedMessageIds}
              onToggleMessageBookmark={(messageId) => {
                if (selectedThreadId) {
                  void toggleMessageBookmark(selectedThreadId, messageId);
                }
              }}
              announcedMessageIds={announcedMessageIds}
              onToggleMessageAnnouncement={(messageId) => {
                if (selectedThreadId) {
                  void toggleMessageAnnouncement(selectedThreadId, messageId);
                }
              }}
            >
              <QuestionForm
                selectedTemplateId={threadSelectedTemplateId}
                freeTextContent={threadFreeTextContent}
                onSelectTemplate={onSelectTemplate}
                onFreeTextChange={onFreeTextChange}
                onSend={onSend}
                templateFieldId={THREAD_QUESTION_TEMPLATE_FIELD_ID}
                freeTextFieldId={THREAD_QUESTION_FREE_TEXT_FIELD_ID}
              />
              <TraineeStampReplyBar onReply={onSendStampReply} />
            </MessageBookmarkDetailSlot>
          ) : null
        }
      />
    </section>
  );
}
