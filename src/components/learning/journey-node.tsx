import Link from "next/link";
import { CheckCircle2, Lock, PlayCircle, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { LOCK_REASON_LABELS_VI, type LockReason } from "@/features/progress/unlock";
import type { JourneyLesson } from "@/lib/data/student";

const STATUS_STYLES: Record<JourneyLesson["displayStatus"], string> = {
  completed: "border-brand-success bg-brand-success/5",
  in_progress: "border-brand-royal bg-brand-royal/5",
  available: "border-border bg-background",
  needs_revision: "border-brand-warning bg-brand-warning/5",
  locked: "border-border bg-muted opacity-80",
};

export function JourneyNode({ item, readOnly = false }: { item: JourneyLesson; readOnly?: boolean }) {
  const { lesson, displayStatus, lockReasons } = item;
  const isLocked = displayStatus === "locked";

  const content = (
    <div className={cn("flex items-center gap-4 rounded-[var(--radius-card)] border-2 p-4", STATUS_STYLES[displayStatus])}>
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-background text-sm font-bold shadow-sm">
        {lesson.session_number}
      </div>
      <div className="flex-1">
        <p className="font-heading font-semibold">{lesson.title}</p>
        <p className="text-sm text-muted-foreground">{lesson.short_description}</p>
        {isLocked && lockReasons.length > 0 && (
          <ul className="mt-1 flex flex-wrap gap-1.5">
            {lockReasons.map((reason: LockReason) => (
              <li key={reason} className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                {LOCK_REASON_LABELS_VI[reason]}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="shrink-0">
        {displayStatus === "completed" && <CheckCircle2 className="h-6 w-6 text-brand-success" />}
        {displayStatus === "in_progress" && <PlayCircle className="h-6 w-6 text-brand-royal" />}
        {displayStatus === "needs_revision" && <RotateCcw className="h-6 w-6 text-brand-warning" />}
        {displayStatus === "locked" && <Lock className="h-6 w-6 text-muted-foreground" />}
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
