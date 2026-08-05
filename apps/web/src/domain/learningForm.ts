export const LEARNING_TITLE_MAX_LENGTH = 100;
export const LEARNING_BODY_MAX_LENGTH = 2000;
export const LEARNING_LINK_LABEL_MAX_LENGTH = 100;
export const LEARNING_LINKS_MAX_COUNT = 10;

export const LEARNING_FEED_PATH = '/learnings';
export const LEARNING_CREATE_PATH = '/learnings/new';

export const LEARNING_HEADER_NAV_LABEL = '学び';
export const LEARNING_FEED_PAGE_TITLE = '学びタイムライン';
export const LEARNING_CREATE_PAGE_TITLE = '学びを投稿';
export const LEARNING_CREATE_LINK_LABEL = '学びを投稿';
export const LEARNING_FEED_HEADING_ID = 'learning-feed-heading';
export const LEARNING_CREATE_HEADING_ID = 'learning-create-heading';

export const LEARNING_FEED_REGION_LABEL = '学びタイムライン';
export const LEARNING_CREATE_REGION_LABEL = '学び投稿';

export const LEARNING_TITLE_FIELD_LABEL = 'タイトル';
export const LEARNING_BODY_FIELD_LABEL = '学んだ内容';
export const LEARNING_DATE_FIELD_LABEL = '投稿日';
export const LEARNING_LINKS_FIELD_LABEL = '参考リンク';

export const LEARNING_CREATE_SUBMIT_LABEL = '投稿';
export const LEARNING_ADD_LINK_LABEL = 'リンクを追加';
export const LEARNING_REMOVE_LINK_LABEL = '削除';

export const LEARNING_CREATE_SUCCESS_MESSAGE = '学びを投稿しました';
export const LEARNING_PERSIST_FAILED_MESSAGE = '投稿に失敗しました';
export const LEARNING_TITLE_REQUIRED_MESSAGE = 'タイトルを入力してください';
export const LEARNING_BODY_REQUIRED_MESSAGE = '学んだ内容を入力してください';
export const LEARNING_INVALID_URL_MESSAGE =
  'URLはhttpまたはhttpsで始まる有効な形式で入力してください';
export const LEARNING_LINKS_MAX_MESSAGE = `参考リンクは${LEARNING_LINKS_MAX_COUNT}件までです`;

export interface LearningLink {
  readonly url: string;
  readonly label?: string;
}

export interface LearningPostResponse {
  readonly id: string;
  readonly authorId: string;
  readonly date: string;
  readonly title: string;
  readonly body: string;
  readonly links: readonly LearningLink[];
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface CreateLearningInput {
  readonly title: string;
  readonly body: string;
  readonly date?: string;
  readonly links?: readonly LearningLink[];
}

export interface LearningLinkFormValue {
  readonly url: string;
  readonly label: string;
}

export interface LearningFormValues {
  readonly title: string;
  readonly body: string;
  readonly date: string;
  readonly links: readonly LearningLinkFormValue[];
}

export type LearningPersistFeedback =
  | { readonly type: 'success'; readonly message: string }
  | { readonly type: 'error'; readonly message: string }
  | null;

export function createEmptyLearningFormValues(): LearningFormValues {
  return {
    title: '',
    body: '',
    date: '',
    links: [],
  };
}

export function createEmptyLearningLinkFormValue(): LearningLinkFormValue {
  return { url: '', label: '' };
}

export function isValidHttpUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export function formatLearningDate(date: string): string {
  const [year, month, day] = date.split('-');
  return `${Number(year)}年${Number(month)}月${Number(day)}日`;
}

export function formatLearningLinkLabel(link: LearningLink): string {
  if (link.label && link.label.trim().length > 0) {
    return link.label;
  }
  try {
    return new URL(link.url).hostname;
  } catch {
    return link.url;
  }
}

export function validateLearningFormValues(
  values: LearningFormValues,
): string | null {
  if (values.title.trim().length === 0) {
    return LEARNING_TITLE_REQUIRED_MESSAGE;
  }

  if (values.title.length > LEARNING_TITLE_MAX_LENGTH) {
    return `タイトルは${LEARNING_TITLE_MAX_LENGTH}文字以内で入力してください`;
  }

  if (values.body.trim().length === 0) {
    return LEARNING_BODY_REQUIRED_MESSAGE;
  }

  if (values.body.length > LEARNING_BODY_MAX_LENGTH) {
    return `学んだ内容は${LEARNING_BODY_MAX_LENGTH}文字以内で入力してください`;
  }

  const filledLinks = values.links.filter((link) => link.url.trim().length > 0);

  if (filledLinks.length > LEARNING_LINKS_MAX_COUNT) {
    return LEARNING_LINKS_MAX_MESSAGE;
  }

  for (const link of filledLinks) {
    if (!isValidHttpUrl(link.url.trim())) {
      return LEARNING_INVALID_URL_MESSAGE;
    }
    if (link.label.length > LEARNING_LINK_LABEL_MAX_LENGTH) {
      return `リンクのラベルは${LEARNING_LINK_LABEL_MAX_LENGTH}文字以内で入力してください`;
    }
  }

  return null;
}

export function toCreateLearningInput(
  values: LearningFormValues,
): CreateLearningInput {
  const filledLinks = values.links
    .filter((link) => link.url.trim().length > 0)
    .map((link) => ({
      url: link.url.trim(),
      label: link.label.trim() || undefined,
    }));

  return {
    title: values.title.trim(),
    body: values.body.trim(),
    date: values.date.trim() || undefined,
    links: filledLinks,
  };
}
