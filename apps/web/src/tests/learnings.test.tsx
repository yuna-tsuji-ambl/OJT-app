import { screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  LEARNING_CREATE_PATH,
  LEARNING_FEED_PATH,
  LEARNING_INVALID_URL_MESSAGE,
  LEARNING_TITLE_REQUIRED_MESSAGE,
} from '../domain/learningForm';
import {
  U_L23_SAMPLE_POSTS,
  clearAuthSession,
  expectLearningCreateLinkAbsent,
  expectLearningFormValidationError,
  expectLearningPostsVisible,
  expectTraineeHeaderLearningNav,
  expectTrainerHeaderLearningNav,
  fillLearningForm,
  renderTraineeLearningNavigation,
  renderTrainerLearningNavigation,
  submitLearningCreateForm,
  waitForLearningSuccessMessage,
  LEARNING_CREATE_SUCCESS_MESSAGE,
} from './learningUiTestHelpers';

const { fetchLearningsMock, createLearningPostMock } = vi.hoisted(() => ({
  fetchLearningsMock: vi.fn(),
  createLearningPostMock: vi.fn(),
}));

vi.mock('../api/statusApi', () => ({
  fetchTrainerStatus: vi.fn().mockResolvedValue({ status: 'available' }),
}));

vi.mock('../hooks/useTraineeHomeMessaging', () => ({
  useTraineeHomeMessaging: () => ({
    messages: [],
    threadMessages: [],
    visibleThreads: [],
    threadListPage: 1,
    threadListTotalPages: 1,
    goToNextThreadListPage: vi.fn(),
    inlineDetail: {
      inlineDetailThreadId: null,
      inlineDetailState: 'closed',
      selectedThreadId: null,
    },
    historyError: null,
    selectedTemplateId: '',
    freeTextContent: '',
    threadReplyForm: {
      selectedTemplateId: '',
      freeTextContent: '',
      onSelectTemplate: vi.fn(),
      onFreeTextChange: vi.fn(),
      onSend: vi.fn(),
      onSendStampReply: vi.fn(),
    },
    setSelectedTemplateId: vi.fn(),
    setFreeTextContent: vi.fn(),
    selectThread: vi.fn(),
    sendMessage: vi.fn(),
  }),
}));

vi.mock('../hooks/useTrainerDashboard', () => ({
  useTrainerDashboard: () => ({
    alerts: [],
    pendingQuests: [],
    progressQuests: [],
    approveQuestAndReload: vi.fn(),
  }),
}));

vi.mock('../api/learningApi', () => ({
  fetchLearnings: fetchLearningsMock,
  createLearningPost: createLearningPostMock,
}));

describe('学び UI', () => {
  beforeEach(() => {
    clearAuthSession();
    fetchLearningsMock.mockReset();
    createLearningPostMock.mockReset();
    fetchLearningsMock.mockResolvedValue([]);
    createLearningPostMock.mockImplementation(async (input) => ({
      id: 'learning-new',
      authorId: 'trainee-1',
      date: input.date ?? '2026-07-31',
      title: input.title,
      body: input.body,
      links: input.links ?? [],
      createdAt: '2026-07-31T00:00:00.000Z',
      updatedAt: '2026-07-31T00:00:00.000Z',
    }));
  });

  describe('U-L21 新卒ヘッダーに「学び」がある', () => {
    it('新卒ログイン済み_ヘッダーに学びリンクが表示される', async () => {
      await renderTraineeLearningNavigation();
      expectTraineeHeaderLearningNav();
    });
  });

  describe('U-L22 トレーナーヘッダーに「学び」がある', () => {
    it('トレーナーログイン済み_ヘッダーに学びリンクが表示される', async () => {
      await renderTrainerLearningNavigation();
      expectTrainerHeaderLearningNav();
    });
  });

  describe('U-L23 タイムライン表示', () => {
    it('learnings表示中_各投稿のtitle・body・日付・リンクが表示される', async () => {
      fetchLearningsMock.mockResolvedValue(U_L23_SAMPLE_POSTS);
      await renderTraineeLearningNavigation(LEARNING_FEED_PATH);
      await waitFor(() => {
        expectLearningPostsVisible(U_L23_SAMPLE_POSTS);
      });
    });
  });

  describe('U-L24 投稿画面での作成', () => {
    it('title・body・URLを入力して投稿すると成功フィードバックとタイムライン反映', async () => {
      const createdPost = {
        id: 'learning-u-l24',
        authorId: 'trainee-1',
        date: '2026-07-31',
        title: '新しい学び',
        body: '今日はテストを書いた。',
        links: [{ url: 'https://example.com/docs', label: 'Example Docs' }],
        createdAt: '2026-07-31T00:00:00.000Z',
        updatedAt: '2026-07-31T00:00:00.000Z',
      };

      createLearningPostMock.mockResolvedValue(createdPost);
      fetchLearningsMock.mockResolvedValue([createdPost]);

      await renderTraineeLearningNavigation(LEARNING_CREATE_PATH);
      await fillLearningForm({
        title: createdPost.title,
        body: createdPost.body,
        linkUrl: 'https://example.com/docs',
        linkLabel: 'Example Docs',
      });
      await submitLearningCreateForm();

      await waitForLearningSuccessMessage(LEARNING_CREATE_SUCCESS_MESSAGE);
      await waitFor(() => {
        expect(screen.getByText(createdPost.title)).toBeTruthy();
        expect(screen.getByText(createdPost.body)).toBeTruthy();
      });
      expect(createLearningPostMock).toHaveBeenCalled();
    });
  });

  describe('U-L25 必須未入力での投稿拒否', () => {
    it('title空のまま投稿するとエラーが表示され投稿されない', async () => {
      await renderTraineeLearningNavigation(LEARNING_CREATE_PATH);
      await fillLearningForm({
        title: '',
        body: '本文のみ',
      });
      await submitLearningCreateForm();
      expectLearningFormValidationError(LEARNING_TITLE_REQUIRED_MESSAGE);
      expect(createLearningPostMock).not.toHaveBeenCalled();
    });
  });

  describe('U-L26 不正 URL の入力拒否', () => {
    it('不正なURLをリンクに入れて投稿するとエラーが表示され投稿されない', async () => {
      await renderTraineeLearningNavigation(LEARNING_CREATE_PATH);
      await fillLearningForm({
        title: 'タイトル',
        body: '本文',
        linkUrl: 'not-a-valid-url',
      });
      await submitLearningCreateForm();
      expectLearningFormValidationError(LEARNING_INVALID_URL_MESSAGE);
      expect(createLearningPostMock).not.toHaveBeenCalled();
    });
  });

  describe('U-L27 トレーナーは投稿画面を使わない', () => {
    it('トレーナー画面に投稿作成への導線がない', async () => {
      await renderTrainerLearningNavigation(LEARNING_FEED_PATH);
      expectLearningCreateLinkAbsent();
      expect(
        screen.queryByRole('link', { name: LEARNING_CREATE_PATH }),
      ).toBeNull();
    });
  });
});
