export interface ConditionDraft {
  workload: number;
  comprehension: number;
  mental: number;
}

export interface ConditionSubmitResult {
  message: string;
  record: ConditionDraft;
}

export interface ConditionHistoryRecord extends ConditionDraft {
  recordedAt: string;
}

/** 推移表の1行。履歴レコードと同一構造 */
export type ConditionGraphTableRow = ConditionHistoryRecord;

export interface ConditionGraphData {
  labels: string[];
  workload: number[];
  comprehension: number[];
  mental: number[];
  rows: ConditionGraphTableRow[];
}

export interface ConditionAlertMessage {
  hasAlert: boolean;
  message: string;
}

export interface ConditionAlert extends ConditionAlertMessage {
  traineeId: string;
  latestMental: number;
}

export type ConditionPageAlert = ConditionAlertMessage;
