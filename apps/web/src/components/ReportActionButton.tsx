interface ReportActionButtonProps {
  label: string;
  className: string;
  onAction: () => void | Promise<void>;
}

/** 報告書画面の操作ボタン（下書き保存・提出など） */
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
