import type { ReactNode } from 'react';

interface ConditionLineChartScrollRegionProps {
  viewportWidth: number;
  contentWidth: number;
  children: ReactNode;
}

export function ConditionLineChartScrollRegion({
  viewportWidth,
  contentWidth,
  children,
}: ConditionLineChartScrollRegionProps) {
  return (
    <div
      className="condition-line-chart__scroll-viewport"
      style={{ width: viewportWidth }}
    >
      <div
        className="condition-line-chart__scroll-content"
        style={{ width: contentWidth }}
      >
        {children}
      </div>
    </div>
  );
}
