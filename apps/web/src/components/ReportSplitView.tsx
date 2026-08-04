import type { ReactNode } from 'react';
import { REPORT_SPLIT_VIEW_ARIA_LABEL } from '../domain/reportForm';

interface ReportSplitViewProps {
  readonly left: ReactNode;
  readonly right: ReactNode;
}

/** 新卒報告書ページの左入力／右一覧レイアウト（BR-R09） */
export function ReportSplitView({ left, right }: ReportSplitViewProps) {
  return (
    <div
      className="report-split-view"
      role="group"
      aria-label={REPORT_SPLIT_VIEW_ARIA_LABEL}
    >
      <div className="report-split-view__left">{left}</div>
      <div className="report-split-view__right">{right}</div>
    </div>
  );
}
