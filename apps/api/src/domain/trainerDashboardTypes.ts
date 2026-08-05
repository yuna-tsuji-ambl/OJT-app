import type {
  TrainerDashboardSectionPosition,
  TrainerDashboardSectionType,
} from './trainerDashboardConstants.js';

export type TrainerDashboardSection = {
  type: TrainerDashboardSectionType;
  position: TrainerDashboardSectionPosition;
  visible: boolean;
};

export type TrainerDashboard = {
  sections: TrainerDashboardSection[];
};
