import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/shared/data-table";
import { SimpleActionForm } from "@/components/admin/simple-action-form";
import { PublishToggleButton } from "@/components/admin/publish-toggle-button";
import { createQuizAction, toggleQuizPublishAction } from "@/features/admin/quizzes/actions";
import { listLessonsAdmin, listQuizzesAdmin } from "@/lib/data/admin";

export const metadata: Metadata = { title: "Quiz", robots: { index: false } };

export default async function AdminQuizzesPage() {
  const [quizzes, lessons] = await Promise.all([listQuizzesAdmin(), listLessonsAdmin()]);

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <PageHeader title="Quiz" breadcrumbs={[{ label: "Tổng quan", href: "/admin" }, { label: "Quiz" }]} />

      <Card>
        <CardHeader>
          <CardTitle>Tạo quiz mới</CardTitle>
        </CardHeader>
        <CardContent>
          <SimpleActionForm action={createQuizAction} submitLabel="Tạo quiz">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="lessonId">Bài học</Label>
                <Select id="lessonId" name="lessonId" required>
                  {lessons.map((l) => (
                    <option key={l.id} value={l.id}>
                      Buổi {l.session_number} — {l.title}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="title">Tiêu đề quiz</Label>
                <Input id="title" name="title" required maxLength={200} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="passScore">Điểm đạt (0-100)</Label>
                <Input id="passScore" name="passScore" type="number" min={0} max={100} defaultValue={70} required />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="maxAttempts">Số lần làm tối đa (để trống = không giới hạn)</Label>
                <Input id="maxAttempts" name="maxAttempts" type="number" min={1} />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="instructions">Hướng dẫn</Label>
              <Textarea id="instructions" name="instructions" maxLength={1000} />
            </div>
          </SimpleActionForm>
        </CardContent>
      </Card>

      <DataTable
        columns={[
          {
            key: "title",
            header: "Tiêu đề",
            render: (row) => (
              <Link href={`/admin/quiz/${row.id}`} className="font-medium hover:underline">
                {row.title}
              </Link>
            ),
          },
          { key: "lesson", header: "Bài học", render: (row) => `Buổi ${row.lessonSessionNumber} — ${row.lessonTitle}` },
          { key: "passScore", header: "Điểm đạt", render: (row) => row.pass_score },
          {
            key: "status",
            header: "Trạng thái",
            render: (row) => <Badge variant={row.is_published ? "success" : "neutral"}>{row.is_published ? "Đã xuất bản" : "Nháp"}</Badge>,
          },
          {
            key: "actions",
            header: "Thao tác",
            render: (row) => <PublishToggleButton isPublished={row.is_published} onToggle={toggleQuizPublishAction.bind(null, row.id)} />,
          },
        ]}
        rows={quizzes}
        emptyTitle="Chưa có quiz nào"
      />
    </div>
  );
}
