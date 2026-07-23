import { Crown } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { RankSlug } from "@/config/gamification";

const RANK_COLORS: Record<RankSlug, string> = {
  "beginner-speaker": "bg-slate-100 text-slate-700",
  "bronze-speaker": "bg-amber-100 text-amber-800",
  "silver-speaker": "bg-slate-200 text-slate-800",
  "gold-speaker": "bg-brand-gold/20 text-brand-gold",
  "platinum-speaker": "bg-cyan-100 text-cyan-800",
  "royal-speaker": "bg-brand-royal/15 text-brand-royal",
  "master-speaker": "bg-brand-navy text-white",
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
