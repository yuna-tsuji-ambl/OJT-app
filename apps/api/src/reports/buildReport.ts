import type { ReportType } from './reportConstants.js';
import type {
  OwnedReportByType,
  ReportContentByType,
  ReportStatus,
} from './reportTypes.js';
import { resolveSubmittedAt } from './reportSubmittedAt.js';

export interface BuildReportParams<TType extends ReportType> {
  reportType: TType;
  traineeId: string;
  periodKey: string;
  status: ReportStatus;
  content: ReportContentByType[TType];
  existing?: OwnedReportByType[TType] | null;
  now?: string;
}

export function buildReport<TType extends ReportType>({
  reportType,
  traineeId,
  periodKey,
  status,
  content,
  existing = null,
  now = new Date().toISOString(),
}: BuildReportParams<TType>): OwnedReportByType[TType] {
  const submittedAt = resolveSubmittedAt(status, existing, now);
  const report = {
    id: existing?.id ?? crypto.randomUUID(),
    traineeId,
    type: reportType,
    periodKey,
    content: { ...content },
    status,
    comments: existing?.comments ? [...existing.comments] : [],
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    ...(submittedAt !== undefined ? { submittedAt } : {}),
  } as OwnedReportByType[TType];

  return report;
}
