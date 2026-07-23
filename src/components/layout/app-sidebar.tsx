"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import type { NavItem } from "@/config/nav";
import { siteConfig } from "@/config/site";

export function AppSidebar({ items, roleLabel }: { items: NavItem[]; roleLabel: string }) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 border-r border-border bg-background lg:flex lg:flex-col">
      <div className="flex h-16 items-center gap-2 border-b border-border px-5">
        <span className="font-heading text-base font-bold text-brand-royal">{siteConfig.organization}</span>
      </div>
      <p className="px-5 pt-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Khu vực {roleLabel}
      </p>
      <nav className="flex flex-1 flex-col gap-1 p-3" aria-label="Điều hướng chính">
        {items.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-[var(--radius-control)] px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-brand-royal/10 text-brand-royal"
                  : "text-foreground/80 hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
