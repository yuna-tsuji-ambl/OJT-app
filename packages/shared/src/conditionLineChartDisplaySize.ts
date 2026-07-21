export interface ConditionLineChartDisplaySize {
  width: number;
  height: number;
  plotWidth: number;
  plotHeight: number;
  paddingLeft: number;
  paddingRight: number;
  paddingTop: number;
  paddingBottom: number;
}

export const CONDITION_LINE_CHART_DISPLAY_PADDING = {
  paddingLeft: 24,
  paddingRight: 8,
  paddingTop: 8,
  paddingBottom: 20,
} as const;

export const CONDITION_LINE_CHART_DISPLAY_CANVAS = {
  width: 360,
  height: 200,
} as const;

/** 改善前（U-C10 以前）の折れ線グラフ描画サイズ — 回帰比較用 */
export const CONDITION_LINE_CHART_LEGACY_DISPLAY_CANVAS = {
  width: 240,
  height: 120,
} as const;

export function buildConditionLineChartDisplaySizeFromCanvas(
  canvas: { width: number; height: number },
  padding: typeof CONDITION_LINE_CHART_DISPLAY_PADDING,
): ConditionLineChartDisplaySize {
  return {
    width: canvas.width,
    height: canvas.height,
    paddingLeft: padding.paddingLeft,
    paddingRight: padding.paddingRight,
    paddingTop: padding.paddingTop,
    paddingBottom: padding.paddingBottom,
    plotWidth: canvas.width - padding.paddingLeft - padding.paddingRight,
    plotHeight: canvas.height - padding.paddingTop - padding.paddingBottom,
  };
}

/** U-C10: 縦軸・プロット・横軸を十分に表示できる大きめの描画領域 */
export const CONDITION_LINE_CHART_DISPLAY_SIZE =
  buildConditionLineChartDisplaySizeFromCanvas(
    CONDITION_LINE_CHART_DISPLAY_CANVAS,
    CONDITION_LINE_CHART_DISPLAY_PADDING,
  );

export const CONDITION_LINE_CHART_LEGACY_DISPLAY_SIZE =
  buildConditionLineChartDisplaySizeFromCanvas(
    CONDITION_LINE_CHART_LEGACY_DISPLAY_CANVAS,
    CONDITION_LINE_CHART_DISPLAY_PADDING,
  );

export function buildConditionLineChartDisplaySize(): ConditionLineChartDisplaySize {
  return { ...CONDITION_LINE_CHART_DISPLAY_SIZE };
}
