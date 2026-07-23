"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import type { ActionState } from "@/features/auth/actions";
import type { CourseLevelRow, LessonRow } from "@/types/database";

const initialState: ActionState = {};

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Đang lưu..." : label}
    </Button>
  );
}

export function LessonForm({
  levels,
  action,
  submitLabel,
  defaultValues,
}: {
  levels: CourseLevelRow[];
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  submitLabel: string;
  defaultValues?: Partial<LessonRow>;
}) {
  const [state, formAction] = useActionState(action, initialState);
  const objectives = Array.isArray(defaultValues?.objectives) ? (defaultValues.objectives as string[]) : [];
  const keyTakeaways = Array.isArray(defaultValues?.key_takeaways) ? (defaultValues.key_takeaways as string[]) : [];

  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      {state.error && <p className="text-sm text-brand-error">{state.error}</p>}
      {state.success && <p className="text-sm text-brand-success">{state.success}</p>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="courseLevelId">Level</Label>
          <Select id="courseLevelId" name="courseLevelId" defaultValue={defaultValues?.course_level_id} required>
            {levels.map((l) => (
              <option key={l.id} value={l.id}>
                Level {l.order_index} — {l.name}
              </option>
            ))}
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="sessionNumber">Buổi số</Label>
          <Input id="sessionNumber" name="sessionNumber" type="number" min={1} defaultValue={defaultValues?.session_number} required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="slug">Slug</Label>
          <Input id="slug" name="slug" defaultValue={defaultValues?.slug} required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="title">Tiêu đề</Label>
          <Input id="title" name="title" defaultValue={defaultValues?.title} required maxLength={200} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="durationMinutes">Thời lượng (phút)</Label>
          <Input id="durationMinutes" name="durationMinutes" type="number" min={1} defaultValue={defaultValues?.duration_minutes ?? 45} required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="xpReward">XP thưởng</Label>
          <Input id="xpReward" name="xpReward" type="number" min={0} defaultValue={defaultValues?.xp_reward ?? 10} required />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="shortDescription">Mô tả ngắn</Label>
        <Textarea id="shortDescription" name="shortDescription" defaultValue={defaultValues?.short_description ?? ""} maxLength={500} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="videoUrl">URL video bài giảng</Label>
        <Input id="videoUrl" name="videoUrl" type="url" defaultValue={defaultValues?.video_url ?? ""} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="objectives">Mục tiêu (mỗi dòng một mục tiêu)</Label>
        <Textarea id="objectives" name="objectives" defaultValue={objectives.join("\n")} rows={4} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="keyTakeaways">Kiến thức chính (mỗi dòng một ý)</Label>
        <Textarea id="keyTakeaways" name="keyTakeaways" defaultValue={keyTakeaways.join("\n")} rows={4} />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="isPublished" defaultChecked={defaultValues?.is_published ?? false} />
        Xuất bản bài học này
      </label>

      <div>
        <SubmitButton label={submitLabel} />
      </div>
    </form>
  );
}
