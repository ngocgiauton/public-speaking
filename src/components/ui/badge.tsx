import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
  {
    variants: {
      variant: {
        neutral: "bg-muted text-foreground",
        royal: "bg-brand-royal/10 text-brand-royal",
        gold: "bg-brand-gold/15 text-brand-gold",
        success: "bg-brand-success/10 text-brand-success",
        warning: "bg-brand-warning/10 text-brand-warning",
        error: "bg-brand-error/10 text-brand-error",
      },
    },
    defaultVariants: { variant: "neutral" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
