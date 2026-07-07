import type { ConditionPageAlert } from '../api/conditionApi';

interface ConditionPageAlertBannerProps {
  alert: ConditionPageAlert;
}

export function ConditionPageAlertBanner({
  alert,
}: ConditionPageAlertBannerProps) {
  if (!alert.hasAlert) {
    return null;
  }

  return (
    <div role="alert" aria-label="コンディションアラート">
      <p>{alert.message}</p>
    </div>
  );
}
