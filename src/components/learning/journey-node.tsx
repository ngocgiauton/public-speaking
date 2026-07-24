import Link from "next/link";
import { CheckCircle2, Lock, PlayCircle, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { LOCK_REASON_LABELS_VI, type LockReason } from "@/features/progress/unlock";
import type { JourneyLesson } from "@/lib/data/student";

const STATUS_STYLES: Record<JourneyLesson["displayStatus"], string> = {
  completed: "border-surface-variant bg-surface-container-lowest",
  in_progress: "border-tertiary bg-surface-container-lowest shadow-warm scale-[1.01]",
  available: "border-surface-variant bg-surface-container-lowest",
  needs_revision: "border-brand-warning bg-surface-container-lowest",
  locked: "border-surface-variant bg-surface-container-low opacity-70 grayscale",
};

const ICON_CIRCLE_STYLES: Record<JourneyLesson["displayStatus"], string> = {
  completed: "bg-primary-container text-on-primary-container",
  in_progress: "bg-tertiary text-on-tertiary animate-pulse",
  available: "bg-surface-container-highest text-on-surface-variant",
  needs_revision: "bg-error-container text-on-error-container",
  locked: "bg-surface-variant text-on-surface-variant",
};

export function JourneyNode({ item, readOnly = false }: { item: JourneyLesson; readOnly?: boolean }) {
  const { lesson, displayStatus, lockReasons } = item;
  const isLocked = displayStatus === "locked";

  const content = (
    <div
      className={cn(
        "flex items-center gap-4 rounded-[var(--radius-card)] border-2 p-4 transition-all",
        STATUS_STYLES[displayStatus],
      )}
    >
      <div
        className={cn(
          "flex h-12 w-12 shrink-0 items-center justify-center rounded-full font-heading text-sm font-bold",
          ICON_CIRCLE_STYLES[displayStatus],
        )}
      >
        {displayStatus === "completed" && <CheckCircle2 className="h-6 w-6" aria-hidden="true" />}
        {displayStatus === "in_progress" && <PlayCircle className="h-6 w-6" aria-hidden="true" />}
        {displayStatus === "needs_revision" && <RotateCcw className="h-6 w-6" aria-hidden="true" />}
        {displayStatus === "locked" && <Lock className="h-6 w-6" aria-hidden="true" />}
        {displayStatus === "available" && lesson.session_number}
      </div>
      <div className="flex-1">
        <p className="font-heading font-semibold text-on-surface">{lesson.title}</p>
        <p className="text-sm text-on-surface-variant">{lesson.short_description}</p>
        {isLocked && lockReasons.length > 0 && (
          <ul className="mt-1 flex flex-wrap gap-1.5">
            {lockReasons.map((reason: LockReason) => (
              <li key={reason} className="rounded-full bg-surface-variant px-2 py-0.5 text-xs text-on-surface-variant">
                {LOCK_REASON_LABELS_VI[reason]}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );

  if (isLocked || readOnly) {
    return (
      <div aria-disabled={isLocked} title={isLocked ? "Bài học chưa được mở khóa" : undefined}>
        {content}
      </div>
    );
  }

  return (
    <Link href={`/student/bai-hoc/${lesson.id}`} className="block transition-transform hover:scale-[1.01]">
      {content}
    </Link>
  );
}
