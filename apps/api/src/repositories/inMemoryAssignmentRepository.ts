import { createAssignmentFromInput } from '../domain/createAssignment.js';
import { normalizeAchievementLevel } from '../domain/achievementLevel.js';
import {
  AssignmentNotFoundError,
  InvalidAssignmentStatusError,
} from '../domain/errors.js';
import { QUEST_STATUS } from '../domain/constants.js';
import type {
  Assignment,
  CreateAssignmentInput,
  UpdateAssignmentInput,
} from '../domain/assignmentTypes.js';
import type { QuestStatus } from '../domain/types.js';
import type { AssignmentRepository } from './assignmentRepository.js';
import { AssignmentMemory } from './assignmentMemory.js';

export class InMemoryAssignmentRepository implements AssignmentRepository {
  constructor(private readonly memory: AssignmentMemory) {}

  async findByTraineeId(traineeId: string): Promise<Assignment[]> {
    return this.memory.findByTraineeId(traineeId);
  }

  async findById(id: string): Promise<Assignment | null> {
    return this.memory.findById(id) ?? null;
  }

  async listByTrainer(trainerId: string): Promise<Assignment[]> {
    return this.memory.listByTrainer(trainerId);
  }

  async listPending(): Promise<Assignment[]> {
    return this.memory.listPending();
  }

  async create(
    input: CreateAssignmentInput,
    createdBy: string,
  ): Promise<Assignment> {
    const assignment = createAssignmentFromInput(input, createdBy);
    this.memory.save(assignment);
    return assignment;
  }

  async update(id: string, input: UpdateAssignmentInput): Promise<Assignment> {
    const current = this.memory.findById(id);

    if (!current) {
      throw new AssignmentNotFoundError(id);
    }

    const updated: Assignment = {
      ...current,
      majorItem: input.majorItem ?? current.majorItem,
      title: input.title ?? current.title,
      description: input.description ?? current.description,
      achievementLevel: input.achievementLevel
        ? normalizeAchievementLevel(input.achievementLevel)
        : current.achievementLevel,
      dueDate: input.dueDate === undefined ? current.dueDate : input.dueDate,
      updatedAt: new Date().toISOString(),
    };

    this.memory.save(updated);
    return updated;
  }

  async delete(id: string): Promise<void> {
    if (!this.memory.delete(id)) {
      throw new AssignmentNotFoundError(id);
    }
  }

  async updateStatus(id: string, status: QuestStatus): Promise<Assignment> {
    if (status === QUEST_STATUS.PENDING) {
      const current = this.memory.findById(id);

      if (!current) {
        throw new AssignmentNotFoundError(id);
      }

      if (current.status !== QUEST_STATUS.NOT_CLEARED) {
        throw new InvalidAssignmentStatusError(id, current.status, status);
      }
    }

    if (status === QUEST_STATUS.CLEARED) {
      const current = this.memory.findById(id);

      if (!current) {
        throw new AssignmentNotFoundError(id);
      }

      if (current.status !== QUEST_STATUS.PENDING) {
        throw new InvalidAssignmentStatusError(id, current.status, status);
      }
    }

    const updated = this.memory.updateStatus(id, status);

    if (!updated) {
      throw new AssignmentNotFoundError(id);
    }

    return updated;
  }
}
