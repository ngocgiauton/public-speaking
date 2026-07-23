import {
  Award,
  BookOpen,
  Crown,
  Eye,
  Footprints,
  Hand,
  Mic,
  Move,
  Pause,
  Smile,
  Star,
  Trophy,
  Volume2,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

const ICONS: Record<string, LucideIcon> = {
  mic: Mic,
  eye: Eye,
  move: Move,
  smile: Smile,
  hand: Hand,
  "volume-2": Volume2,
  pause: Pause,
  "book-open": BookOpen,
  footprints: Footprints,
  star: Star,
  crown: Crown,
  trophy: Trophy,
  award: Award,
};

const RARITY_STYLES: Record<string, string> = {
  common: "border-slate-300 text-slate-600",
  rare: "border-brand-royal/40 text-brand-royal",
  epic: "border-purple-400 text-purple-600",
  legendary: "border-brand-gold text-brand-gold",
};

export function AchievementBadge({
  name,
  description,
  icon,
  rarity,
  awarded,
  className,
}: {
  name: string;
  description?: string;
  icon: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  awarded: boolean;
  className?: string;
}) {
  const Icon = ICONS[icon] ?? Award;

  return (
    <div
      className={cn(
        "flex flex-col items-center gap-2 rounded-[var(--radius-card)] border-2 p-4 text-center",
        awarded ? RARITY_STYLES[rarity] : "border-border text-muted-foreground opacity-60",
        className,
      )}
      title={description}
    >
      <div
        className={cn(
          "flex h-12 w-12 items-center justify-center rounded-full",
          awarded ? "bg-current/10" : "bg-muted",
        )}
      >
        <Icon className="h-6 w-6" aria-hidden="true" />
      </div>
      <p className="font-heading text-sm font-semibold">{name}</p>
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
      {!awarded && <span className="text-[10px] uppercase tracking-wide">Chưa đạt được</span>}
    </div>
  );
}
