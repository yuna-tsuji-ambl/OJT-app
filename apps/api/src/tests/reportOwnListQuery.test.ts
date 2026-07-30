import { describe, expect, it } from 'vitest';
import { ReportInvalidInputError } from '../domain/errors.js';
import {
  REPORT_TYPE_DAILY,
  REPORT_TYPE_WEEKLY,
} from '../reports/reportConstants.js';
import {
  REPORT_PERIOD_FILTER_CONFLICT_MESSAGE,
  dailyDateToIsoWeekKey,
  filterOwnReports,
  reportContentIncludesQuery,
} from '../reports/reportOwnListQuery.js';
import type { Report } from '../reports/reportTypes.js';

function createDailyReport(periodKey: string, doneToday: string): Report {
  return {
    id: `id-${periodKey}`,
    traineeId: 'trainee-1',
    type: REPORT_TYPE_DAILY,
    periodKey,
    content: {
      doneToday,
      learnedToday: '',
      blockers: '',
      planTomorrow: '',
    },
    status: 'submitted',
    comments: [],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };
}

function createWeeklyReport(periodKey: string, reflection: string): Report {
  return {
    id: `id-${periodKey}`,
    traineeId: 'trainee-1',
    type: REPORT_TYPE_WEEKLY,
    periodKey,
    content: {
      achievements: '',
      nextWeekGoals: '',
      reflection,
      questionsForTrainer: '',
    },
    status: 'submitted',
    comments: [],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };
}

describe('reportOwnListQuery（I-R06〜I-R12 ドメイン）', () => {
  it('I-R06: 本文全体検索で一致する日次のみ残す', () => {
    const reports = [
      createDailyReport('2026-09-01', 'ユニーク検索語IR06 あり'),
      createDailyReport('2026-09-02', '別件のみ'),
    ];

    const filtered = filterOwnReports(reports, REPORT_TYPE_DAILY, {
      q: 'ユニーク検索語IR06',
    });

    expect(filtered.map((report) => report.periodKey)).toEqual(['2026-09-01']);
  });

  it('I-R07: from/to で期間内のみ残す', () => {
    const reports = [
      createDailyReport('2026-09-11', 'in'),
      createDailyReport('2026-09-15', 'out'),
    ];

    const filtered = filterOwnReports(reports, REPORT_TYPE_DAILY, {
      from: '2026-09-10',
      to: '2026-09-12',
    });

    expect(filtered.map((report) => report.periodKey)).toEqual(['2026-09-11']);
  });

  it('I-R08: date で特定日のみ残す', () => {
    const reports = [
      createDailyReport('2026-07-28', 'target'),
      createDailyReport('2026-07-29', 'other'),
    ];

    const filtered = filterOwnReports(reports, REPORT_TYPE_DAILY, {
      date: '2026-07-28',
    });

    expect(filtered.map((report) => report.periodKey)).toEqual(['2026-07-28']);
  });

  it('I-R09: 週次の本文検索', () => {
    const reports = [
      createWeeklyReport('2026-W36', '所感に 週次ユニーク語IR09'),
      createWeeklyReport('2026-W37', '別の所感'),
    ];

    const filtered = filterOwnReports(reports, REPORT_TYPE_WEEKLY, {
      q: '週次ユニーク語IR09',
    });

    expect(filtered.map((report) => report.periodKey)).toEqual(['2026-W36']);
  });

  it('I-R10: 日付指定は含む週の週キーに正規化する', () => {
    expect(dailyDateToIsoWeekKey('2026-07-22')).toBe('2026-W30');

    const reports = [createWeeklyReport('2026-W30', '週次')];
    const filtered = filterOwnReports(reports, REPORT_TYPE_WEEKLY, {
      date: '2026-07-22',
    });

    expect(filtered.map((report) => report.periodKey)).toEqual(['2026-W30']);
  });

  it('I-R11: 週キー指定', () => {
    const reports = [createWeeklyReport('2026-W30', '週次')];
    const filtered = filterOwnReports(reports, REPORT_TYPE_WEEKLY, {
      date: '2026-W30',
    });

    expect(filtered.map((report) => report.periodKey)).toEqual(['2026-W30']);
  });

  it('I-R12: from/to と date 同時指定は排他メッセージで拒否', () => {
    expect(() =>
      filterOwnReports([], REPORT_TYPE_DAILY, {
        from: '2026-07-01',
        to: '2026-07-31',
        date: '2026-07-28',
      }),
    ).toThrow(ReportInvalidInputError);

    try {
      filterOwnReports([], REPORT_TYPE_WEEKLY, {
        from: '2026-07-01',
        to: '2026-07-31',
        date: '2026-07-28',
      });
      expect.fail('should throw');
    } catch (error) {
      expect(error).toBeInstanceOf(ReportInvalidInputError);
      expect((error as Error).message).toBe(
        REPORT_PERIOD_FILTER_CONFLICT_MESSAGE,
      );
    }
  });

  it('BR-R12: periodKey は検索対象に含めない', () => {
    const report = createDailyReport('2026-09-01', '本文のみ');
    expect(reportContentIncludesQuery(report, '2026-09-01')).toBe(false);
    expect(reportContentIncludesQuery(report, '本文')).toBe(true);
  });
});
