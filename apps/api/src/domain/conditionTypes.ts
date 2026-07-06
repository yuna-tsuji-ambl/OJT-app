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

export interface ConditionGraphData {
  labels: string[];
  workload: number[];
  comprehension: number[];
  mental: number[];
}

export interface ConditionAlert {
  traineeId: string;
  hasAlert: boolean;
  message: string;
  latestMental: number;
}
