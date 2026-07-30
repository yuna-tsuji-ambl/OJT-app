import { REPORT_STATUS_SUBMITTED } from './reportConstants.js';
import type { ReportStatus } from './reportConstants.js';

interface ReportWithSubmittedAt {
  submittedAt?: string;
}

export function resolveSubmittedAt(
  status: ReportStatus,
  existing: ReportWithSubmittedAt | null | undefined,
  now: string,
): string | undefined {
  if (status !== REPORT_STATUS_SUBMITTED) {
    return undefined;
  }

  return existing?.submittedAt ?? now;
}
