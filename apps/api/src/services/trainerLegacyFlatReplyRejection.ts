import { ensureTrainer } from '../domain/authorization.js';
import { LegacyQuickReplyNotSupportedError } from '../domain/errors.js';
import type { SendTrainerLegacyFlatReplyInput } from '../domain/messageTypes.js';
import type { UserContext } from '../domain/types.js';

export async function rejectTrainerLegacyFlatReply(
  _input: SendTrainerLegacyFlatReplyInput,
  context: UserContext,
): Promise<never> {
  ensureTrainer(context);
  throw new LegacyQuickReplyNotSupportedError();
}
