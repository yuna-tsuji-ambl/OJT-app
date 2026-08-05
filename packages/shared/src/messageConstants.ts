export const THREAD_MESSAGE_TYPE = {
  TEXT: 'text',
  TEMPLATE: 'template',
  STAMP: 'stamp',
} as const;

export type ThreadMessageType =
  (typeof THREAD_MESSAGE_TYPE)[keyof typeof THREAD_MESSAGE_TYPE];

export const QUESTION_TEMPLATES = [
  { id: 'TQ1', label: '〇〇の件で3分いいですか？' },
  { id: 'TQ2', label: 'わからないことがあるので教えてください' },
  { id: 'TQ3', label: 'レビューをお願いしたいです' },
  { id: 'TQ4', label: '今忙しいですか？' },
  { id: 'TQ5', label: '相談したいことがあります' },
] as const;

export type QuestionTemplateId = (typeof QUESTION_TEMPLATES)[number]['id'];

export const QUESTION_TEMPLATE_TQ1_ID = QUESTION_TEMPLATES[0].id;
export const QUESTION_TEMPLATE_TQ2_ID = QUESTION_TEMPLATES[1].id;
export const QUESTION_TEMPLATE_TQ3_ID = QUESTION_TEMPLATES[2].id;
export const QUESTION_TEMPLATE_TQ4_ID = QUESTION_TEMPLATES[3].id;
export const QUESTION_TEMPLATE_TQ5_ID = QUESTION_TEMPLATES[4].id;

export const QUESTION_TEMPLATE_TQ1_LABEL = QUESTION_TEMPLATES[0].label;
export const QUESTION_TEMPLATE_TQ2_LABEL = QUESTION_TEMPLATES[1].label;
export const QUESTION_TEMPLATE_TQ3_LABEL = QUESTION_TEMPLATES[2].label;
export const QUESTION_TEMPLATE_TQ4_LABEL = QUESTION_TEMPLATES[3].label;
export const QUESTION_TEMPLATE_TQ5_LABEL = QUESTION_TEMPLATES[4].label;

export function buildQuestionTemplateContentById(): Readonly<
  Record<string, string>
> {
  return Object.fromEntries(
    QUESTION_TEMPLATES.map((template) => [template.id, template.label]),
  );
}

export function findQuestionTemplateIdByLabel(
  label: string,
): QuestionTemplateId | undefined {
  return QUESTION_TEMPLATES.find((template) => template.label === label)?.id;
}

export const REPLY_TEMPLATES = [
  { id: 'TT1', label: '今は手が離せません。後で連絡します' },
  { id: 'TT2', label: '質問OKです。声をかけてください' },
  { id: 'TT3', label: 'ドキュメントを確認してみてください' },
  { id: 'TT4', label: '明日の1on1で話しましょう' },
  { id: 'TT5', label: '状況を共有してください' },
] as const;

export type ReplyTemplateId = (typeof REPLY_TEMPLATES)[number]['id'];

export const REPLY_TEMPLATE_TT2_ID = REPLY_TEMPLATES[1].id;
export const REPLY_TEMPLATE_TT2_LABEL = REPLY_TEMPLATES[1].label;
export const REPLY_TEMPLATE_TT4_ID = REPLY_TEMPLATES[3].id;

export function buildReplyTemplateContentById(): Readonly<
  Record<string, string>
> {
  return Object.fromEntries(
    REPLY_TEMPLATES.map((template) => [template.id, template.label]),
  );
}

export function findReplyTemplateIdByLabel(
  label: string,
): ReplyTemplateId | undefined {
  return REPLY_TEMPLATES.find((template) => template.label === label)?.id;
}

export const STAMPS = [
  { id: 'ST1', label: '👍 OK' },
  { id: 'ST2', label: '🙏 ありがとう' },
  { id: 'ST3', label: '✅ 了解' },
  { id: 'ST4', label: '⏰ あとで' },
  { id: 'ST5', label: '❓ 詳しく' },
  { id: 'ST6', label: '👀 確認中' },
  { id: 'ST7', label: '💬 話そう' },
  { id: 'ST8', label: '📝 メモした' },
  { id: 'ST9', label: '🙌 ナイス' },
  { id: 'ST10', label: '🚧 ちょっと待って' },
] as const;

export type StampId = (typeof STAMPS)[number]['id'];

export const STAMP_ST1_ID = STAMPS[0].id;
export const STAMP_ST1_LABEL = STAMPS[0].label;

export function buildStampContentById(): Readonly<Record<string, string>> {
  return Object.fromEntries(STAMPS.map((stamp) => [stamp.id, stamp.label]));
}

export function findStampIdByLabel(label: string): StampId | undefined {
  return STAMPS.find((stamp) => stamp.label === label)?.id;
}

export const TRAINEE_STAMPS = [
  { id: 'STS1', label: '🙇 ありがとうございます' },
  { id: 'STS2', label: '✅ 承知いたしました' },
  { id: 'STS3', label: '🙏 よろしくお願いいたします' },
  { id: 'STS4', label: '⏰ 後ほど確認いたします' },
  { id: 'STS5', label: '❓ 詳しく教えていただけますか' },
] as const;

export type TraineeStampId = (typeof TRAINEE_STAMPS)[number]['id'];
