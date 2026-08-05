import { fetchOwnDailyReports } from '../api/reportApi';
import type { DailyReportResponse } from '../domain/reportForm';
import { useReportList } from './useReportList';

const EMPTY_OWN_DAILY_REPORTS: readonly DailyReportResponse[] = [];

export function useOwnDailyReports() {
  return useReportList(fetchOwnDailyReports, EMPTY_OWN_DAILY_REPORTS);
}
