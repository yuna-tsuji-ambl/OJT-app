import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QUEST_STATUS } from '@ojt-app/shared';
import {
  approveQuest,
  createQuest,
  getQuestList,
  getPendingQuestList,
  getTrainerDashboard,
  getTrainerQuestProgressList,
  requestClearQuest,
  TRAINER_DASHBOARD_SECTION_TYPE,
  type AssignmentRepository,
  type Quest,
  type TrainerDashboard,
} from '../quest.js';
import { findTrainerDashboardSection } from '../domain/trainerDashboard.js';
import { createAssignmentInputFromQuestInput } from '../domain/assignmentQuestMapping.js';
import {
  CREATE_QUEST_INPUT,
  CREATE_QUEST_DROPDOWN_INPUT_LEVEL_3,
  EXPECTED_ACHIEVEMENT_LEVEL_LV3,
  SHEET_QUEST_REACT,
  SHEET_QUEST_TYPESCRIPT,
  TRAINEE_USER_ID,
  TRAINER_CREATED_QUEST,
  TRAINER_USER_ID,
  CLEARED_TRAINER_CREATED_QUEST,
  PENDING_TRAINER_CREATED_QUEST,
  createCapturingAssignmentRepository,
  createMockAssignmentRepository,
  createTraineeAssignmentMocks,
  createTrainerProgressListRepository,
  assertCreatedQuestOnTrainerDashboard,
  assertCreatedQuestOnTraineeList,
  expectListContainsQuest,
  expectQuestApproved,
  expectQuestClearRequestApplied,
  questToAssignment,
} from './questTestFixtures.js';

describe('U-Q01 クエスト一覧の表示', () => {
  const traineeUserId = TRAINEE_USER_ID;
  const traineeAssignments = [
    questToAssignment(SHEET_QUEST_TYPESCRIPT),
    questToAssignment(SHEET_QUEST_REACT),
  ];

  let assignmentRepository: AssignmentRepository;

  beforeEach(() => {
    assignmentRepository = createMockAssignmentRepository({
      findByTraineeId: vi.fn().mockResolvedValue(traineeAssignments),
    });
  });

  it('getQuestList_新卒ログイン中_課題情報が一覧で返る', async () => {
    const quests = await getQuestList(
      traineeUserId,
      'trainee',
      assignmentRepository,
    );

    expect(assignmentRepository.findByTraineeId).toHaveBeenCalledWith(
      traineeUserId,
    );
    expect(quests).toHaveLength(2);
    expect(quests[0]).toEqual(
      expect.objectContaining({
        majorItem: '開発基礎',
        minorItem: 'TypeScript基礎',
        achievementLevel: 'Lv1',
      }),
    );
    expect(quests[1]).toEqual(
      expect.objectContaining({
        majorItem: '開発基礎',
        minorItem: 'React入門',
        achievementLevel: 'Lv2',
      }),
    );
  });
});

describe('U-Q02 クエストのクリア申請', () => {
  const traineeUserId = TRAINEE_USER_ID;
  const unclearedQuest: Quest = {
    ...SHEET_QUEST_TYPESCRIPT,
    status: QUEST_STATUS.NOT_CLEARED,
  };

  let assignmentRepository: AssignmentRepository;

  beforeEach(() => {
    assignmentRepository = createMockAssignmentRepository({
      findById: vi.fn().mockResolvedValue(questToAssignment(unclearedQuest)),
      updateStatus: vi
        .fn()
        .mockResolvedValue(
          questToAssignment({
            ...unclearedQuest,
            status: QUEST_STATUS.PENDING,
          }),
        ),
    });
  });

  it('requestClearQuest_新卒未クリアクエスト_ステータスが申請中に変更される', async () => {
    const result = await requestClearQuest(
      unclearedQuest.id,
      traineeUserId,
      'trainee',
      assignmentRepository,
    );

    expectQuestClearRequestApplied(
      assignmentRepository,
      unclearedQuest.id,
      result,
    );
  });
});

describe('U-Q03 申請一覧の表示', () => {
  const trainerUserId = TRAINER_USER_ID;

  const pendingQuests: Quest[] = [
    { ...SHEET_QUEST_TYPESCRIPT, status: QUEST_STATUS.PENDING },
    { ...SHEET_QUEST_REACT, status: QUEST_STATUS.PENDING },
  ];

  let assignmentRepository: AssignmentRepository;

  beforeEach(() => {
    assignmentRepository = createMockAssignmentRepository({
      listPending: vi
        .fn()
        .mockResolvedValue(
          pendingQuests.map((quest) => questToAssignment(quest)),
        ),
    });
  });

  it('getPendingQuestList_トレーナーログイン中_申請中クエスト一覧が返る', async () => {
    const quests = await getPendingQuestList(
      trainerUserId,
      'trainer',
      assignmentRepository,
    );

    expect(assignmentRepository.listPending).toHaveBeenCalledOnce();
    expect(quests).toHaveLength(2);
    expect(quests.every((quest) => quest.status === QUEST_STATUS.PENDING)).toBe(
      true,
    );
  });
});

describe('U-Q04 クエストの承認', () => {
  const trainerUserId = TRAINER_USER_ID;
  const pendingQuest: Quest = {
    ...SHEET_QUEST_TYPESCRIPT,
    status: QUEST_STATUS.PENDING,
  };

  let assignmentRepository: AssignmentRepository;

  beforeEach(() => {
    assignmentRepository = createMockAssignmentRepository({
      updateStatus: vi
        .fn()
        .mockResolvedValue(
          questToAssignment({ ...pendingQuest, status: QUEST_STATUS.CLEARED }),
        ),
    });
  });

  it('approveQuest_トレーナー申請中クエスト_ステータスがクリアに変更される', async () => {
    const result = await approveQuest(
      pendingQuest.id,
      trainerUserId,
      'trainer',
      assignmentRepository,
    );

    expectQuestApproved(assignmentRepository, pendingQuest.id, result);
  });
});

describe('U-Q05 ダッシュボードのクエスト作成機能表示', () => {
  const trainerUserId = TRAINER_USER_ID;

  it('getTrainerDashboard_トレーナーログイン中_画面上部にクエスト作成機能が含まれる', () => {
    const dashboard: TrainerDashboard = getTrainerDashboard(
      trainerUserId,
      'trainer',
    );

    const questCreateSection = findTrainerDashboardSection(
      dashboard,
      TRAINER_DASHBOARD_SECTION_TYPE.QUEST_CREATE,
    );

    expect(questCreateSection).toBeDefined();
    expect(questCreateSection?.visible).toBe(true);
    expect(questCreateSection?.position).toBe('top');
    expect(dashboard.sections[0]).toEqual(questCreateSection);
  });
});

describe('U-Q06 クエスト作成（トレーナー側）', () => {
  const trainerUserId = TRAINER_USER_ID;
  const createdQuest = TRAINER_CREATED_QUEST;

  let assignmentRepository: AssignmentRepository;

  beforeEach(() => {
    assignmentRepository = createMockAssignmentRepository({
      create: vi.fn().mockResolvedValue(questToAssignment(createdQuest)),
      listByTrainer: vi
        .fn()
        .mockResolvedValue([questToAssignment(createdQuest)]),
    });
  });

  it('createQuest後getTrainerQuestProgressList_トレーナー_作成クエストの進捗状況が確認できる', async () => {
    const created = await createQuest(
      trainerUserId,
      'trainer',
      CREATE_QUEST_INPUT,
      assignmentRepository,
    );

    const progressList = await getTrainerQuestProgressList(
      trainerUserId,
      'trainer',
      assignmentRepository,
    );

    expect(assignmentRepository.create).toHaveBeenCalledWith(
      createAssignmentInputFromQuestInput(CREATE_QUEST_INPUT),
      trainerUserId,
    );
    expect(created).toEqual(expect.objectContaining(TRAINER_CREATED_QUEST));
    expect(progressList).toHaveLength(1);
    expect(progressList[0]).toEqual(
      expect.objectContaining({
        id: created.id,
        minorItem: TRAINER_CREATED_QUEST.minorItem,
        status: QUEST_STATUS.NOT_CLEARED,
      }),
    );
  });
});

describe('U-Q07 作成クエストの新卒側表示', () => {
  const traineeUserId = TRAINEE_USER_ID;

  let assignmentRepository: AssignmentRepository;

  beforeEach(() => {
    ({ assignmentRepository } = createTraineeAssignmentMocks([
      TRAINER_CREATED_QUEST,
    ]));
  });

  it('getQuestList_新卒ログイン中_トレーナー作成クエストが一覧に含まれる', async () => {
    const quests = await getQuestList(
      traineeUserId,
      'trainee',
      assignmentRepository,
    );

    expect(assignmentRepository.findByTraineeId).toHaveBeenCalledWith(
      traineeUserId,
    );
    expect(quests).toHaveLength(2);
    expect(quests).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          minorItem: 'TypeScript基礎',
          achievementLevel: 'Lv1',
        }),
        expect.objectContaining({
          id: TRAINER_CREATED_QUEST.id,
          minorItem: TRAINER_CREATED_QUEST.minorItem,
          achievementLevel: TRAINER_CREATED_QUEST.achievementLevel,
          status: QUEST_STATUS.NOT_CLEARED,
        }),
      ]),
    );
  });
});

describe('U-Q08 作成クエストのトレーナー側一覧表示', () => {
  const trainerUserId = TRAINER_USER_ID;

  let assignmentRepository: AssignmentRepository;

  beforeEach(() => {
    assignmentRepository = createTrainerProgressListRepository([
      TRAINER_CREATED_QUEST,
    ]);
  });

  it('getTrainerQuestProgressList_トレーナーログイン中_作成クエストが一覧に表示される', async () => {
    const progressList = await getTrainerQuestProgressList(
      trainerUserId,
      'trainer',
      assignmentRepository,
    );

    expect(assignmentRepository.listByTrainer).toHaveBeenCalledOnce();
    expect(progressList).toHaveLength(1);
    expect(progressList[0]).toEqual(
      expect.objectContaining(TRAINER_CREATED_QUEST),
    );
  });
});

describe('U-Q09 作成クエストのクリア申請（新卒側）', () => {
  const traineeUserId = TRAINEE_USER_ID;
  const questId = TRAINER_CREATED_QUEST.id;

  let assignmentRepository: AssignmentRepository;

  beforeEach(() => {
    assignmentRepository = createMockAssignmentRepository({
      findById: vi
        .fn()
        .mockResolvedValue(questToAssignment(TRAINER_CREATED_QUEST)),
      updateStatus: vi
        .fn()
        .mockResolvedValue(
          questToAssignment({
            ...TRAINER_CREATED_QUEST,
            status: QUEST_STATUS.PENDING,
          }),
        ),
    });
  });

  it('requestClearQuest_新卒未クリアの作成クエスト_ステータスが申請中に変更される', async () => {
    const result = await requestClearQuest(
      questId,
      traineeUserId,
      'trainee',
      assignmentRepository,
    );

    expectQuestClearRequestApplied(assignmentRepository, questId, result);
    expect(result.minorItem).toBe(TRAINER_CREATED_QUEST.minorItem);
  });
});

describe('U-Q10 作成クエストの申請状況表示（トレーナー側）', () => {
  const trainerUserId = TRAINER_USER_ID;

  let assignmentRepository: AssignmentRepository;

  beforeEach(() => {
    assignmentRepository = createTrainerProgressListRepository([
      PENDING_TRAINER_CREATED_QUEST,
    ]);
  });

  it('getTrainerQuestProgressList_トレーナーログイン中_申請中の作成クエストと申請状況が確認できる', async () => {
    const progressList = await getTrainerQuestProgressList(
      trainerUserId,
      'trainer',
      assignmentRepository,
    );

    expect(assignmentRepository.listByTrainer).toHaveBeenCalledOnce();
    expect(progressList).toHaveLength(1);
    expectListContainsQuest(progressList, {
      id: PENDING_TRAINER_CREATED_QUEST.id,
      minorItem: PENDING_TRAINER_CREATED_QUEST.minorItem,
      status: QUEST_STATUS.PENDING,
    });
  });
});

describe('U-Q11 作成クエストの承認（トレーナー側）', () => {
  const trainerUserId = TRAINER_USER_ID;
  const questId = PENDING_TRAINER_CREATED_QUEST.id;

  let assignmentRepository: AssignmentRepository;

  beforeEach(() => {
    assignmentRepository = createMockAssignmentRepository({
      updateStatus: vi
        .fn()
        .mockResolvedValue(
          questToAssignment({
            ...PENDING_TRAINER_CREATED_QUEST,
            status: QUEST_STATUS.CLEARED,
          }),
        ),
    });
  });

  it('approveQuest_トレーナー申請中の作成クエスト_ステータスがクリアに変更される', async () => {
    const result = await approveQuest(
      questId,
      trainerUserId,
      'trainer',
      assignmentRepository,
    );

    expectQuestApproved(assignmentRepository, questId, result);
    expect(result.minorItem).toBe(PENDING_TRAINER_CREATED_QUEST.minorItem);
  });
});

describe('U-Q12 申請済み作成クエストの一覧表示', () => {
  const traineeUserId = TRAINEE_USER_ID;
  const trainerUserId = TRAINER_USER_ID;

  let assignmentRepository: AssignmentRepository;

  beforeEach(() => {
    ({ assignmentRepository } = createTraineeAssignmentMocks([
      PENDING_TRAINER_CREATED_QUEST,
    ]));
  });

  it('getTrainerQuestProgressList_トレーナーダッシュボード_申請済み作成クエストが申請中で表示される', async () => {
    await assertCreatedQuestOnTrainerDashboard(
      getTrainerQuestProgressList,
      trainerUserId,
      assignmentRepository,
      PENDING_TRAINER_CREATED_QUEST,
      QUEST_STATUS.PENDING,
    );
  });

  it('getQuestList_新卒クエスト一覧_申請済み作成クエストが申請中で表示される', async () => {
    await assertCreatedQuestOnTraineeList(
      getQuestList,
      traineeUserId,
      assignmentRepository,
      PENDING_TRAINER_CREATED_QUEST,
      QUEST_STATUS.PENDING,
    );
  });
});

describe('U-Q13 承認済み作成クエストの一覧表示', () => {
  const traineeUserId = TRAINEE_USER_ID;
  const trainerUserId = TRAINER_USER_ID;

  let assignmentRepository: AssignmentRepository;

  beforeEach(() => {
    ({ assignmentRepository } = createTraineeAssignmentMocks([
      CLEARED_TRAINER_CREATED_QUEST,
    ]));
  });

  it('getTrainerQuestProgressList_トレーナーダッシュボード_承認済み作成クエストがクリアで表示される', async () => {
    await assertCreatedQuestOnTrainerDashboard(
      getTrainerQuestProgressList,
      trainerUserId,
      assignmentRepository,
      CLEARED_TRAINER_CREATED_QUEST,
      QUEST_STATUS.CLEARED,
    );
  });

  it('getQuestList_新卒クエスト一覧_承認済み作成クエストがクリアで表示される', async () => {
    await assertCreatedQuestOnTraineeList(
      getQuestList,
      traineeUserId,
      assignmentRepository,
      CLEARED_TRAINER_CREATED_QUEST,
      QUEST_STATUS.CLEARED,
    );
  });
});

describe('U-Q14 到達レベルのドロップダウン選択値の保存', () => {
  const trainerUserId = TRAINER_USER_ID;

  let assignmentRepository: AssignmentRepository;

  beforeEach(() => {
    ({ assignmentRepository } = createCapturingAssignmentRepository());
  });

  it('createQuest_到達レベル数値3選択_achievementLevelがLv3として保存取得される', async () => {
    const created = await createQuest(
      trainerUserId,
      'trainer',
      CREATE_QUEST_DROPDOWN_INPUT_LEVEL_3,
      assignmentRepository,
    );

    const progressList = await getTrainerQuestProgressList(
      trainerUserId,
      'trainer',
      assignmentRepository,
    );

    expect(assignmentRepository.create).toHaveBeenCalledWith(
      createAssignmentInputFromQuestInput(CREATE_QUEST_DROPDOWN_INPUT_LEVEL_3),
      trainerUserId,
    );
    expect(created.achievementLevel).toBe(EXPECTED_ACHIEVEMENT_LEVEL_LV3);
    expect(progressList).toHaveLength(1);
    expect(progressList[0]?.achievementLevel).toBe(
      EXPECTED_ACHIEVEMENT_LEVEL_LV3,
    );
  });
});

describe('U-Q15 トレーナー進捗一覧のタイトル取得', () => {
  const trainerUserId = TRAINER_USER_ID;

  let assignmentRepository: AssignmentRepository;

  beforeEach(() => {
    assignmentRepository = createTrainerProgressListRepository([
      TRAINER_CREATED_QUEST,
    ]);
  });

  it('getTrainerQuestProgressList_トレーナーログイン中_各クエストのタイトルmajorItemがレスポンスに含まれる', async () => {
    await assertCreatedQuestOnTrainerDashboard(
      getTrainerQuestProgressList,
      trainerUserId,
      assignmentRepository,
      TRAINER_CREATED_QUEST,
      QUEST_STATUS.NOT_CLEARED,
    );
  });
});

describe('U-Q16 新卒一覧の表示項目取得', () => {
  const traineeUserId = TRAINEE_USER_ID;

  let assignmentRepository: AssignmentRepository;

  beforeEach(() => {
    ({ assignmentRepository } = createTraineeAssignmentMocks([
      TRAINER_CREATED_QUEST,
    ]));
  });

  it('getQuestList_新卒ログイン中_タイトルコメント到達レベルがレスポンスに含まれる', async () => {
    await assertCreatedQuestOnTraineeList(
      getQuestList,
      traineeUserId,
      assignmentRepository,
      TRAINER_CREATED_QUEST,
      QUEST_STATUS.NOT_CLEARED,
    );
  });
});
