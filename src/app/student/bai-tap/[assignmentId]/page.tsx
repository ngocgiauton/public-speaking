import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SubmissionStatusBadge } from "@/components/gamification/submission-status-badge";
import { FeedbackPanel } from "@/components/learning/feedback-panel";
import { AssignmentWorkspaceForm } from "@/components/learning/assignment-workspace-form";
import { getCurrentUser } from "@/lib/auth/session";
import { getAssignmentWorkspace } from "@/lib/data/student";
import { ensureDraftSubmissionAction } from "@/features/submissions/actions";
import { isEditableByStudent } from "@/features/submissions/status";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Bài tập", robots: { index: false } };

export default async function AssignmentWorkspacePage({
  params,
}: {
  params: Promise<{ assignmentId: string }>;
}) {
  const { assignmentId } = await params;
  const user = await getCurrentUser();

  let workspace = await getAssignmentWorkspace(user!.id, assignmentId);
  if (!workspace) notFound();

  if (!workspace.submission) {
    const ensured = await ensureDraftSubmissionAction(assignmentId);
    if (ensured.submissionId) {
      workspace = await getAssignmentWorkspace(user!.id, assignmentId);
    }
  }

  if (!workspace || !workspace.submission) notFound();

  const { assignment, lesson, submission, files, latestReview } = workspace;
  const editable = isEditableByStudent(submission.status);

  let scores: import("@/types/database").SubmissionScoreRow[] = [];
  if (latestReview) {
    const supabase = await createClient();
    const { data } = await supabase.from("submission_scores").select("*").eq("submission_review_id", latestReview.id);
    scores = data ?? [];
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <PageHeader
        title={assignment.title}
        description={`Buổi ${lesson.session_number}: ${lesson.title}`}
        breadcrumbs={[{ label: "Bài tập", href: "/student/bai-tap" }, { label: assignment.title }]}
        actions={<SubmissionStatusBadge status={submission.status} />}
      />

      <Card>
        <CardHeader>
          <CardTitle>Yêu cầu bài tập</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 text-sm text-muted-foreground">
          <p>{assignment.description}</p>
          {assignment.instructions && <p>{assignment.instructions}</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Bài làm của bạn</CardTitle>
        </CardHeader>
        <CardContent>
          <AssignmentWorkspaceForm
            submissionId={submission.id}
            studentProfileId={user!.id}
            assignmentId={assignmentId}
            initialTitle={submission.title ?? ""}
            initialNotes={submission.notes ?? ""}
            files={files}
            allowedMedia={(assignment.allowed_media as string[]) ?? ["video"]}
            maxVideoMb={assignment.max_video_mb}
            maxAudioMb={assignment.max_audio_mb}
            editable={editable}
          />
        </CardContent>
      </Card>

      {latestReview && <FeedbackPanel review={latestReview} scores={scores} />}
    </div>
  );
}
