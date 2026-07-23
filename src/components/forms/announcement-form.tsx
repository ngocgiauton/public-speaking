"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { createAnnouncementAction } from "@/features/announcements/actions";
import type { ActionState } from "@/features/auth/actions";

const initialState: ActionState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Đang gửi..." : "Gửi cho cả lớp"}
    </Button>
  );
}

export function AnnouncementForm({ classes }: { classes: { id: string; name: string }[] }) {
  const [state, formAction] = useActionState(createAnnouncementAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      {state.error && (
        <p role="alert" className="rounded-[var(--radius-control)] bg-brand-error/10 p-3 text-sm text-brand-error">
          {state.error}
        </p>
      )}
      {state.success && (
        <p role="status" className="rounded-[var(--radius-control)] bg-brand-success/10 p-3 text-sm text-brand-success">
          {state.success}
        </p>
      )}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="classId">Lớp</Label>
        <Select id="classId" name="classId" required>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="title">Tiêu đề</Label>
        <Input id="title" name="title" required maxLength={200} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="body">Nội dung</Label>
        <Textarea
          id="body"
          name="body"
          required
          maxLength={2000}
          placeholder="Ví dụ: Tuần này cả lớp luyện thêm phần Eye Contact ở Phòng luyện tập nhé!"
        />
      </div>
      <SubmitButton />
    </form>
  );
}
