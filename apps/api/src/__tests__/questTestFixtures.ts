import { expect, vi } from 'vitest';
import { QUEST_STATUS, type QuestStatus } from '@ojt-app/shared';
import type { CreateQuestInput } from '../domain/questTypes.js';
import type { Quest } from '../domain/types.js';
import type { QuestStore } from '../repositories/questStore.js';
import type { SheetRepository } from '../repositories/sheetRepository.js';

export const TRAINEE_USER_ID = 'trainee-1';
export const TRAINER_USER_ID = 'trainer-1';

export const CREATE_QUEST_INPUT: CreateQuestInput = {
  majorItem: '開発基礎',
  minorItem: '新規クエスト',
  achievementLevel: 'Lv1',
};

export const SHEET_QUEST_TYPESCRIPT: Quest = {
  id: 'quest-1',
  majorItem: '開発基礎',
  minorItem: 'TypeScript基礎',
  achievementLevel: 'Lv1',
};

export const SHEET_QUEST_REACT: Quest = {
  id: 'quest-2',
  majorItem: '開発基礎',
  minorItem: 'React入門',
  achievementLevel: 'Lv2',
};

export const TRAINER_CREATED_QUEST: Quest = {
  id: 'quest-new-1',
  majorItem: '開発基礎',
  minorItem: '新規クエスト',
  achievementLevel: 'Lv1',
  status: QUEST_STATUS.NOT_CLEARED,
};

export const PENDING_TRAINER_CREATED_QUEST: Quest = {
  ...TRAINER_CREATED_QUEST,
  status: QUEST_STATUS.PENDING,
};

export const CLEARED_TRAINER_CREATED_QUEST: Quest = {
  ...TRAINER_CREATED_QUEST,
  status: QUEST_STATUS.CLEARED,
};

export function createMockQuestStore(
  overrides: Partial<QuestStore> = {},
): QuestStore {
  return {
    getById: vi.fn(),
    update: vi.fn().mockResolvedValue(undefined),
    getPendingQuests: vi.fn().mockResolvedValue([]),
    create: vi.fn(),
    listAllQuests: vi.fn().mockResolvedValue([]),
    ...overrides,
  };
}

export function createMockSheetRepository(
  overrides: Partial<SheetRepository> = {},
): SheetRepository {
  return {
    loadQuests: vi.fn().mockResolvedValue([]),
    updateOnApproval: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

export function createTrainerProgressListStore(
  storeQuests: Quest[],
): QuestStore {
  return createMockQuestStore({
    listAllQuests: vi.fn().mockResolvedValue(storeQuests),
  });
}

export function createTraineeMergedListMocks(storeQuests: Quest[]): {
  questStore: QuestStore;
  sheetRepository: SheetRepository;
} {
  return {
    questStore: createTrainerProgressListStore(storeQuests),
    sheetRepository: createMockSheetRepository({
      loadQuests: vi.fn().mockResolvedValue([SHEET_QUEST_TYPESCRIPT]),
    }),
  };
}

export function expectListContainsQuest(
  quests: Quest[],
  expected: Partial<Quest> & Pick<Quest, 'id'>,
): void {
  expect(quests).toEqual(
    expect.arrayContaining([expect.objectContaining(expected)]),
  );
}

export function expectQuestClearRequestApplied(
  questStore: QuestStore,
  questId: string,
  result: Quest,
): void {
  expect(questStore.getById).toHaveBeenCalledWith(questId);
  expect(questStore.update).toHaveBeenCalledWith(
    expect.objectContaining({
      id: questId,
      status: QUEST_STATUS.PENDING,
    }),
  );
  expect(result.status).toBe(QUEST_STATUS.PENDING);
}

export function expectQuestApproved(
  questStore: QuestStore,
  questId: string,
  result: Quest,
  options?: { sheetRepository?: SheetRepository },
): void {
  expect(questStore.getById).toHaveBeenCalledWith(questId);
  expect(questStore.update).toHaveBeenCalledWith(
    expect.objectContaining({
      id: questId,
      status: QUEST_STATUS.CLEARED,
    }),
  );

  if (options?.sheetRepository) {
    expect(options.sheetRepository.updateOnApproval).toHaveBeenCalledWith(
      expect.objectContaining({
        id: questId,
        status: QUEST_STATUS.CLEARED,
      }),
    );
  }

  expect(result.status).toBe(QUEST_STATUS.CLEARED);
}

type GetQuestList = (
  userId: string,
  role: 'trainee',
  sheetRepository: SheetRepository,
  questStore: QuestStore,
) => Promise<Quest[]>;

type GetTrainerQuestProgressList = (
  userId: string,
  role: 'trainer',
  questStore: QuestStore,
) => Promise<Quest[]>;

export async function assertCreatedQuestOnTrainerDashboard(
  getTrainerQuestProgressList: GetTrainerQuestProgressList,
  trainerUserId: string,
  questStore: QuestStore,
  quest: Quest,
  status: QuestStatus,
): Promise<void> {
  const progressList = await getTrainerQuestProgressList(
    trainerUserId,
    'trainer',
    questStore,
  );

  expect(questStore.listAllQuests).toHaveBeenCalledOnce();
  expectListContainsQuest(progressList, {
    id: quest.id,
    status,
  });
}

export async function assertCreatedQuestOnTraineeList(
  getQuestList: GetQuestList,
  traineeUserId: string,
  sheetRepository: SheetRepository,
  questStore: QuestStore,
  quest: Quest,
  status: QuestStatus,
): Promise<void> {
  const quests = await getQuestList(
    traineeUserId,
    'trainee',
    sheetRepository,
    questStore,
  );

  expect(sheetRepository.loadQuests).toHaveBeenCalledWith(traineeUserId);
  expect(questStore.listAllQuests).toHaveBeenCalledOnce();
  expectListContainsQuest(quests, {
    id: quest.id,
    minorItem: quest.minorItem,
    status,
  });
}
