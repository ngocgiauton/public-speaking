import Link from "next/link";
import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { getCurrentUser } from "@/lib/auth/session";
import { getTeacherClasses } from "@/lib/data/teacher";

export const metadata: Metadata = { title: "Lớp học", robots: { index: false } };

export default async function TeacherClassesPage() {
  const user = await getCurrentUser();
  const classes = await getTeacherClasses(user!.id);

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <PageHeader title="Lớp học" breadcrumbs={[{ label: "Tổng quan", href: "/teacher" }, { label: "Lớp học" }]} />

      {classes.length === 0 ? (
        <EmptyState title="Bạn chưa được phân công lớp nào" />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {classes.map((c) => (
            <Link key={c.id} href={`/teacher/lop-hoc/${c.id}`}>
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardContent className="flex flex-col gap-2 p-5">
                  <Badge variant={c.status === "active" ? "success" : "neutral"}>{c.status}</Badge>
                  <p className="font-heading font-semibold">{c.name}</p>
                  <p className="text-sm text-muted-foreground">{c.courseTitle}</p>
                  <p className="text-sm text-muted-foreground">{c.studentCount} học viên</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
