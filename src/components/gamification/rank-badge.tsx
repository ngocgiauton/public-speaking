import { Crown } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { RankSlug } from "@/config/gamification";

const RANK_COLORS: Record<RankSlug, string> = {
  "beginner-speaker": "bg-surface-container-highest text-on-surface-variant",
  "bronze-speaker": "bg-tertiary-fixed text-on-tertiary-fixed",
  "silver-speaker": "bg-surface-variant text-on-surface-variant",
  "gold-speaker": "bg-primary-fixed text-on-primary-fixed",
  "platinum-speaker": "bg-secondary-fixed text-on-secondary-fixed-variant",
  "royal-speaker": "bg-primary text-on-primary",
  "master-speaker": "bg-inverse-surface text-inverse-on-surface",
};

export function RankBadge({
  rankSlug,
  rankName,
  className,
}: {
  rankSlug: RankSlug;
  rankName: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold",
        RANK_COLORS[rankSlug],
        className,
      )}
    >
      <Crown className="h-4 w-4" aria-hidden="true" />
      {rankName}
    </span>
  );
}
