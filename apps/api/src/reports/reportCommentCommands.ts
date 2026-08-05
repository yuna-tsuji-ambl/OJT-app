import { ReportNotFoundError } from '../domain/errors.js';
import type { UserContext } from '../domain/types.js';
import type { ReportRepository } from '../repositories/reportRepository.js';
import { ensureTrainerCanCommentOnReport } from './reportAccess.js';
import {
  appendReportComment,
  createReportComment,
  normalizeReportComments,
  updateReportCommentContent,
} from './reportComments.js';
import { requireReportById } from './reportQueries.js';
import type {
  OwnedReportByType,
  PostReportCommentInput,
  Report,
  ReportComment,
  ReportType,
} from './reportTypes.js';

function toOwnedReportForSave(report: Report): OwnedReportByType[ReportType] {
  return report as OwnedReportByType[ReportType];
}

async function loadReportForTrainerCommentMutation(
  reportId: string,
  context: UserContext,
  reportRepository: ReportRepository,
): Promise<Report> {
  const report = normalizeReportComments(
    await requireReportById(reportRepository, reportId),
  );
  ensureTrainerCanCommentOnReport(context, report);
  return report;
}

/** 担当トレーナーが報告にコメントを追加する（UC-R05 / P-R01） */
export async function addReportCommentCommand(
  reportId: string,
  input: PostReportCommentInput,
  context: UserContext,
  reportRepository: ReportRepository,
): Promise<ReportComment> {
  const report = await loadReportForTrainerCommentMutation(
    reportId,
    context,
    reportRepository,
  );

  const comment = createReportComment(context.userId, input.content);
  await reportRepository.save(
    toOwnedReportForSave(appendReportComment(report, comment)),
  );

  return comment;
}

/** 担当トレーナーが報告コメントを更新する（UC-R05 / P-R02） */
export async function updateReportCommentCommand(
  reportId: string,
  commentId: string,
  input: PostReportCommentInput,
  context: UserContext,
  reportRepository: ReportRepository,
): Promise<ReportComment> {
  const report = await loadReportForTrainerCommentMutation(
    reportId,
    context,
    reportRepository,
  );

  const updated = updateReportCommentContent(report, commentId, input.content);

  if (!updated) {
    throw new ReportNotFoundError(commentId);
  }

  await reportRepository.save(toOwnedReportForSave(updated.report));
  return updated.comment;
}
