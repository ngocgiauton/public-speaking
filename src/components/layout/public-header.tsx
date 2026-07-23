"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { publicNav, siteConfig } from "@/config/site";

export function PublicHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="font-heading text-lg font-bold text-brand-royal">
          {siteConfig.organization}
        </Link>

        <nav aria-label="Điều hướng chính" className="hidden items-center gap-6 md:flex">
          {publicNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={pathname === item.href ? "page" : undefined}
              className={cn(
                "text-sm font-medium text-foreground/80 hover:text-brand-royal",
                pathname === item.href && "text-brand-royal",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link href="/dang-nhap" className="text-sm font-medium hover:text-brand-royal">
            Đăng nhập
          </Link>
          <Button asChild variant="gold" size="sm">
            <Link href="/dang-ky-tu-van">Đăng ký tư vấn</Link>
          </Button>
        </div>

        <button
          type="button"
          className="md:hidden"
          aria-label={open ? "Đóng menu" : "Mở menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border bg-background px-4 py-3 md:hidden">
          <nav className="flex flex-col gap-3" aria-label="Điều hướng chính (di động)">
            {publicNav.map((item) => (
              <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className="text-sm font-medium">
                {item.label}
              </Link>
            ))}
            <Link href="/dang-nhap" onClick={() => setOpen(false)} className="text-sm font-medium">
              Đăng nhập
            </Link>
            <Button asChild variant="gold" size="sm" className="w-full">
              <Link href="/dang-ky-tu-van" onClick={() => setOpen(false)}>
                Đăng ký tư vấn
              </Link>
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}
