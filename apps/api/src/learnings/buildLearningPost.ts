import { formatServerTodayDate } from './learningDateValidation.js';
import type { CreateLearningPostInput, LearningPost } from './learningTypes.js';

export interface BuildLearningPostParams {
  input: CreateLearningPostInput;
  authorId: string;
  existing?: LearningPost | null;
  now?: string;
  todayDate?: string;
}

export function buildLearningPost({
  input,
  authorId,
  existing = null,
  now = new Date().toISOString(),
  todayDate = formatServerTodayDate(new Date(now)),
}: BuildLearningPostParams): LearningPost {
  const date = input.date ?? existing?.date ?? todayDate;
  const links = input.links ?? existing?.links ?? [];

  return {
    id: existing?.id ?? crypto.randomUUID(),
    authorId,
    date,
    title: input.title,
    body: input.body,
    links: links.map((link) => ({
      url: link.url,
      ...(link.label !== undefined ? { label: link.label } : {}),
    })),
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
}
