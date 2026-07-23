"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { MediaUploader } from "@/components/learning/media-uploader";
import { saveDraftAction, submitAssignmentAction } from "@/features/submissions/actions";
import type { SubmissionFileRow } from "@/types/database";

export function AssignmentWorkspaceForm({
  submissionId,
  studentProfileId,
  assignmentId,
  initialTitle,
  initialNotes,
  files,
  allowedMedia,
  maxVideoMb,
  maxAudioMb,
  editable,
}: {
  submissionId: string;
  studentProfileId: string;
  assignmentId: string;
  initialTitle: string;
  initialNotes: string;
  files: SubmissionFileRow[];
  allowedMedia: string[];
  maxVideoMb: number;
  maxAudioMb: number;
  editable: boolean;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(initialTitle);
  const [notes, setNotes] = useState(initialNotes);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSaveDraft() {
    startTransition(async () => {
      const result = await saveDraftAction({ submissionId, assignmentId, title, notes });
      setMessage(result.error ? { type: "error", text: result.error } : { type: "success", text: result.success ?? "" });
    });
  }

  function handleSubmit() {
    startTransition(async () => {
      const result = await submitAssignmentAction(submissionId);
      setConfirmOpen(false);
      if (result.error) {
        setMessage({ type: "error", text: result.error });
      } else {
        setMessage({ type: "success", text: result.success ?? "" });
        router.refresh();
      }
    });
  }

  return (
    <div className="flex flex-col gap-5">
      {message && (
        <p
          role="status"
          className={`rounded-[var(--radius-control)] p-3 text-sm ${
            message.type === "error" ? "bg-brand-error/10 text-brand-error" : "bg-brand-success/10 text-brand-success"
          }`}
        >
          {message.text}
        </p>
      )}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="title">Tiêu đề bài nói</Label>
        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} disabled={!editable} maxLength={200} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="notes">Ghi chú</Label>
        <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} disabled={!editable} maxLength={1000} />
      </div>

      {allowedMedia.includes("video") && (
        <MediaUploader
          submissionId={submissionId}
          studentProfileId={studentProfileId}
          kind="video"
          maxMb={maxVideoMb}
          files={files.filter((f) => f.file_type === "video")}
          disabled={!editable}
        />
      )}
      {allowedMedia.includes("audio") && (
        <MediaUploader
          submissionId={submissionId}
          studentProfileId={studentProfileId}
          kind="audio"
          maxMb={maxAudioMb}
          files={files.filter((f) => f.file_type === "audio")}
          disabled={!editable}
        />
      )}

      {editable && (
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={handleSaveDraft} disabled={isPending}>
            Lưu bản nháp
          </Button>
          <Button onClick={() => setConfirmOpen(true)} disabled={isPending}>
            Nộp bài
          </Button>
        </div>
      )}

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleSubmit}
        title="Nộp bài tập"
        description="Sau khi nộp, bạn sẽ không thể chỉnh sửa cho đến khi giáo viên yêu cầu làm lại. Bạn chắc chắn muốn nộp?"
        confirmLabel="Nộp bài"
        isDestructive={false}
        isLoading={isPending}
      />
    </div>
  );
}
