import { useEffect, useRef, useState } from 'react';
import {
  REPORT_LIST_DATE_FIELD_ID,
  REPORT_LIST_FILTER_CLEAR_BUTTON_LABEL,
  REPORT_LIST_FILTER_DEBOUNCE_MS,
  REPORT_LIST_FILTER_PERIOD_MODE_DATE,
  REPORT_LIST_FILTER_PERIOD_MODE_DATE_LABEL,
  REPORT_LIST_FILTER_PERIOD_MODE_LEGEND,
  REPORT_LIST_FILTER_PERIOD_MODE_RANGE,
  REPORT_LIST_FILTER_PERIOD_MODE_RANGE_LABEL,
  REPORT_LIST_FROM_FIELD_ID,
  REPORT_LIST_SEARCH_FIELD_ID,
  REPORT_LIST_TO_FIELD_ID,
  type OwnReportListQuery,
  type ReportListFilterPeriodMode,
} from '../domain/reportForm';

interface ReportListFilterProps {
  onApply: (query: OwnReportListQuery) => void;
  dateFieldLabel?: string;
  /** 週次一覧は日付/週キーの両方を受け付けるためテキスト入力にする */
  dateInputType?: 'date' | 'text';
}

const PERIOD_MODE_RADIO_GROUP_NAME = 'report-list-period-mode';

function toOptionalQueryValue(value: string): string | undefined {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

/**
 * 新卒向け報告書一覧の検索・期間絞り込みフォーム（BR-R12〜R15）。
 * 期間は「範囲指定（from/to）」と「特定日指定（date）」を排他ラジオで切り替え、
 * 入力値の変化を 300ms デバウンスして自動的に絞り込みを適用する（送信ボタンはない）。
 */
export function ReportListFilter({
  onApply,
  dateFieldLabel = '特定日',
  dateInputType = 'date',
}: ReportListFilterProps) {
  const [searchText, setSearchText] = useState('');
  const [periodMode, setPeriodMode] = useState<ReportListFilterPeriodMode>(
    REPORT_LIST_FILTER_PERIOD_MODE_RANGE,
  );
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState('');
  const isFirstRender = useRef(true);
  // 呼び出し側が毎回新しい関数を渡しても、デバウンスの再スケジュールが
  // 入力値以外の理由で発生しないよう ref で最新の onApply のみを追う。
  const onApplyRef = useRef(onApply);

  useEffect(() => {
    onApplyRef.current = onApply;
  }, [onApply]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const timer = setTimeout(() => {
      const q = toOptionalQueryValue(searchText);
      if (periodMode === REPORT_LIST_FILTER_PERIOD_MODE_DATE) {
        onApplyRef.current({ q, date: toOptionalQueryValue(date) });
      } else {
        onApplyRef.current({
          q,
          from: toOptionalQueryValue(from),
          to: toOptionalQueryValue(to),
        });
      }
    }, REPORT_LIST_FILTER_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [searchText, periodMode, from, to, date]);

  const handleClear = (): void => {
    setSearchText('');
    setPeriodMode(REPORT_LIST_FILTER_PERIOD_MODE_RANGE);
    setFrom('');
    setTo('');
    setDate('');
    onApply({});
  };

  const isRangeMode = periodMode === REPORT_LIST_FILTER_PERIOD_MODE_RANGE;

  return (
    <form
      className="report-list-filter"
      aria-label="報告書一覧の絞り込み"
      onSubmit={(event) => event.preventDefault()}
    >
      <div className="form-field">
        <label htmlFor={REPORT_LIST_SEARCH_FIELD_ID}>本文検索</label>
        <input
          id={REPORT_LIST_SEARCH_FIELD_ID}
          type="search"
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
        />
      </div>

      <fieldset className="report-list-filter__period-mode">
        <legend>{REPORT_LIST_FILTER_PERIOD_MODE_LEGEND}</legend>
        <label>
          <input
            type="radio"
            name={PERIOD_MODE_RADIO_GROUP_NAME}
            value={REPORT_LIST_FILTER_PERIOD_MODE_RANGE}
            checked={isRangeMode}
            onChange={() => setPeriodMode(REPORT_LIST_FILTER_PERIOD_MODE_RANGE)}
          />
          {REPORT_LIST_FILTER_PERIOD_MODE_RANGE_LABEL}
        </label>
        <label>
          <input
            type="radio"
            name={PERIOD_MODE_RADIO_GROUP_NAME}
            value={REPORT_LIST_FILTER_PERIOD_MODE_DATE}
            checked={!isRangeMode}
            onChange={() => setPeriodMode(REPORT_LIST_FILTER_PERIOD_MODE_DATE)}
          />
          {REPORT_LIST_FILTER_PERIOD_MODE_DATE_LABEL}
        </label>
      </fieldset>

      {isRangeMode ? (
        <>
          <div className="form-field">
            <label htmlFor={REPORT_LIST_FROM_FIELD_ID}>開始</label>
            <input
              id={REPORT_LIST_FROM_FIELD_ID}
              type="date"
              value={from}
              onChange={(event) => setFrom(event.target.value)}
            />
          </div>
          <div className="form-field">
            <label htmlFor={REPORT_LIST_TO_FIELD_ID}>終了</label>
            <input
              id={REPORT_LIST_TO_FIELD_ID}
              type="date"
              value={to}
              onChange={(event) => setTo(event.target.value)}
            />
          </div>
        </>
      ) : (
        <div className="form-field">
          <label htmlFor={REPORT_LIST_DATE_FIELD_ID}>{dateFieldLabel}</label>
          <input
            id={REPORT_LIST_DATE_FIELD_ID}
            type={dateInputType}
            value={date}
            onChange={(event) => setDate(event.target.value)}
          />
        </div>
      )}

      <button type="button" className="btn btn-secondary" onClick={handleClear}>
        {REPORT_LIST_FILTER_CLEAR_BUTTON_LABEL}
      </button>
    </form>
  );
}
