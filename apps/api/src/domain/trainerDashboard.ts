import {
  TRAINER_DASHBOARD_SECTION_POSITION,
  TRAINER_DASHBOARD_SECTION_TYPE,
} from './trainerDashboardConstants.js';
import type { TrainerDashboard } from './trainerDashboardTypes.js';

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
