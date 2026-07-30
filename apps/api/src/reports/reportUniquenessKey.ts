import type { ReportType } from './reportConstants.js';

export interface ReportUniquenessKeyInput {
  traineeId: string;
  type: ReportType;
  periodKey: string;
}

export function buildReportUniquenessKey({
  traineeId,
  type,
  periodKey,
}: ReportUniquenessKeyInput): string {
  return `${traineeId}:${type}:${periodKey}`;
}
