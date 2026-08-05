import { expect, type APIRequestContext, type Page } from '@playwright/test';

export const LEARNING_FEED_PATH = '/learnings';
export const LEARNING_CREATE_PATH = '/learnings/new';
export const LEARNING_HEADER_NAV_LABEL = '学び';
export const LEARNING_FEED_PAGE_TITLE = '学びタイムライン';
export const LEARNING_CREATE_PAGE_TITLE = '学びを投稿';
export const LEARNING_CREATE_LINK_LABEL = '学びを投稿';
export const LEARNING_CREATE_REGION_LABEL = '学び投稿';
export const LEARNING_CREATE_SUBMIT_LABEL = '投稿';
export const LEARNING_CREATE_SUCCESS_MESSAGE = '学びを投稿しました';
export const LEARNING_TITLE_REQUIRED_MESSAGE = 'タイトルを入力してください';
export const LEARNING_ADD_LINK_LABEL = 'リンクを追加';
export const MAIN_NAV_ARIA_LABEL = 'メインナビゲーション';

const TRAINEE_API_HEADERS = {
  'Content-Type': 'application/json',
  'X-User-Id': 'trainee-1',
  'X-User-Role': 'trainee',
} as const;

export interface LearningFormValues {
  readonly title: string;
  readonly body: string;
  readonly date?: string;
  readonly linkUrl?: string;
  readonly linkLabel?: string;
}

export async function navigateToLearningsFromHeader(page: Page): Promise<void> {
  await page
    .getByRole('navigation', { name: MAIN_NAV_ARIA_LABEL })
    .getByRole('link', { name: LEARNING_HEADER_NAV_LABEL })
    .click();
  await expect(
    page.getByRole('heading', { name: LEARNING_FEED_PAGE_TITLE }),
  ).toBeVisible();
}

export async function openLearningFeedPage(page: Page): Promise<void> {
  await page.goto(LEARNING_FEED_PATH);
  await expect(
    page.getByRole('heading', { name: LEARNING_FEED_PAGE_TITLE }),
  ).toBeVisible();
}

export async function openLearningCreatePage(page: Page): Promise<void> {
  await page.goto(LEARNING_CREATE_PATH);
  await expect(
    page.getByRole('heading', { name: LEARNING_CREATE_PAGE_TITLE }),
  ).toBeVisible();
}

export async function fillLearningForm(
  page: Page,
  values: Partial<LearningFormValues>,
): Promise<void> {
  const form = page.getByRole('form', { name: LEARNING_CREATE_REGION_LABEL });

  if (values.title !== undefined) {
    await form.getByLabel('タイトル').fill(values.title);
  }
  if (values.body !== undefined) {
    await form.getByLabel('学んだ内容').fill(values.body);
  }
  if (values.date !== undefined) {
    await form.getByLabel('投稿日').fill(values.date);
  }
  if (values.linkUrl !== undefined) {
    const urlField = form.getByLabel('URL');
    if ((await urlField.count()) === 0) {
      await form.getByRole('button', { name: LEARNING_ADD_LINK_LABEL }).click();
    }
    await form.getByLabel('URL').fill(values.linkUrl);
  }
  if (values.linkLabel !== undefined) {
    await form.getByLabel('ラベル（任意）').fill(values.linkLabel);
  }
}

export async function submitLearningCreateForm(page: Page): Promise<void> {
  await page
    .getByRole('form', { name: LEARNING_CREATE_REGION_LABEL })
    .getByRole('button', { name: LEARNING_CREATE_SUBMIT_LABEL })
    .click();
}

export async function expectLearningSuccessMessage(
  page: Page,
  message: string,
): Promise<void> {
  await expect(page.getByRole('status', { name: message })).toBeVisible();
}

export async function expectLearningValidationError(
  page: Page,
  message: string,
): Promise<void> {
  await expect(page.getByRole('alert')).toHaveText(message);
}

export async function expectLearningPostVisible(
  page: Page,
  title: string,
): Promise<void> {
  await expect(page.getByText(title, { exact: true })).toBeVisible({
    timeout: 15_000,
  });
}

export async function expectLearningPostAbsent(
  page: Page,
  title: string,
): Promise<void> {
  await expect(page.getByText(title, { exact: true })).toHaveCount(0);
}

export async function createLearningViaApi(
  request: APIRequestContext,
  input: LearningFormValues,
): Promise<{ id: string; status: number }> {
  const response = await request.post('/api/learnings', {
    headers: TRAINEE_API_HEADERS,
    data: {
      title: input.title,
      body: input.body,
      date: input.date,
      links:
        input.linkUrl !== undefined
          ? [
              {
                url: input.linkUrl,
                label: input.linkLabel,
              },
            ]
          : [],
    },
  });
  const body = (await response.json()) as { id: string };
  return { id: body.id, status: response.status() };
}

export function uniqueLearningTitle(prefix: string): string {
  return `${prefix}-${Date.now()}`;
}
