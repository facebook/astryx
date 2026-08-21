import {cn} from '@/lib/utils';
import {
  STATUS_LABEL,
  TONE_CLASS,
  toneForStatus,
  type RunStatus,
} from '@/lib/status';

export function StatusBadge({
  status,
  className,
}: {
  status: RunStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex h-5 items-center rounded-md px-1.5 text-xs font-medium',
        TONE_CLASS[toneForStatus(status)],
        className,
      )}>
      {STATUS_LABEL[status]}
    </span>
  );
}
