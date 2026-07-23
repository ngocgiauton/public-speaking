"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import type { NavItem } from "@/config/nav";

export function MobileNavigation({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  const visibleItems = items.slice(0, 5);

  return (
    <nav
      aria-label="Điều hướng chính (di động)"
      className="fixed inset-x-0 bottom-0 z-30 flex border-t border-border bg-background lg:hidden"
    >
      {visibleItems.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-medium",
              isActive ? "text-brand-royal" : "text-muted-foreground",
            )}
          >
            <Icon className="h-5 w-5" aria-hidden="true" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
