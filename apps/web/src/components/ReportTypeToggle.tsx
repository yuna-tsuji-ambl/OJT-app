import {
  REPORT_TYPE_DAILY,
  REPORT_TYPE_TOGGLE_ARIA_LABEL,
  REPORT_TYPE_TOGGLE_DAILY_LABEL,
  REPORT_TYPE_TOGGLE_WEEKLY_LABEL,
  REPORT_TYPE_WEEKLY,
  type ReportFormType,
} from '../domain/reportForm';

interface ReportTypeToggleProps {
  readonly value: ReportFormType;
  readonly onChange: (value: ReportFormType) => void;
}

const TOGGLE_OPTIONS = [
  {
    value: REPORT_TYPE_DAILY,
    label: REPORT_TYPE_TOGGLE_DAILY_LABEL,
  },
  {
    value: REPORT_TYPE_WEEKLY,
    label: REPORT_TYPE_TOGGLE_WEEKLY_LABEL,
  },
] as const;

/** 新卒報告書ページの日次／週次切替（aria-pressed / BR-R07） */
export function ReportTypeToggle({ value, onChange }: ReportTypeToggleProps) {
  return (
    <div
      className="report-type-toggle"
      role="group"
      aria-label={REPORT_TYPE_TOGGLE_ARIA_LABEL}
    >
      {TOGGLE_OPTIONS.map((option) => {
        const isPressed = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            className={
              isPressed
                ? 'report-type-toggle__button report-type-toggle__button--active'
                : 'report-type-toggle__button'
            }
            aria-pressed={isPressed}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
