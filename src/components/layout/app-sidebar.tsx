"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import type { NavItem } from "@/config/nav";
import { siteConfig } from "@/config/site";

export function AppSidebar({ items, roleLabel }: { items: NavItem[]; roleLabel: string }) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 border-r border-outline-variant bg-surface-container-low lg:flex lg:flex-col">
      <div className="flex h-16 items-center gap-2 border-b border-outline-variant px-5">
        <span className="font-heading text-base font-bold text-primary">{siteConfig.organization}</span>
      </div>
      <p className="px-5 pt-4 font-label-sm text-label-sm uppercase tracking-wide text-on-surface-variant">
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
                "flex items-center gap-3 rounded-[var(--radius-control)] px-3 py-2 font-label-md text-label-md transition-colors",
                isActive
                  ? "bg-primary-container font-bold text-on-primary-container"
                  : "text-on-surface-variant hover:bg-surface-container-highest",
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
