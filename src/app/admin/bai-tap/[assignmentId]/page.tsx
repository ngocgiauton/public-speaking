import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AssignmentForm } from "@/components/admin/assignment-form";
import { updateAssignmentAction } from "@/features/admin/assignments/actions";
import { listLessonsAdmin } from "@/lib/data/admin";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Sửa bài tập", robots: { index: false } };

export default async function EditAssignmentPage({
  params,
}: {
  params: Promise<{ assignmentId: string }>;
}) {
  const { assignmentId } = await params;
  const supabase = await createClient();
  const { data: assignment } = await supabase.from("assignments").select("*").eq("id", assignmentId).maybeSingle();
  if (!assignment) notFound();

  const { data: criteria } = await supabase
    .from("assignment_rubric_criteria")
    .select("*")
    .eq("assignment_id", assignmentId);

  const lessons = await listLessonsAdmin();
  const boundAction = updateAssignmentAction.bind(null, assignmentId);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <PageHeader
        title={`Sửa bài tập: ${assignment.title}`}
        breadcrumbs={[{ label: "Bài tập", href: "/admin/bai-tap" }, { label: "Sửa" }]}
      />
      <Card>
        <CardHeader>
          <CardTitle>Thông tin bài tập</CardTitle>
        </CardHeader>
        <CardContent>
          <AssignmentForm
            lessons={lessons}
            action={boundAction}
            submitLabel="Lưu thay đổi"
            defaultValues={assignment}
            selectedCriteria={criteria ?? []}
          />
        </CardContent>
      </Card>
    </div>
  );
}
