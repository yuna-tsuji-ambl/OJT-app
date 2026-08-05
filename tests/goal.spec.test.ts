import { expect, test } from '@playwright/test';
import {
  loginAsTrainee,
  loginAsTrainer,
  logout,
} from './helpers/playwright-auth';
import {
  GOAL_CREATE_SUCCESS_MESSAGE,
  GOAL_DELETE_SUCCESS_MESSAGE,
  GOAL_GANTT_LINK_LABEL,
  GOAL_GANTT_PATH,
  GOAL_MANAGE_LINK_LABEL,
  GOAL_MANAGE_PATH,
  GOAL_TITLE_REQUIRED_MESSAGE,
  GOAL_UPDATE_SUCCESS_MESSAGE,
  clickGoalDeleteButton,
  clickGoalEditButton,
  createGoalViaApi,
  deleteGoalViaTraineeApi,
  dragGoalBarByTitle,
  dragGoalBarEndByTitle,
  expectDeleteButtonAbsentOnManagePage,
  expectGoalAbsentOnManagePage,
  expectGoalBarAbsent,
  expectGoalBarVisible,
  expectGoalListedOnManagePage,
  goalBarLocator,
  expectGoalSuccessMessage,
  expectGoalValidationError,
  fillGoalForm,
  navigateToGoalsFromHeader,
  openGoalGanttPage,
  openGoalManagePage,
  submitGoalCreateForm,
  submitGoalEditForm,
  uniqueGoalTitle,
} from './helpers/goal';
import {
  GOAL_CI_GATE_TIMEOUT_MS,
  expectCiWorkflowRunsGoalVitestAndPlaywright,
  expectGoalE2eAutomationTargetsPresent,
  expectGoalFeatureVitestSuitesPass,
} from './helpers/goalCi';

test.describe('目標 E2E', () => {
  test.describe.configure({ mode: 'serial', timeout: 60_000 });

  test.describe('E-G01 トレーナー作成の連動', () => {
    test('トレーナーが作成した目標が新卒ガントにも表示される', async ({
      page,
    }) => {
      const title = uniqueGoalTitle('E-G01');

      await loginAsTrainer(page);
      await openGoalManagePage(page);
      await fillGoalForm(page, {
        title,
        startDate: '2026-10-01',
        endDate: '2026-10-07',
      });
      await submitGoalCreateForm(page);
      await expectGoalSuccessMessage(page, GOAL_CREATE_SUCCESS_MESSAGE);
      await openGoalGanttPage(page);
      await expectGoalBarVisible(page, title);

      await logout(page);
      await loginAsTrainee(page);
      await openGoalGanttPage(page);
      await expectGoalBarVisible(page, title);
    });
  });

  test.describe('E-G02 新卒作成・更新の連動', () => {
    test('新卒が作成更新した目標がトレーナー画面に反映される', async ({
      page,
    }) => {
      const title = uniqueGoalTitle('E-G02');

      await loginAsTrainee(page);
      await openGoalManagePage(page);
      await fillGoalForm(page, {
        title,
        startDate: '2026-10-08',
        endDate: '2026-10-12',
        progress: 25,
        status: 'in_progress',
      });
      await submitGoalCreateForm(page);
      await expectGoalSuccessMessage(page, GOAL_CREATE_SUCCESS_MESSAGE);

      await clickGoalEditButton(page, title);
      await fillGoalForm(
        page,
        { progress: 60, status: 'in_progress' },
        '目標編集',
      );
      await submitGoalEditForm(page);
      await expectGoalSuccessMessage(page, GOAL_UPDATE_SUCCESS_MESSAGE);

      await logout(page);
      await loginAsTrainer(page);
      await openGoalGanttPage(page);
      await expectGoalBarVisible(page, title);
      await openGoalManagePage(page);
      await expectGoalListedOnManagePage(page, title);
      await expect(page.getByText('進捗 60%')).toBeVisible();
    });
  });

  test.describe('E-G03 トレーナー編集・削除の連動', () => {
    test('トレーナーの編集削除が新卒画面にも反映される', async ({ page }) => {
      const originalTitle = uniqueGoalTitle('E-G03');
      const updatedTitle = `${originalTitle}-updated`;

      await loginAsTrainer(page);
      await openGoalManagePage(page);
      await fillGoalForm(page, {
        title: originalTitle,
        startDate: '2026-10-15',
        endDate: '2026-10-20',
      });
      await submitGoalCreateForm(page);
      await expectGoalSuccessMessage(page, GOAL_CREATE_SUCCESS_MESSAGE);

      await clickGoalEditButton(page, originalTitle);
      await fillGoalForm(
        page,
        {
          title: updatedTitle,
          startDate: '2026-10-16',
          endDate: '2026-10-22',
        },
        '目標編集',
      );
      await submitGoalEditForm(page);
      await expectGoalSuccessMessage(page, GOAL_UPDATE_SUCCESS_MESSAGE);

      await logout(page);
      await loginAsTrainee(page);
      await openGoalGanttPage(page);
      await expectGoalBarVisible(page, updatedTitle);

      await logout(page);
      await loginAsTrainer(page);
      await openGoalManagePage(page);
      await clickGoalDeleteButton(page, updatedTitle);
      await expectGoalSuccessMessage(page, GOAL_DELETE_SUCCESS_MESSAGE);

      await logout(page);
      await loginAsTrainee(page);
      await openGoalGanttPage(page);
      await expectGoalBarAbsent(page, updatedTitle);
      await openGoalManagePage(page);
      await expectGoalAbsentOnManagePage(page, updatedTitle);
    });
  });

  test.describe('E-G04 ヘッダー「目標」導線', () => {
    test('新卒トレーナーともヘッダー目標からガントと管理画面へ到達できる', async ({
      page,
    }) => {
      await loginAsTrainee(page);
      await navigateToGoalsFromHeader(page);
      await page.getByRole('link', { name: GOAL_MANAGE_LINK_LABEL }).click();
      await expect(page).toHaveURL(GOAL_MANAGE_PATH);
      await page.getByRole('link', { name: GOAL_GANTT_LINK_LABEL }).click();
      await expect(page).toHaveURL(GOAL_GANTT_PATH);

      await logout(page);
      await loginAsTrainer(page);
      await navigateToGoalsFromHeader(page);
      await page.getByRole('link', { name: GOAL_MANAGE_LINK_LABEL }).click();
      await expect(page).toHaveURL(GOAL_MANAGE_PATH);
    });
  });

  test.describe('E-G05 ガントバーの位置移動', () => {
    test('バー移動後も再読み込みで期間が保持される', async ({ page }) => {
      const title = uniqueGoalTitle('E-G05');

      await loginAsTrainer(page);
      await openGoalManagePage(page);
      await fillGoalForm(page, {
        title,
        startDate: '2026-11-01',
        endDate: '2026-11-05',
      });
      await submitGoalCreateForm(page);
      await expectGoalSuccessMessage(page, GOAL_CREATE_SUCCESS_MESSAGE);

      await openGoalGanttPage(page);
      await dragGoalBarByTitle(page, title, 72);
      await expect
        .poll(async () =>
          goalBarLocator(page, title).getAttribute('data-start-date'),
        )
        .not.toBe('2026-11-01');
      await page.reload();
      await expectGoalBarVisible(page, title);
      await expect(goalBarLocator(page, title)).not.toHaveAttribute(
        'data-start-date',
        '2026-11-01',
      );
      await expect(goalBarLocator(page, title)).not.toHaveAttribute(
        'data-end-date',
        '2026-11-05',
      );
    });
  });

  test.describe('E-G06 ガントバー端の期間変更', () => {
    test('端ドラッグ後も再読み込みで期間が保持される', async ({ page }) => {
      const title = uniqueGoalTitle('E-G06');

      await loginAsTrainer(page);
      await openGoalManagePage(page);
      await fillGoalForm(page, {
        title,
        startDate: '2026-11-10',
        endDate: '2026-11-15',
      });
      await submitGoalCreateForm(page);
      await expectGoalSuccessMessage(page, GOAL_CREATE_SUCCESS_MESSAGE);

      await openGoalGanttPage(page);
      await dragGoalBarEndByTitle(page, title, 48);
      await expect
        .poll(async () =>
          goalBarLocator(page, title).getAttribute('data-end-date'),
        )
        .not.toBe('2026-11-15');
      await page.reload();
      await expectGoalBarVisible(page, title);
      await expect(goalBarLocator(page, title)).not.toHaveAttribute(
        'data-end-date',
        '2026-11-15',
      );
    });
  });

  test.describe('E-G07 必須未入力での作成拒否', () => {
    test('目標名空のまま作成するとエラーが表示される', async ({ page }) => {
      await loginAsTrainee(page);
      await openGoalManagePage(page);
      await fillGoalForm(page, {
        title: '',
        startDate: '2026-12-01',
        endDate: '2026-12-05',
      });
      await submitGoalCreateForm(page);
      await expectGoalValidationError(page, GOAL_TITLE_REQUIRED_MESSAGE);
    });
  });

  test.describe('E-G08 新卒は削除できない', () => {
    test('新卒管理画面に削除操作がなくAPIも403', async ({ page, request }) => {
      const title = uniqueGoalTitle('E-G08');
      const created = await createGoalViaApi(request, {
        title,
        startDate: '2026-12-10',
        endDate: '2026-12-12',
      });

      await loginAsTrainee(page);
      await openGoalManagePage(page);
      await expectGoalListedOnManagePage(page, title);
      await expectDeleteButtonAbsentOnManagePage(page);

      const deleteStatus = await deleteGoalViaTraineeApi(request, created.id);
      expect(deleteStatus).toBe(403);
    });
  });

  test.describe('E-G09 CI パイプライン通過', () => {
    test(
      '目標機能の自動化対象テストがCI定義とVitestでPassする',
      async () => {
        await expectCiWorkflowRunsGoalVitestAndPlaywright();
        await expectGoalE2eAutomationTargetsPresent();
        await expectGoalFeatureVitestSuitesPass();
      },
      GOAL_CI_GATE_TIMEOUT_MS,
    );
  });
});
