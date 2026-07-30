import type { Firestore } from '@google-cloud/firestore';
import type { ReportType } from '../../reports/reportConstants.js';
import type { OwnedReportByType, Report } from '../../reports/reportTypes.js';
import { FIRESTORE_COLLECTIONS } from '../../firestore/collections.js';
import type { ReportRepository } from '../reportRepository.js';
import {
  fromReportDocument,
  toReportDocument,
} from './reportFirestoreMappers.js';

export class FirestoreReportRepository implements ReportRepository {
  constructor(private readonly db: Firestore) {}

  private reportsCollection() {
    return this.db.collection(FIRESTORE_COLLECTIONS.REPORTS);
  }

  async findByTraineeTypeAndPeriodKey<TType extends ReportType>(
    traineeId: string,
    reportType: TType,
    periodKey: string,
  ): Promise<OwnedReportByType[TType] | null> {
    const snapshot = await this.reportsCollection()
      .where('traineeId', '==', traineeId)
      .where('type', '==', reportType)
      .where('periodKey', '==', periodKey)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return null;
    }

    return fromReportDocument(
      snapshot.docs[0]!.data(),
    ) as OwnedReportByType[TType];
  }

  async findByTraineeId(traineeId: string): Promise<Report[]> {
    const snapshot = await this.reportsCollection()
      .where('traineeId', '==', traineeId)
      .get();

    return snapshot.docs.map((document) => fromReportDocument(document.data()));
  }

  async findById(reportId: string): Promise<Report | null> {
    const snapshot = await this.reportsCollection().doc(reportId).get();

    if (!snapshot.exists) {
      return null;
    }

    return fromReportDocument(snapshot.data());
  }

  async save<TType extends ReportType>(
    report: OwnedReportByType[TType],
  ): Promise<OwnedReportByType[TType]> {
    const document = toReportDocument(report);
    await this.reportsCollection().doc(report.id).set(document);
    return fromReportDocument(document) as OwnedReportByType[TType];
  }
}
