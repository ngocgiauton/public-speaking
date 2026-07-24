import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-label-md text-label-md font-bold transition-all disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tertiary",
  {
    variants: {
      variant: {
        primary: "rounded-full bg-primary-container text-on-primary-container shadow-warm hover:scale-105",
        secondary: "rounded-full bg-inverse-surface text-inverse-on-surface hover:scale-105",
        gold: "rounded-full bg-primary-container text-on-primary-container shadow-warm hover:scale-105",
        outline: "rounded-full border-2 border-outline text-primary hover:bg-surface-container-low",
        ghost: "rounded-[var(--radius-control)] text-primary hover:bg-surface-container-low",
        destructive: "rounded-full bg-error text-on-error hover:scale-105",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-9 px-4 text-xs",
        md: "min-h-[48px] px-6 py-2",
        lg: "min-h-[48px] px-8 py-3 text-base",
        icon: "h-10 w-10 rounded-full",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Khi true, gộp style vào phần tử con duy nhất (thường là <Link>) thay vì render <button>. */
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild, ...props }, ref) => {
    if (asChild && React.isValidElement(props.children)) {
      const child = React.Children.only(props.children) as React.ReactElement<{ className?: string }>;
      return React.cloneElement(child, {
        className: cn(buttonVariants({ variant, size }), child.props.className, className),
      });
    }

    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";
