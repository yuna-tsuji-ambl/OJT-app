import type { Assignment } from '../domain/assignmentTypes.js';
import { QUEST_STATUS } from '../domain/constants.js';
import type { QuestStatus } from '../domain/types.js';

export class AssignmentMemory {
  private readonly assignments = new Map<string, Assignment>();

  constructor(seed: Assignment[] = []) {
    for (const assignment of seed) {
      this.assignments.set(assignment.id, assignment);
    }
  }

  findById(id: string): Assignment | undefined {
    return this.assignments.get(id);
  }

  findAll(): Assignment[] {
    return [...this.assignments.values()];
  }

  findByTraineeId(traineeId: string): Assignment[] {
    return this.findAll().filter(
      (assignment) => assignment.traineeId === traineeId,
    );
  }

  listByTrainer(trainerId: string): Assignment[] {
    return this.findAll().filter(
      (assignment) => assignment.createdBy === trainerId,
    );
  }

  listPending(): Assignment[] {
    return this.findAll().filter(
      (assignment) => assignment.status === QUEST_STATUS.PENDING,
    );
  }

  save(assignment: Assignment): void {
    this.assignments.set(assignment.id, assignment);
  }

  delete(id: string): boolean {
    return this.assignments.delete(id);
  }

  updateStatus(id: string, status: QuestStatus): Assignment | undefined {
    const assignment = this.assignments.get(id);

    if (!assignment) {
      return undefined;
    }

    const updated: Assignment = {
      ...assignment,
      status,
      updatedAt: new Date().toISOString(),
    };
    this.assignments.set(id, updated);
    return updated;
  }
}
