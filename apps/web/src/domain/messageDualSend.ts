/**
 * テンプレ＋自由記述の同時送信方針（BR-SV04 / BR-SV06）
 * - 両方あり → テンプレを先、自由記述を後（同一トーク）
 * - テンプレのみ、または自由記述が空白のみ → テンプレのみ
 * - 自由記述のみ → 自由記述のみ
 */
export type DualSendParts = {
  templateId: string | null;
  freeText: string | null;
};

export type DualSendSequenceResult<TTemplate, TFreeText> = {
  templateResult: TTemplate | undefined;
  freeTextResult: TFreeText | undefined;
};

export function resolveDualSendParts(
  selectedTemplateId: string,
  freeTextContent: string,
): DualSendParts {
  const templateId = selectedTemplateId || null;
  const trimmed = freeTextContent.trim();
  const freeText = trimmed.length > 0 ? trimmed : null;

  return { templateId, freeText };
}

export function hasDualSendPayload(parts: DualSendParts): boolean {
  return parts.templateId !== null || parts.freeText !== null;
}

export function formatMessageSendError(
  error: unknown,
  fallback: string,
): string {
  return error instanceof Error ? error.message : fallback;
}

/**
 * テンプレ → 自由記述の順で送信する。各コールバックは該当パーツがあるときだけ呼ばれる。
 */
export async function runDualSendSequence<TTemplate, TFreeText>(
  parts: DualSendParts,
  sendTemplate: (templateId: string) => Promise<TTemplate>,
  sendFreeText: (freeText: string) => Promise<TFreeText>,
): Promise<DualSendSequenceResult<TTemplate, TFreeText>> {
  let templateResult: TTemplate | undefined;
  let freeTextResult: TFreeText | undefined;

  if (parts.templateId) {
    templateResult = await sendTemplate(parts.templateId);
  }

  if (parts.freeText) {
    freeTextResult = await sendFreeText(parts.freeText);
  }

  return { templateResult, freeTextResult };
}
