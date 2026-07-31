import { LearningInvalidInputError } from '../domain/errors.js';
import {
  LEARNING_BODY_MAX_LENGTH,
  LEARNING_LINK_LABEL_MAX_LENGTH,
  LEARNING_LINKS_MAX_COUNT,
  LEARNING_TITLE_MAX_LENGTH,
} from './learningConstants.js';
import { isValidIsoDateString } from './learningDateValidation.js';
import type { CreateLearningPostInput, LearningLink } from './learningTypes.js';

function rejectInvalidInput(): never {
  throw new LearningInvalidInputError();
}

function isValidHttpUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

function validateTitle(title: unknown): asserts title is string {
  if (typeof title !== 'string') {
    rejectInvalidInput();
  }
  if (title.trim().length === 0) {
    rejectInvalidInput();
  }
  if (title.length > LEARNING_TITLE_MAX_LENGTH) {
    rejectInvalidInput();
  }
}

function validateBody(body: unknown): asserts body is string {
  if (typeof body !== 'string') {
    rejectInvalidInput();
  }
  if (body.trim().length === 0) {
    rejectInvalidInput();
  }
  if (body.length > LEARNING_BODY_MAX_LENGTH) {
    rejectInvalidInput();
  }
}

function validateOptionalDate(date: unknown): void {
  if (date === undefined) {
    return;
  }

  if (typeof date !== 'string' || !isValidIsoDateString(date)) {
    rejectInvalidInput();
  }
}

function validateLink(link: unknown): asserts link is LearningLink {
  if (!link || typeof link !== 'object') {
    rejectInvalidInput();
  }

  const record = link as Record<string, unknown>;
  const url = record.url;

  if (typeof url !== 'string' || !isValidHttpUrl(url)) {
    rejectInvalidInput();
  }

  if (record.label !== undefined) {
    if (typeof record.label !== 'string') {
      rejectInvalidInput();
    }
    if (record.label.length > LEARNING_LINK_LABEL_MAX_LENGTH) {
      rejectInvalidInput();
    }
  }
}

function validateLinks(links: unknown): asserts links is LearningLink[] {
  if (links === undefined) {
    return;
  }

  if (!Array.isArray(links)) {
    rejectInvalidInput();
  }

  if (links.length > LEARNING_LINKS_MAX_COUNT) {
    rejectInvalidInput();
  }

  for (const link of links) {
    validateLink(link);
  }
}

export function validateCreateLearningPostInput(
  input: CreateLearningPostInput,
): void {
  validateTitle(input.title);
  validateBody(input.body);
  validateOptionalDate(input.date);
  validateLinks(input.links);
}
