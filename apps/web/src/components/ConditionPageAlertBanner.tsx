import type { ConditionPageAlert } from '../api/conditionTypes';
import { CONDITION_PAGE_ALERT_BANNER_LABEL } from '../domain/conditionUiConstants';

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
    <div role="alert" aria-label={CONDITION_PAGE_ALERT_BANNER_LABEL}>
      <p>{alert.message}</p>
    </div>
  );
}
