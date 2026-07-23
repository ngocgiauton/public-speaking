import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { AnnouncementForm } from "@/components/forms/announcement-form";
import { getCurrentUser } from "@/lib/auth/session";
import { getTeacherClasses } from "@/lib/data/teacher";

export const metadata: Metadata = { title: "Giao bài & Thông báo lớp", robots: { index: false } };

export default async function TeacherAssignPage() {
  const user = await getCurrentUser();
  const classes = await getTeacherClasses(user!.id);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <PageHeader
        title="Giao bài & Gửi thông báo cho lớp"
        description="Gửi thông báo hoặc đề xuất bài luyện tập bổ sung tới toàn bộ học viên trong lớp."
        breadcrumbs={[{ label: "Tổng quan", href: "/teacher" }, { label: "Giao bài" }]}
      />

      {classes.length === 0 ? (
        <EmptyState title="Bạn chưa được phân công lớp nào" />
      ) : (
        <Card>
          <CardContent className="p-6">
            <AnnouncementForm classes={classes.map((c) => ({ id: c.id, name: c.name }))} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
