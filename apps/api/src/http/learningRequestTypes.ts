import type { Request } from 'express';
import type {
  CreateLearningPostInput,
  LearningLink,
  ListLearningsQuery,
} from '../learnings/learningTypes.js';

function readOptionalString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

function parseLearningLink(value: unknown): LearningLink | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const record = value as Record<string, unknown>;
  const url = readOptionalString(record.url);

  if (!url) {
    return null;
  }

  const link: LearningLink = { url };
  const label = readOptionalString(record.label);

  if (label !== undefined) {
    link.label = label;
  }

  return link;
}

function parseLinks(value: unknown): LearningLink[] | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (!Array.isArray(value)) {
    return null as never;
  }

  const links: LearningLink[] = [];

  for (const item of value) {
    const link = parseLearningLink(item);
    if (!link) {
      return null as never;
    }
    links.push(link);
  }

  return links;
}

export function parseListLearningsQuery(
  query: Request['query'],
): ListLearningsQuery {
  const result: ListLearningsQuery = {};
  const authorId = readOptionalString(query.authorId);
  const from = readOptionalString(query.from);
  const to = readOptionalString(query.to);

  if (authorId) {
    result.authorId = authorId;
  }

  if (from) {
    result.from = from;
  }

  if (to) {
    result.to = to;
  }

  return result;
}

export function parseCreateLearningPostBody(
  body: unknown,
): CreateLearningPostInput | null {
  if (!body || typeof body !== 'object') {
    return null;
  }

  const record = body as Record<string, unknown>;
  const title = readOptionalString(record.title);
  const bodyText = readOptionalString(record.body);

  if (!title || bodyText === undefined) {
    return null;
  }

  const input: CreateLearningPostInput = {
    title,
    body: bodyText,
  };

  const date = readOptionalString(record.date);
  const links = parseLinks(record.links);

  if (record.links !== undefined && links === undefined) {
    return null;
  }

  if (date !== undefined) {
    input.date = date;
  }

  if (links !== undefined) {
    input.links = links;
  }

  return input;
}
