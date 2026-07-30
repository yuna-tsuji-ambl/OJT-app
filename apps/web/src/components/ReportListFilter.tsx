import { useState, type FormEvent } from 'react';
import {
  REPORT_LIST_DATE_FIELD_ID,
  REPORT_LIST_FILTER_BUTTON_LABEL,
  REPORT_LIST_FROM_FIELD_ID,
  REPORT_LIST_SEARCH_FIELD_ID,
  REPORT_LIST_TO_FIELD_ID,
  type OwnReportListQuery,
} from '../domain/reportForm';

interface ReportListFilterProps {
  onApply: (query: OwnReportListQuery) => void;
  dateFieldLabel?: string;
}

function toOptionalQueryValue(value: string): string | undefined {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

/** 新卒向け報告書一覧の検索・期間絞り込みフォーム（BR-R12〜R15） */
export function ReportListFilter({
  onApply,
  dateFieldLabel = '特定日',
}: ReportListFilterProps) {
  const [searchText, setSearchText] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onApply({
      q: toOptionalQueryValue(searchText),
      from: toOptionalQueryValue(from),
      to: toOptionalQueryValue(to),
      date: toOptionalQueryValue(date),
    });
  };

  return (
    <form aria-label="報告書一覧の絞り込み" onSubmit={handleSubmit}>
      <div>
        <label htmlFor={REPORT_LIST_SEARCH_FIELD_ID}>本文検索</label>
        <input
          id={REPORT_LIST_SEARCH_FIELD_ID}
          type="search"
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
        />
      </div>
      <div>
        <label htmlFor={REPORT_LIST_FROM_FIELD_ID}>開始</label>
        <input
          id={REPORT_LIST_FROM_FIELD_ID}
          type="text"
          value={from}
          onChange={(event) => setFrom(event.target.value)}
        />
      </div>
      <div>
        <label htmlFor={REPORT_LIST_TO_FIELD_ID}>終了</label>
        <input
          id={REPORT_LIST_TO_FIELD_ID}
          type="text"
          value={to}
          onChange={(event) => setTo(event.target.value)}
        />
      </div>
      <div>
        <label htmlFor={REPORT_LIST_DATE_FIELD_ID}>{dateFieldLabel}</label>
        <input
          id={REPORT_LIST_DATE_FIELD_ID}
          type="text"
          value={date}
          onChange={(event) => setDate(event.target.value)}
        />
      </div>
      <button type="submit">{REPORT_LIST_FILTER_BUTTON_LABEL}</button>
    </form>
  );
}
