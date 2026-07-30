import { ReportInvalidInputError } from '../domain/errors.js';

export function assertValidReportInput(isValid: boolean): void {
  if (!isValid) {
    throw new ReportInvalidInputError();
  }
}
