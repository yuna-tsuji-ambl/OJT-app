export type TrainerThreadReplyPayload = {
  threadId: string;
  templateId: string;
  traineeId: string;
};

export type TraineeThreadTextReplyPayload = {
  trainerId: string;
  threadId: string;
  content: string;
};

export type TraineeThreadStampReplyPayload = {
  trainerId: string;
  threadId: string;
  stampId: string;
};

export type TraineeNewMessagePayload =
  | { templateId: string; trainerId: string }
  | { content: string; trainerId: string };

export type TraineeMessagePayload =
  | TraineeNewMessagePayload
  | TraineeThreadTextReplyPayload
  | TraineeThreadStampReplyPayload;

export type TrainerStampReplyPayload = {
  threadId: string;
  stampId: string;
  traineeId: string;
};

export type TrainerNewMessagePayload = {
  templateId: string;
  traineeId: string;
};

export type TrainerThreadActionPayload =
  TrainerThreadReplyPayload | TrainerStampReplyPayload;

export type TrainerMessagePayload =
  TrainerThreadActionPayload | TrainerNewMessagePayload;
