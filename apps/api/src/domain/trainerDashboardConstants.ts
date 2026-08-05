export const TRAINER_DASHBOARD_SECTION_TYPE = {
  QUEST_CREATE: 'questCreate',
} as const;

export const TRAINER_DASHBOARD_SECTION_POSITION = {
  TOP: 'top',
  MIDDLE: 'middle',
  BOTTOM: 'bottom',
} as const;

export type TrainerDashboardSectionType =
  (typeof TRAINER_DASHBOARD_SECTION_TYPE)[keyof typeof TRAINER_DASHBOARD_SECTION_TYPE];

export type TrainerDashboardSectionPosition =
  (typeof TRAINER_DASHBOARD_SECTION_POSITION)[keyof typeof TRAINER_DASHBOARD_SECTION_POSITION];
