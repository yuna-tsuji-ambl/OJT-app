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

export type TraineeThreadTemplateReplyPayload = {
  trainerId: string;
  threadId: string;
  templateId: string;
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
  | TraineeThreadTemplateReplyPayload
  | TraineeThreadStampReplyPayload;

export type TrainerStampReplyPayload = {
  threadId: string;
  stampId: string;
  traineeId: string;
};

export type TrainerTextReplyPayload = {
  threadId: string;
  content: string;
  traineeId: string;
};

export type TrainerNewMessagePayload = {
  templateId: string;
  traineeId: string;
};

export type TrainerNewTextMessagePayload = {
  content: string;
  traineeId: string;
};

export type TrainerThreadActionPayload =
  | TrainerThreadReplyPayload
  | TrainerStampReplyPayload
  | TrainerTextReplyPayload;

export type TrainerMessagePayload =
  | TrainerThreadActionPayload
  | TrainerNewMessagePayload
  | TrainerNewTextMessagePayload;
