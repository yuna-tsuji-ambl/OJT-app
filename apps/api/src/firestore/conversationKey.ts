export function buildConversationKey(
  participantA: string,
  participantB: string,
): string {
  return [participantA, participantB].sort().join('__');
}
