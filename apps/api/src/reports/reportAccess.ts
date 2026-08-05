import { ensureTrainer } from '../domain/authorization.js';
import { ForbiddenError } from '../domain/errors.js';
import { isTrainerAssignedToTrainee } from '../domain/traineeTrainerAssignment.js';
import type { UserContext } from '../domain/types.js';
import type { Report } from './reportTypes.js';

export function isReportOwner(
  context: UserContext,
  traineeId: string,
): boolean {
  return context.role === 'trainee' && context.userId === traineeId;
}

export function isAssignedTrainerForTrainee(
  context: UserContext,
  traineeId: string,
): boolean {
  return (
    context.role === 'trainer' &&
    isTrainerAssignedToTrainee(context.userId, traineeId)
  );
}

export function canAccessReportDetail(
  context: UserContext,
  report: Report,
): boolean {
  return (
    isAssignedTrainerForTrainee(context, report.traineeId) ||
    isReportOwner(context, report.traineeId)
  );
}

function ensureAccess(allowed: boolean): void {
  if (!allowed) {
    throw new ForbiddenError();
  }
}

export function ensureReportDetailAccess(
  context: UserContext,
  report: Report,
): void {
  ensureAccess(canAccessReportDetail(context, report));
}

/**
 * トレーナーが指定新卒の報告一覧を閲覧できることを保証する。
 * （ロール検証 + 担当関係）
 */
export function ensureTrainerCanListReportsForTrainee(
  context: UserContext,
  traineeId: string,
): void {
  ensureTrainer(context);
  ensureAccess(isAssignedTrainerForTrainee(context, traineeId));
}

/** 担当トレーナーのみ報告にコメントできる（UC-R05） */
export function ensureTrainerCanCommentOnReport(
  context: UserContext,
  report: Report,
): void {
  ensureTrainer(context);
  ensureAccess(isAssignedTrainerForTrainee(context, report.traineeId));
}
