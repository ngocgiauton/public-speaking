import Link from "next/link";
import { siteConfig } from "@/config/site";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted px-4 py-12">
      <Link href="/" className="mb-8 font-heading text-xl font-bold text-brand-royal">
        {siteConfig.organization}
      </Link>
      <main id="main-content" className="w-full max-w-md">
        {children}
      </main>
    </div>
  );
}
