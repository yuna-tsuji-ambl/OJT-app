import { Router, type Response } from 'express';
import { INVALID_REPORT_INPUT_MESSAGE } from '../domain/errors.js';
import type { UserRole } from '../domain/types.js';
import {
  addReportComment,
  getDailyReport,
  getReportById,
  getWeeklyReport,
  listOwnReports,
  listReports,
  putDailyReport,
  putWeeklyReport,
  updateReportComment,
} from '../report.js';
import {
  parseListReportsQuery,
  parseOwnReportListQuery,
  parsePostReportCommentBody,
  parsePutDailyReportBody,
  parsePutReportCommentBody,
  parsePutWeeklyReportBody,
} from '../http/reportRequestTypes.js';
import { readRouteParam } from '../http/expressRouteParams.js';
import { runReportRoute } from '../http/runReportRoute.js';
import type { ReportRepository } from '../repositories/reportRepository.js';
import {
  REPORT_TYPE_DAILY,
  REPORT_TYPE_WEEKLY,
  type ReportType,
} from '../reports/reportConstants.js';
import type {
  DailyReport,
  PutDailyReportInput,
  PutWeeklyReportInput,
  WeeklyReport,
} from '../reports/reportTypes.js';

function respondInvalidReportInput(response: Response): void {
  response.status(400).json({ error: INVALID_REPORT_INPUT_MESSAGE });
}

const OWN_REPORT_LIST_ROUTES: ReadonlyArray<{
  path: string;
  reportType: ReportType;
}> = [
  { path: '/reports/daily', reportType: REPORT_TYPE_DAILY },
  { path: '/reports/weekly', reportType: REPORT_TYPE_WEEKLY },
];

function registerOwnedReportPeriodRoutes<TBody, TReport>(
  router: Router,
  reportRepository: ReportRepository,
  options: {
    path: string;
    paramName: string;
    parseBody: (body: unknown) => TBody | null;
    getReport: (
      periodKey: string,
      userId: string,
      role: UserRole,
      repository: ReportRepository,
    ) => Promise<TReport>;
    putReport: (
      periodKey: string,
      body: TBody,
      userId: string,
      role: UserRole,
      repository: ReportRepository,
    ) => Promise<TReport>;
  },
): void {
  router.get(options.path, (request, response) =>
    runReportRoute(request, response, (context) =>
      options.getReport(
        readRouteParam(request.params[options.paramName]),
        context.userId,
        context.role,
        reportRepository,
      ),
    ),
  );

  router.put(options.path, (request, response) => {
    const body = options.parseBody(request.body);

    if (!body) {
      respondInvalidReportInput(response);
      return;
    }

    return runReportRoute(request, response, (context) =>
      options.putReport(
        readRouteParam(request.params[options.paramName]),
        body,
        context.userId,
        context.role,
        reportRepository,
      ),
    );
  });
}

export function createReportRouter(reportRepository: ReportRepository): Router {
  const router = Router();

  router.get('/reports', (request, response) => {
    const query = parseListReportsQuery(request.query);

    if (!query) {
      respondInvalidReportInput(response);
      return;
    }

    return runReportRoute(request, response, (context) =>
      listReports(query, context.userId, context.role, reportRepository),
    );
  });

  // Register before /reports/:id so "daily" / "weekly" are not captured as ids.
  for (const { path, reportType } of OWN_REPORT_LIST_ROUTES) {
    router.get(path, (request, response) =>
      runReportRoute(request, response, (context) =>
        listOwnReports(
          reportType,
          parseOwnReportListQuery(request.query),
          context.userId,
          context.role,
          reportRepository,
        ),
      ),
    );
  }

  registerOwnedReportPeriodRoutes<PutDailyReportInput, DailyReport>(
    router,
    reportRepository,
    {
      path: '/reports/daily/:date',
      paramName: 'date',
      parseBody: parsePutDailyReportBody,
      getReport: getDailyReport,
      putReport: putDailyReport,
    },
  );

  registerOwnedReportPeriodRoutes<PutWeeklyReportInput, WeeklyReport>(
    router,
    reportRepository,
    {
      path: '/reports/weekly/:weekKey',
      paramName: 'weekKey',
      parseBody: parsePutWeeklyReportBody,
      getReport: getWeeklyReport,
      putReport: putWeeklyReport,
    },
  );

  router.post('/reports/:id/comments', (request, response) => {
    const body = parsePostReportCommentBody(request.body);

    if (!body) {
      respondInvalidReportInput(response);
      return;
    }

    return runReportRoute(
      request,
      response,
      (context) =>
        addReportComment(
          readRouteParam(request.params.id),
          body,
          context.userId,
          context.role,
          reportRepository,
        ),
      { successStatus: 201 },
    );
  });

  router.put('/reports/:id/comments/:commentId', (request, response) => {
    const body = parsePutReportCommentBody(request.body);

    if (!body) {
      respondInvalidReportInput(response);
      return;
    }

    return runReportRoute(request, response, (context) =>
      updateReportComment(
        readRouteParam(request.params.id),
        readRouteParam(request.params.commentId),
        body,
        context.userId,
        context.role,
        reportRepository,
      ),
    );
  });

  router.get('/reports/:id', (request, response) =>
    runReportRoute(request, response, (context) =>
      getReportById(
        readRouteParam(request.params.id),
        context.userId,
        context.role,
        reportRepository,
      ),
    ),
  );

  return router;
}
