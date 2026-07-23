"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}

/**
 * Dialog dựa trên phần tử <dialog> gốc của trình duyệt — tự động có focus
 * trap và đóng bằng phím Escape, đáp ứng yêu cầu accessibility cơ bản.
 */
export function Dialog({ open, onClose, title, description, children, className }: DialogProps) {
  const ref = React.useRef<HTMLDialogElement>(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onCancel={onClose}
      aria-labelledby="dialog-title"
      aria-describedby={description ? "dialog-description" : undefined}
      className={cn(
        "w-full max-w-md rounded-[var(--radius-card)] border border-border bg-background p-6 shadow-lg backdrop:bg-black/40",
        className,
      )}
    >
      <h2 id="dialog-title" className="font-heading text-lg font-semibold">
        {title}
      </h2>
      {description && (
        <p id="dialog-description" className="mt-1 text-sm text-muted-foreground">
          {description}
        </p>
      )}
      <div className="mt-4">{children}</div>
    </dialog>
  );
}
