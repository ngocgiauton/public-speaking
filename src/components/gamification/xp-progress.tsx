import { Progress } from "@/components/ui/progress";
import { getNextRank, getRankForXp, getRankProgressPercent, getXpToNextRank } from "@/features/xp/xp";

export function XPProgress({ totalXp }: { totalXp: number }) {
  const rank = getRankForXp(totalXp);
  const next = getNextRank(totalXp);
  const percent = getRankProgressPercent(totalXp);
  const remaining = getXpToNextRank(totalXp);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between">
        <span className="font-heading text-sm font-semibold text-brand-navy">{rank.name}</span>
        <span className="text-xs text-muted-foreground">{totalXp} XP</span>
      </div>
      <Progress value={percent} barClassName="bg-brand-gold" label="Tiến độ rank" />
      {next ? (
        <p className="text-xs text-muted-foreground">
          Còn {remaining} XP để đạt <span className="font-medium text-foreground">{next.name}</span>
        </p>
      ) : (
        <p className="text-xs text-muted-foreground">Bạn đã đạt rank cao nhất!</p>
      )}
    </div>
  );
}
