import {
  TRAINER_DASHBOARD_SECTION_POSITION,
  TRAINER_DASHBOARD_SECTION_TYPE,
  type TrainerDashboardSectionType,
} from './trainerDashboardConstants.js';
import type {
  TrainerDashboard,
  TrainerDashboardSection,
} from './trainerDashboardTypes.js';

export function buildTrainerDashboard(): TrainerDashboard {
  return {
    sections: [
      {
        type: TRAINER_DASHBOARD_SECTION_TYPE.QUEST_CREATE,
        position: TRAINER_DASHBOARD_SECTION_POSITION.TOP,
        visible: true,
      },
    ],
  };
}

export function findTrainerDashboardSection(
  dashboard: TrainerDashboard,
  type: TrainerDashboardSectionType,
): TrainerDashboardSection | undefined {
  return dashboard.sections.find((section) => section.type === type);
}
