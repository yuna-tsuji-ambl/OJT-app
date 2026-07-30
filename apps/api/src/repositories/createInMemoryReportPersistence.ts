import type { ReportRepository } from './reportRepository.js';
import { InMemoryReportRepository } from './inMemoryReportRepository.js';

export function createInMemoryReportRepository(): ReportRepository {
  return new InMemoryReportRepository();
}
