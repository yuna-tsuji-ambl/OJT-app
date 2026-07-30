import {
  REPORT_STATUSES,
  REPORT_TYPES,
  type ReportStatus,
  type ReportType,
} from './reportConstants.js';

export function isReportStatus(value: unknown): value is ReportStatus {
  return (
    typeof value === 'string' &&
    (REPORT_STATUSES as readonly string[]).includes(value)
  );
}

export function isReportType(value: unknown): value is ReportType {
  return (
    typeof value === 'string' &&
    (REPORT_TYPES as readonly string[]).includes(value)
  );
}

export function isReportContent<TField extends string>(
  value: unknown,
  fields: readonly TField[],
): value is Record<TField, string> {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const content = value as Record<string, unknown>;
  return fields.every((field) => typeof content[field] === 'string');
}
