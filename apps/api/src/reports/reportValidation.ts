import {
  REPORT_CONTENT_FIELDS_BY_TYPE,
  REPORT_STATUS_SUBMITTED,
  type ReportType,
} from './reportConstants.js';
import type { PutReportInputByType } from './reportTypes.js';
import { assertValidReportInput } from './assertValidReportInput.js';
import {
  isNonEmptyString,
  isWithinReportContentFieldMaxLength,
} from './reportTextValidation.js';

function assertContentFields(
  content: Record<string, string>,
  fields: readonly string[],
  isValid: (value: string) => boolean,
): void {
  assertValidReportInput(fields.every((field) => isValid(content[field])));
}

export function validateOwnedReportPutInput<TType extends ReportType>(
  reportType: TType,
  input: PutReportInputByType[TType],
): void {
  const fields = REPORT_CONTENT_FIELDS_BY_TYPE[reportType];

  assertContentFields(
    input.content,
    fields,
    isWithinReportContentFieldMaxLength,
  );

  if (input.status === REPORT_STATUS_SUBMITTED) {
    assertContentFields(input.content, fields, isNonEmptyString);
  }
}
