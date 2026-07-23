import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LessonForm } from "@/components/admin/lesson-form";
import { updateLessonAction } from "@/features/admin/lessons/actions";
import { listCourseLevels } from "@/lib/data/admin";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Sửa bài học", robots: { index: false } };

export default async function EditLessonPage({
  params,
}: {
  params: Promise<{ lessonId: string }>;
}) {
  const { lessonId } = await params;
  const supabase = await createClient();
  const { data: lesson } = await supabase.from("lessons").select("*").eq("id", lessonId).maybeSingle();
  if (!lesson) notFound();

  const levels = await listCourseLevels();
  const boundAction = updateLessonAction.bind(null, lessonId);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <PageHeader
        title={`Sửa bài học: ${lesson.title}`}
        breadcrumbs={[{ label: "Bài học", href: "/admin/bai-hoc" }, { label: "Sửa" }]}
      />
      <Card>
        <CardHeader>
          <CardTitle>Thông tin bài học</CardTitle>
        </CardHeader>
        <CardContent>
          <LessonForm levels={levels} action={boundAction} submitLabel="Lưu thay đổi" defaultValues={lesson} />
        </CardContent>
      </Card>
    </div>
  );
}
