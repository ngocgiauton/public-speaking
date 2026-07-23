import Link from "next/link";
import { cn } from "@/lib/utils/cn";

export function Pagination({
  currentPage,
  totalPages,
  basePath,
  searchParams = {},
}: {
  currentPage: number;
  totalPages: number;
  basePath: string;
  searchParams?: Record<string, string | undefined>;
}) {
  if (totalPages <= 1) return null;

  function hrefFor(page: number) {
    const params = new URLSearchParams(
      Object.entries(searchParams).filter(([, v]) => v != null) as [string, string][],
    );
    params.set("page", String(page));
    return `${basePath}?${params.toString()}`;
  }

  return (
    <nav aria-label="Phân trang" className="flex items-center justify-center gap-2">
      <Link
        href={hrefFor(Math.max(1, currentPage - 1))}
        aria-disabled={currentPage === 1}
        className={cn(
          "rounded-[var(--radius-control)] border border-border px-3 py-1.5 text-sm",
          currentPage === 1 && "pointer-events-none opacity-40",
        )}
      >
        Trước
      </Link>
      <span className="text-sm text-muted-foreground">
        Trang {currentPage} / {totalPages}
      </span>
      <Link
        href={hrefFor(Math.min(totalPages, currentPage + 1))}
        aria-disabled={currentPage === totalPages}
        className={cn(
          "rounded-[var(--radius-control)] border border-border px-3 py-1.5 text-sm",
          currentPage === totalPages && "pointer-events-none opacity-40",
        )}
      >
        Sau
      </Link>
    </nav>
  );
}
