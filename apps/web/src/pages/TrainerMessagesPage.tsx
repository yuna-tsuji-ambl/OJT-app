import { useEffect, useMemo, useState } from 'react';
import { fetchTrainerStatus } from '../api/statusApi';
import { useAuth } from '../auth/AuthContext';
import { MessageAnnouncementCountButton } from '../components/MessageAnnouncementCountButton';
import { MessageBookmarkDetailSlot } from '../components/MessageBookmarkDetailSlot';
import { MessageBookmarkThreadSidebar } from '../components/MessageBookmarkThreadSidebar';
import { MessageSplitView } from '../components/MessageSplitView';
import { TrainerNewMessageForm } from '../components/TrainerNewMessageForm';
import { TrainerStatusPanel } from '../components/TrainerStatusPanel';
import { TrainerThreadReplyPanel } from '../components/TrainerThreadReplyPanel';
import {
  TRAINER_STATUS,
  type TrainerStatusType,
} from '../domain/statusConstants';
import { useMessageBookmarkAnnouncementPanels } from '../hooks/useMessageBookmarkAnnouncementPanels';
import { useTrainerMessages } from '../hooks/useTrainerMessages';

export function TrainerMessagesPage() {
  const { user } = useAuth();
  const [trainerStatus, setTrainerStatus] = useState<TrainerStatusType>(
    TRAINER_STATUS.FOCUS_MODE,
  );

  const {
    visibleThreads,
    threadListPage,
    threadListTotalPages,
    goToNextThreadListPage,
    threadMessages,
    historyError,
    inlineDetail,
    selectedNewMessageTemplateId,
    setSelectedNewMessageTemplateId,
    newMessageFreeTextContent,
    setNewMessageFreeTextContent,
    threadReplyForm,
    selectThread,
    sendNewMessage,
    sendError,
  } = useTrainerMessages(user);

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

    void fetchTrainerStatus(user.userId, user)
      .then((record) => {
        setTrainerStatus(record.status);
      })
      .catch(() => {
        setTrainerStatus(TRAINER_STATUS.FOCUS_MODE);
      });
  }, [user]);

  if (!user) {
    return null;
  }

  const {
    selectedReplyTemplateId,
    replyFreeTextContent,
    onSelectTemplate,
    onFreeTextChange,
    onSendTemplateReply,
    onSendStampReply,
  } = threadReplyForm;

  const selectedThreadId = inlineDetail.selectedThreadId;

  return (
    <section
      className="page-section page-section--wide page-section--messaging"
      aria-labelledby="messages-heading"
    >
      <div className="page-section__title-row">
        <h1 id="messages-heading">メッセージ</h1>
        <div className="page-section__title-meta">
          <TrainerStatusPanel status={trainerStatus} />
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
          <TrainerNewMessageForm
            selectedTemplateId={selectedNewMessageTemplateId}
            freeTextContent={newMessageFreeTextContent}
            onSelectTemplate={setSelectedNewMessageTemplateId}
            onFreeTextChange={setNewMessageFreeTextContent}
            onSend={() => void sendNewMessage(user)}
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
              <TrainerThreadReplyPanel
                selectedReplyTemplateId={selectedReplyTemplateId}
                replyFreeTextContent={replyFreeTextContent}
                onSelectTemplate={onSelectTemplate}
                onFreeTextChange={onFreeTextChange}
                onSendTemplateReply={onSendTemplateReply}
                onSendStampReply={onSendStampReply}
              />
            </MessageBookmarkDetailSlot>
          ) : null
        }
      />
    </section>
  );
}
