import { cn } from "@/lib/utils/cn";

export function Progress({
  value,
  className,
  barClassName,
  label,
}: {
  value: number;
  className?: string;
  barClassName?: string;
  label?: string;
}) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div
      className={cn("h-3 w-full overflow-hidden rounded-full bg-surface-container-high", className)}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <div
        className={cn(
          "h-full rounded-full bg-gradient-to-r from-tertiary to-primary-container transition-all",
          barClassName,
        )}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
