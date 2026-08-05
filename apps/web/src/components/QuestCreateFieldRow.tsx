import type { ReactNode } from 'react';

interface QuestCreateFieldRowProps {
  label: string;
  inputId: string;
  children: ReactNode;
}

export function QuestCreateFieldRow({
  label,
  inputId,
  children,
}: QuestCreateFieldRowProps) {
  return (
    <div className="slider-row">
      <label htmlFor={inputId}>{label}</label>
      {children}
    </div>
  );
}
