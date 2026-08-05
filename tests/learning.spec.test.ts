import { expect, test } from '@playwright/test';
import {
  loginAsTrainee,
  loginAsTrainer,
  logout,
} from './helpers/playwright-auth';
import {
  LEARNING_CREATE_SUCCESS_MESSAGE,
  LEARNING_FEED_PATH,
  LEARNING_TITLE_REQUIRED_MESSAGE,
  expectLearningPostVisible,
  expectLearningSuccessMessage,
  expectLearningValidationError,
  fillLearningForm,
  navigateToLearningsFromHeader,
  openLearningCreatePage,
  openLearningFeedPage,
  submitLearningCreateForm,
  uniqueLearningTitle,
} from './helpers/learning';
import {
  LEARNING_CI_GATE_TIMEOUT_MS,
  expectCiWorkflowRunsLearningVitestAndPlaywright,
  expectLearningE2eAutomationTargetsPresent,
  expectLearningFeatureVitestSuitesPass,
} from './helpers/learningCi';

test.describe('学び E2E', () => {
  test.describe.configure({ mode: 'serial', timeout: 60_000 });

  test.describe('E-L01 新卒投稿→タイムライン表示', () => {
    test('新卒が投稿するとタイムラインに表示される', async ({ page }) => {
      const title = uniqueLearningTitle('E-L01');
      const body = 'Playwright E2E で投稿した学びです。';

      await loginAsTrainee(page);
      await openLearningCreatePage(page);
      await fillLearningForm(page, {
        title,
        body,
        linkUrl: 'https://example.com/learning',
        linkLabel: 'Example',
      });
      await submitLearningCreateForm(page);
      await expectLearningSuccessMessage(page, LEARNING_CREATE_SUCCESS_MESSAGE);
      await expect(page).toHaveURL(LEARNING_FEED_PATH);
      await expectLearningPostVisible(page, title);
      await expect(page.getByText(body)).toBeVisible();
    });
  });

  test.describe('E-L02 トレーナーがタイムライン閲覧', () => {
    test('トレーナーが新卒の投稿を閲覧できる', async ({ page, request }) => {
      const title = uniqueLearningTitle('E-L02');
      const body = 'トレーナー閲覧テスト用の学びです。';

      const created = await request.post('/api/learnings', {
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': 'trainee-1',
          'X-User-Role': 'trainee',
        },
        data: {
          title,
          body,
          links: [],
        },
      });
      expect(created.status()).toBe(201);

      await loginAsTrainer(page);
      await openLearningFeedPage(page);
      await expectLearningPostVisible(page, title);
      await expect(page.getByText(body)).toBeVisible();
    });
  });

  test.describe('E-L03 ヘッダー「学び」導線', () => {
    test('新卒トレーナーともヘッダー学びからタイムラインへ遷移できる', async ({
      page,
    }) => {
      await loginAsTrainee(page);
      await navigateToLearningsFromHeader(page);
      await expect(page).toHaveURL(LEARNING_FEED_PATH);

      await logout(page);
      await loginAsTrainer(page);
      await navigateToLearningsFromHeader(page);
      await expect(page).toHaveURL(LEARNING_FEED_PATH);
    });
  });

  test.describe('E-L04 必須未入力での作成拒否', () => {
    test('title空のまま投稿するとエラーが表示される', async ({ page }) => {
      const title = uniqueLearningTitle('E-L04-should-not-appear');

      await loginAsTrainee(page);
      await openLearningCreatePage(page);
      await fillLearningForm(page, {
        title: '',
        body: '本文のみ',
      });
      await submitLearningCreateForm(page);
      await expectLearningValidationError(
        page,
        LEARNING_TITLE_REQUIRED_MESSAGE,
      );
      await openLearningFeedPage(page);
      await expect(page.getByText(title, { exact: true })).toHaveCount(0);
    });
  });

  test.describe('E-L05 CI パイプライン通過', () => {
    test(
      '学び機能の自動化対象テストがCI定義とVitestでPassする',
      async () => {
        await expectCiWorkflowRunsLearningVitestAndPlaywright();
        await expectLearningE2eAutomationTargetsPresent();
        await expectLearningFeatureVitestSuitesPass();
      },
      LEARNING_CI_GATE_TIMEOUT_MS,
    );
  });
});
