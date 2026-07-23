"use client";

import { useState, useTransition } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/utils/format";
import type { NotificationRow } from "@/types/database";

export function NotificationMenu({
  notifications,
  onMarkRead,
}: {
  notifications: NotificationRow[];
  onMarkRead: (id: string) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        aria-label={`Thông báo${unreadCount > 0 ? ` (${unreadCount} chưa đọc)` : ""}`}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand-error text-[10px] text-white">
            {unreadCount}
          </span>
        )}
      </Button>
      {open && (
        <div className="absolute right-0 z-20 mt-2 w-80 rounded-[var(--radius-card)] border border-border bg-background p-2 shadow-lg">
          <p className="px-2 py-1 text-sm font-semibold">Thông báo</p>
          {notifications.length === 0 ? (
            <p className="p-3 text-sm text-muted-foreground">Chưa có thông báo nào.</p>
          ) : (
            <ul className="max-h-80 overflow-y-auto">
              {notifications.map((n) => (
                <li key={n.id}>
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => startTransition(() => onMarkRead(n.id))}
                    className="flex w-full flex-col items-start gap-1 rounded-[var(--radius-control)] p-2 text-left text-sm hover:bg-muted"
                  >
                    <span className="flex w-full items-center justify-between gap-2">
                      <span className="font-medium">{n.title}</span>
                      {!n.is_read && <Badge variant="royal">Mới</Badge>}
                    </span>
                    {n.body && <span className="text-xs text-muted-foreground">{n.body}</span>}
                    <span className="text-[11px] text-muted-foreground">{formatDateTime(n.created_at)}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
