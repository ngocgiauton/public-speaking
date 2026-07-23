"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { RUBRIC_GROUPS } from "@/config/gamification";
import type { ActionState } from "@/features/auth/actions";
import type { AssignmentRow, AssignmentRubricCriterionRow, LessonRow } from "@/types/database";

const initialState: ActionState = {};

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Đang lưu..." : label}
    </Button>
  );
}

export function AssignmentForm({
  lessons,
  action,
  submitLabel,
  defaultValues,
  selectedCriteria = [],
}: {
  lessons: LessonRow[];
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  submitLabel: string;
  defaultValues?: Partial<AssignmentRow>;
  selectedCriteria?: AssignmentRubricCriterionRow[];
}) {
  const [state, formAction] = useActionState(action, initialState);
  const allowedMedia = (defaultValues?.allowed_media as string[]) ?? ["video"];
  const selectedKeys = new Set(selectedCriteria.map((c) => c.criterion_key));

  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      {state.error && <p className="text-sm text-brand-error">{state.error}</p>}
      {state.success && <p className="text-sm text-brand-success">{state.success}</p>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="lessonId">Bài học</Label>
          <Select id="lessonId" name="lessonId" defaultValue={defaultValues?.lesson_id} required>
            {lessons.map((l) => (
              <option key={l.id} value={l.id}>
                Buổi {l.session_number} — {l.title}
              </option>
            ))}
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="title">Tiêu đề</Label>
          <Input id="title" name="title" defaultValue={defaultValues?.title} required maxLength={200} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="assignmentType">Loại bài tập</Label>
          <Select id="assignmentType" name="assignmentType" defaultValue={defaultValues?.assignment_type ?? "main"}>
            <option value="main">Bài tập chính</option>
            <option value="practice">Bài luyện nhanh</option>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="minPassScore">Điểm đạt tối thiểu</Label>
          <Input id="minPassScore" name="minPassScore" type="number" min={0} max={100} defaultValue={defaultValues?.min_pass_score ?? 70} required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="xpReward">XP thưởng</Label>
          <Input id="xpReward" name="xpReward" type="number" min={0} defaultValue={defaultValues?.xp_reward ?? 50} required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="dueOffsetDays">Hạn nộp (số ngày kể từ khi bắt đầu)</Label>
          <Input id="dueOffsetDays" name="dueOffsetDays" type="number" min={0} defaultValue={defaultValues?.due_offset_days ?? 7} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="maxVideoMb">Dung lượng video tối đa (MB)</Label>
          <Input id="maxVideoMb" name="maxVideoMb" type="number" min={1} defaultValue={defaultValues?.max_video_mb ?? 200} required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="maxAudioMb">Dung lượng âm thanh tối đa (MB)</Label>
          <Input id="maxAudioMb" name="maxAudioMb" type="number" min={1} defaultValue={defaultValues?.max_audio_mb ?? 50} required />
        </div>
      </div>

      <div className="flex gap-4">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="allowedVideo" defaultChecked={allowedMedia.includes("video")} /> Cho phép video
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="allowedAudio" defaultChecked={allowedMedia.includes("audio")} /> Cho phép âm thanh
        </label>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="description">Mô tả</Label>
        <Textarea id="description" name="description" defaultValue={defaultValues?.description ?? ""} maxLength={1000} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="instructions">Hướng dẫn chi tiết</Label>
        <Textarea id="instructions" name="instructions" defaultValue={defaultValues?.instructions ?? ""} maxLength={2000} />
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-medium">Tiêu chí rubric áp dụng</legend>
        {RUBRIC_GROUPS.map((group) => (
          <div key={group.key}>
            <p className="text-xs font-semibold uppercase text-muted-foreground">{group.label}</p>
            <div className="flex flex-wrap gap-3">
              {group.criteria.map((c) => (
                <label key={c.key} className="flex items-center gap-1.5 text-sm">
                  <input type="checkbox" name="criteria" value={c.key} defaultChecked={selectedKeys.has(c.key)} />
                  {c.label} ({c.maxScore}đ)
                </label>
              ))}
            </div>
          </div>
        ))}
      </fieldset>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="isPublished" defaultChecked={defaultValues?.is_published ?? false} />
        Xuất bản bài tập này
      </label>

      <div>
        <SubmitButton label={submitLabel} />
      </div>
    </form>
  );
}
