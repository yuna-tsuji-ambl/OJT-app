import type {
  Assignment,
  CreateAssignmentInput,
  UpdateAssignmentInput,
} from '../domain/assignmentTypes.js';
import type { QuestStatus } from '../domain/types.js';

export interface AssignmentRepository {
  findByTraineeId(traineeId: string): Promise<Assignment[]>;
  findById(id: string): Promise<Assignment | null>;
  listByTrainer(trainerId: string): Promise<Assignment[]>;
  listPending(): Promise<Assignment[]>;
  create(input: CreateAssignmentInput, createdBy: string): Promise<Assignment>;
  update(id: string, input: UpdateAssignmentInput): Promise<Assignment>;
  delete(id: string): Promise<void>;
  updateStatus(id: string, status: QuestStatus): Promise<Assignment>;
}
