import { ensureTrainer } from '../domain/authorization.js';
import { buildTrainerDashboard } from '../domain/trainerDashboard.js';
import type { TrainerDashboard } from '../domain/trainerDashboardTypes.js';
import type { UserContext } from '../domain/types.js';

export class TrainerDashboardService {
  getDashboard(context: UserContext): TrainerDashboard {
    ensureTrainer(context);
    return buildTrainerDashboard();
  }
}
