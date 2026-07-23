"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { deleteQuestionAction } from "@/features/admin/quizzes/actions";

export function DeleteQuestionButton({ questionId, quizId }: { questionId: string; quizId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  return (
    <>
      <Button size="sm" variant="ghost" onClick={() => setOpen(true)} aria-label="Xóa câu hỏi">
        <Trash2 className="h-4 w-4 text-brand-error" />
      </Button>
      <ConfirmDialog
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={() =>
          startTransition(async () => {
            await deleteQuestionAction(questionId, quizId);
            setOpen(false);
            router.refresh();
          })
        }
        title="Xóa câu hỏi"
        description="Bạn chắc chắn muốn xóa câu hỏi này? Hành động này không thể hoàn tác."
        isLoading={isPending}
      />
    </>
  );
}
