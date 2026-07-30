import { REPORT_CONTENT_FIELD_MAX_LENGTH } from './reportConstants.js';

export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

export function isWithinReportContentFieldMaxLength(value: string): boolean {
  return value.length <= REPORT_CONTENT_FIELD_MAX_LENGTH;
}
