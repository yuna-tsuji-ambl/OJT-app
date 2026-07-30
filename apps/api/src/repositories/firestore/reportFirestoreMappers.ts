import type { DocumentData } from '@google-cloud/firestore';
import { normalizeReportComments } from '../../reports/reportComments.js';
import type { Report } from '../../reports/reportTypes.js';

/** Firestore に保存する報告書ドキュメント（ドメイン `Report` と同形） */
export type ReportDocument = Report;

function includeDefinedField<K extends string, V>(
  key: K,
  value: V | undefined,
): Partial<Record<K, V>> {
  if (value === undefined) {
    return {};
  }

  return { [key]: value } as Partial<Record<K, V>>;
}

export function toReportDocument(report: Report): ReportDocument {
  const normalized = normalizeReportComments(report);
  return {
    id: normalized.id,
    traineeId: normalized.traineeId,
    type: normalized.type,
    periodKey: normalized.periodKey,
    content: normalized.content,
    status: normalized.status,
    comments: normalized.comments,
    createdAt: normalized.createdAt,
    updatedAt: normalized.updatedAt,
    ...includeDefinedField('submittedAt', normalized.submittedAt),
  };
}

export function fromReportDocument(
  data: DocumentData | ReportDocument | undefined,
): Report {
  if (!data) {
    throw new Error('Report document data is required');
  }

  return toReportDocument(data as ReportDocument);
}
