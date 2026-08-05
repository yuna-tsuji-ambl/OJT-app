import { fetchOwnWeeklyReports } from '../api/reportApi';
import type { WeeklyReportResponse } from '../domain/reportForm';
import { useReportList } from './useReportList';

const EMPTY_OWN_WEEKLY_REPORTS: readonly WeeklyReportResponse[] = [];

export function useOwnWeeklyReports() {
  return useReportList(fetchOwnWeeklyReports, EMPTY_OWN_WEEKLY_REPORTS);
}
