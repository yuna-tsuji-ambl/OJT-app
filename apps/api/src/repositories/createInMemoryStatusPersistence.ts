import type { ChatMessageStore } from './chatMessageStore.js';
import type { TrainerStatusStore } from './trainerStatusStore.js';
import { InMemoryChatMessageStore } from './inMemoryChatMessageStore.js';
import { InMemoryTrainerStatusStore } from './inMemoryTrainerStatusStore.js';

export interface StatusPersistence {
  trainerStatusStore: TrainerStatusStore;
  chatMessageStore: ChatMessageStore;
}

export function createInMemoryStatusPersistence(): StatusPersistence {
  return {
    trainerStatusStore: new InMemoryTrainerStatusStore(),
    chatMessageStore: new InMemoryChatMessageStore(),
  };
}
