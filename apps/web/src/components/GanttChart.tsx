import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import {
  addDays,
  buildGanttAxisTicks,
  clampEndDate,
  clampStartDate,
  computeGanttRange,
  dayOffsetFromRangeStart,
  daysBetweenInclusive,
  shiftDateRange,
} from '../domain/ganttDateUtils';
import type { GoalResponse } from '../domain/goalForm';

export const GANTT_PIXELS_PER_DAY = 24;

type DragMode = 'move' | 'resize-start' | 'resize-end';

interface DragState {
  readonly goalId: string;
  readonly mode: DragMode;
  readonly originX: number;
  readonly startDate: string;
  readonly endDate: string;
  readonly pointerId: number;
}

interface GanttChartProps {
  readonly goals: readonly GoalResponse[];
  readonly onUpdateDates: (
    goalId: string,
    startDate: string,
    endDate: string,
  ) => Promise<void>;
}

function pixelsToDayDelta(deltaX: number): number {
  if (!Number.isFinite(deltaX)) {
    return 0;
  }
  return Math.round(deltaX / GANTT_PIXELS_PER_DAY);
}

function computeBarLayout(
  goal: { startDate: string; endDate: string },
  rangeStart: string,
): { left: number; width: number } {
  const left =
    dayOffsetFromRangeStart(rangeStart, goal.startDate) * GANTT_PIXELS_PER_DAY;
  const width =
    daysBetweenInclusive(goal.startDate, goal.endDate) * GANTT_PIXELS_PER_DAY;
  return { left, width };
}

function applyDragDelta(state: DragState, deltaX: number) {
  const dayDelta = pixelsToDayDelta(deltaX);

  if (state.mode === 'move') {
    return shiftDateRange(state.startDate, state.endDate, dayDelta);
  }

  if (state.mode === 'resize-start') {
    const nextStart = addDays(state.startDate, dayDelta);
    return clampStartDate(nextStart, state.endDate);
  }

  const nextEnd = addDays(state.endDate, dayDelta);
  return clampEndDate(state.startDate, nextEnd);
}

function trySetPointerCapture(target: HTMLElement, pointerId: number): void {
  if (typeof target.setPointerCapture !== 'function') {
    return;
  }
  try {
    target.setPointerCapture(pointerId);
  } catch {
    // jsdom など未対応環境では無視
  }
}

export function GanttChart({ goals, onUpdateDates }: GanttChartProps) {
  const [previewDates, setPreviewDates] = useState<
    Record<string, { startDate: string; endDate: string }>
  >({});
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<DragState | null>(null);
  const lastClientXRef = useRef(0);
  const onUpdateDatesRef = useRef(onUpdateDates);
  useEffect(() => {
    onUpdateDatesRef.current = onUpdateDates;
  }, [onUpdateDates]);

  const goalsForRange = goals.map((goal) =>
    previewDates[goal.id] ? { ...goal, ...previewDates[goal.id] } : goal,
  );
  const { rangeStart, totalDays } = computeGanttRange(goalsForRange);
  const chartWidth = totalDays * GANTT_PIXELS_PER_DAY;
  const axisTicks = buildGanttAxisTicks(rangeStart, totalDays);

  const resolveDates = useCallback(
    (goal: GoalResponse) => previewDates[goal.id] ?? goal,
    [previewDates],
  );

  const beginDrag = useCallback(
    (
      target: HTMLElement,
      clientX: number,
      pointerId: number,
      goal: GoalResponse,
      mode: DragMode,
    ) => {
      if (dragRef.current) {
        return;
      }

      trySetPointerCapture(target, pointerId);

      const dragState: DragState = {
        goalId: goal.id,
        mode,
        originX: clientX,
        startDate: goal.startDate,
        endDate: goal.endDate,
        pointerId,
      };
      dragRef.current = dragState;
      lastClientXRef.current = clientX;
      setIsDragging(true);

      const handleMove = (moveEvent: Event) => {
        if (!dragRef.current || dragRef.current.goalId !== dragState.goalId) {
          return;
        }
        if (!('clientX' in moveEvent)) {
          return;
        }
        const nextClientX = (moveEvent as MouseEvent).clientX;
        lastClientXRef.current = nextClientX;
        const nextDates = applyDragDelta(
          dragState,
          nextClientX - dragState.originX,
        );
        setPreviewDates((current) => ({
          ...current,
          [dragState.goalId]: nextDates,
        }));
      };

      const finishDrag = (upEvent?: Event) => {
        if (!dragRef.current || dragRef.current.goalId !== dragState.goalId) {
          return;
        }
        dragRef.current = null;
        setIsDragging(false);

        document.removeEventListener('pointermove', handleMove);
        document.removeEventListener('pointerup', finishDrag);
        document.removeEventListener('pointercancel', finishDrag);
        document.removeEventListener('mousemove', handleMove);
        document.removeEventListener('mouseup', finishDrag);

        if (upEvent && 'clientX' in upEvent) {
          lastClientXRef.current = (upEvent as MouseEvent).clientX;
        }

        const nextDates = applyDragDelta(
          dragState,
          lastClientXRef.current - dragState.originX,
        );
        setPreviewDates((current) => {
          const next = { ...current };
          delete next[dragState.goalId];
          return next;
        });

        if (
          nextDates.startDate !== dragState.startDate ||
          nextDates.endDate !== dragState.endDate
        ) {
          void onUpdateDatesRef.current(
            dragState.goalId,
            nextDates.startDate,
            nextDates.endDate,
          );
        }
      };

      document.addEventListener('pointermove', handleMove);
      document.addEventListener('pointerup', finishDrag);
      document.addEventListener('pointercancel', finishDrag);
      document.addEventListener('mousemove', handleMove);
      document.addEventListener('mouseup', finishDrag);
    },
    [],
  );

  const handlePointerDown = useCallback(
    (
      event: ReactPointerEvent<HTMLElement>,
      goal: GoalResponse,
      mode: DragMode,
    ) => {
      if (typeof event.button === 'number' && event.button !== 0) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      beginDrag(
        event.currentTarget,
        event.clientX,
        event.pointerId || 1,
        goal,
        mode,
      );
    },
    [beginDrag],
  );

  const handleMouseDown = useCallback(
    (
      event: ReactMouseEvent<HTMLElement>,
      goal: GoalResponse,
      mode: DragMode,
    ) => {
      if (dragRef.current) {
        return;
      }
      if (typeof event.button === 'number' && event.button !== 0) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      beginDrag(event.currentTarget, event.clientX, 1, goal, mode);
    },
    [beginDrag],
  );

  return (
    <div
      className={
        isDragging ? 'gantt-chart gantt-chart--dragging' : 'gantt-chart'
      }
      role="region"
      aria-label="目標ガントチャート（横軸: 日付・日単位）"
    >
      <div className="gantt-chart__timeline">
        <div className="gantt-chart__axis" aria-label="日付（日）">
          <div className="gantt-chart__axis-unit">日付（日）</div>
          <div
            className="gantt-chart__axis-track"
            style={{ width: chartWidth }}
            data-testid="gantt-axis-track"
          >
            {axisTicks.map((tick) => (
              <span
                key={tick.date}
                className="gantt-chart__axis-tick"
                style={{
                  left: tick.offsetDays * GANTT_PIXELS_PER_DAY,
                  width: GANTT_PIXELS_PER_DAY,
                }}
                title={tick.date}
              >
                {tick.label}
              </span>
            ))}
          </div>
        </div>
        {goals.map((goal) => {
          const dates = resolveDates(goal);
          const { left, width } = computeBarLayout(dates, rangeStart);
          const progressWidth = `${Math.min(100, Math.max(0, goal.progress))}%`;

          return (
            <div key={goal.id} className="gantt-chart__row">
              <div className="gantt-chart__label" title={goal.title}>
                {goal.title}
              </div>
              <div
                className="gantt-chart__track"
                style={{ width: chartWidth, minWidth: chartWidth }}
              >
                <div
                  className="gantt-chart__bar"
                  data-testid={`gantt-bar-${goal.id}`}
                  data-goal-title={goal.title}
                  data-start-date={dates.startDate}
                  data-end-date={dates.endDate}
                  style={{ left, width }}
                  title={goal.title}
                  aria-label={`${goal.title} ${goal.progress}%`}
                  onPointerDown={(event) => {
                    handlePointerDown(event, { ...goal, ...dates }, 'move');
                  }}
                  onMouseDown={(event) => {
                    handleMouseDown(event, { ...goal, ...dates }, 'move');
                  }}
                >
                  <span
                    className="gantt-chart__handle gantt-chart__handle--start"
                    data-testid={`gantt-handle-start-${goal.id}`}
                    aria-label={`${goal.title} 開始日を変更`}
                    onPointerDown={(event) => {
                      handlePointerDown(
                        event,
                        { ...goal, ...dates },
                        'resize-start',
                      );
                    }}
                    onMouseDown={(event) => {
                      handleMouseDown(
                        event,
                        { ...goal, ...dates },
                        'resize-start',
                      );
                    }}
                  />
                  <span
                    className="gantt-chart__progress"
                    style={{ width: progressWidth }}
                    aria-label={`進捗 ${goal.progress}%`}
                  />
                  <span className="gantt-chart__bar-label">
                    {goal.title} ({goal.progress}%)
                  </span>
                  <span
                    className="gantt-chart__handle gantt-chart__handle--end"
                    data-testid={`gantt-handle-end-${goal.id}`}
                    aria-label={`${goal.title} 終了日を変更`}
                    onPointerDown={(event) => {
                      handlePointerDown(
                        event,
                        { ...goal, ...dates },
                        'resize-end',
                      );
                    }}
                    onMouseDown={(event) => {
                      handleMouseDown(
                        event,
                        { ...goal, ...dates },
                        'resize-end',
                      );
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
