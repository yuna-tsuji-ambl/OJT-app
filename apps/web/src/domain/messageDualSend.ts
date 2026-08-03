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
