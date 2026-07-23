import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";

export function StatCard({
  label,
  value,
  icon: Icon,
  accent = "royal",
  hint,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  accent?: "royal" | "gold" | "success" | "warning" | "error";
  hint?: string;
}) {
  const accentClass = {
    royal: "bg-brand-royal/10 text-brand-royal",
    gold: "bg-brand-gold/15 text-brand-gold",
    success: "bg-brand-success/10 text-brand-success",
    warning: "bg-brand-warning/10 text-brand-warning",
    error: "bg-brand-error/10 text-brand-error",
  }[accent];

  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <div className={cn("flex h-11 w-11 items-center justify-center rounded-full", accentClass)}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <p className="text-2xl font-semibold">{value}</p>
          <p className="text-sm text-muted-foreground">{label}</p>
          {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
        </div>
      </CardContent>
    </Card>
  );
}
