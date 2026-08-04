interface ReportActionButtonProps {
  label: string;
  className: string;
  /** 戻り値は使用しない（一覧再読み込みの成否を返す submit 関数もそのまま渡せる） */
  onAction: () => void | Promise<unknown>;
}

/** 報告書画面の操作ボタン（提出など） */
export function ReportActionButton({
  label,
  className,
  onAction,
}: ReportActionButtonProps) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        void onAction();
      }}
    >
      {label}
    </button>
  );
}
