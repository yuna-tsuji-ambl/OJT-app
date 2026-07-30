import { toUserContext } from '../domain/userContext.js';
import type { UserContext, UserRole } from '../domain/types.js';
import type { ReportRepository } from '../repositories/reportRepository.js';
import {
  REPORT_TYPE_DAILY,
  REPORT_TYPE_WEEKLY,
  type ReportType,
} from './reportConstants.js';
import {
  getOwnedReportCommand,
  putOwnedReportCommand,
} from './ownedReportCommands.js';
import {
  addReportCommentCommand,
  updateReportCommentCommand,
} from './reportCommentCommands.js';
import {
  getReportByIdCommand,
  listOwnReportsCommand,
  listReportsCommand,
} from './reportReadCommands.js';
import type { OwnReportListQuery } from './reportOwnListQuery.js';
import type {
  ListReportsCriteria,
  OwnedReportByType,
  PostReportCommentInput,
  PutReportInputByType,
  Report,
  ReportComment,
} from './reportTypes.js';

async function runWithUserContext<T>(
  userId: string,
  role: UserRole,
  execute: (context: UserContext) => Promise<T>,
): Promise<T> {
  return execute(toUserContext(userId, role));
}

function createOwnedReportFacades<TType extends ReportType>(reportType: TType) {
  return {
    put(
      periodKey: string,
      input: PutReportInputByType[TType],
      userId: string,
      role: UserRole,
      reportRepository: ReportRepository,
    ): Promise<OwnedReportByType[TType]> {
      return runWithUserContext(userId, role, (context) =>
        putOwnedReportCommand(
          reportType,
          periodKey,
          input,
          context,
          reportRepository,
        ),
      );
    },
    get(
      periodKey: string,
      userId: string,
      role: UserRole,
      reportRepository: ReportRepository,
    ): Promise<OwnedReportByType[TType]> {
      return runWithUserContext(userId, role, (context) =>
        getOwnedReportCommand(reportType, periodKey, context, reportRepository),
      );
    },
  };
}

const dailyReportFacades = createOwnedReportFacades(REPORT_TYPE_DAILY);
const weeklyReportFacades = createOwnedReportFacades(REPORT_TYPE_WEEKLY);

export const putDailyReport = dailyReportFacades.put;
export const getDailyReport = dailyReportFacades.get;
export const putWeeklyReport = weeklyReportFacades.put;
export const getWeeklyReport = weeklyReportFacades.get;

export async function listReports(
  criteria: ListReportsCriteria,
  userId: string,
  role: UserRole,
  reportRepository: ReportRepository,
): Promise<Report[]> {
  return runWithUserContext(userId, role, (context) =>
    listReportsCommand(criteria, context, reportRepository),
  );
}

export async function listOwnReports(
  reportType: ReportType,
  query: OwnReportListQuery,
  userId: string,
  role: UserRole,
  reportRepository: ReportRepository,
): Promise<Report[]> {
  return runWithUserContext(userId, role, (context) =>
    listOwnReportsCommand(reportType, query, context, reportRepository),
  );
}

export async function getReportById(
  reportId: string,
  userId: string,
  role: UserRole,
  reportRepository: ReportRepository,
): Promise<Report> {
  return runWithUserContext(userId, role, (context) =>
    getReportByIdCommand(reportId, context, reportRepository),
  );
}

export async function addReportComment(
  reportId: string,
  input: PostReportCommentInput,
  userId: string,
  role: UserRole,
  reportRepository: ReportRepository,
): Promise<ReportComment> {
  return runWithUserContext(userId, role, (context) =>
    addReportCommentCommand(reportId, input, context, reportRepository),
  );
}

export async function updateReportComment(
  reportId: string,
  commentId: string,
  input: PostReportCommentInput,
  userId: string,
  role: UserRole,
  reportRepository: ReportRepository,
): Promise<ReportComment> {
  return runWithUserContext(userId, role, (context) =>
    updateReportCommentCommand(
      reportId,
      commentId,
      input,
      context,
      reportRepository,
    ),
  );
}
