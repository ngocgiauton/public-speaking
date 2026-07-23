"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { submitReviewAction } from "@/features/reviews/actions";
import { TEACHER_BONUS_XP_LIMIT } from "@/config/gamification";
import type { AssignmentRubricCriterionRow } from "@/types/database";

export function RubricScoreForm({
  submissionId,
  criteria,
}: {
  submissionId: string;
  criteria: AssignmentRubricCriterionRow[];
}) {
  const router = useRouter();
  const [scores, setScores] = useState<Record<string, number>>(
    Object.fromEntries(criteria.map((c) => [c.criterion_key, 0])),
  );
  const [decision, setDecision] = useState<"approved" | "revision_requested" | "rejected">("approved");
  const [overallComment, setOverallComment] = useState("");
  const [strengths, setStrengths] = useState("");
  const [improvements, setImprovements] = useState("");
  const [bonusXp, setBonusXp] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const groups = useMemo(() => {
    const map = new Map<string, AssignmentRubricCriterionRow[]>();
    for (const c of criteria) {
      const list = map.get(c.group_key) ?? [];
      list.push(c);
      map.set(c.group_key, list);
    }
    return map;
  }, [criteria]);

  const maxTotal = criteria.reduce((sum, c) => sum + c.max_score, 0);
  const total = Object.values(scores).reduce((sum, v) => sum + (Number.isFinite(v) ? v : 0), 0);

  function updateScore(key: string, max: number, value: number) {
    const clamped = Math.min(Math.max(0, value), max);
    setScores((prev) => ({ ...prev, [key]: clamped }));
  }

  async function handleConfirmSubmit() {
    setIsSubmitting(true);
    setError(null);
    const result = await submitReviewAction({
      submissionId,
      decision,
      overallComment,
      strengths,
      improvements,
      scores,
      bonusXp,
    });
    setIsSubmitting(false);
    setConfirmOpen(false);
    if (result?.error) {
      setError(result.error);
    } else {
      router.refresh();
    }
  }

  return (
    <div className="flex flex-col gap-5">
      {error && (
        <p role="alert" className="rounded-[var(--radius-control)] bg-brand-error/10 p-3 text-sm text-brand-error">
          {error}
        </p>
      )}

      {[...groups.entries()].map(([groupKey, groupCriteria]) => (
        <Card key={groupKey}>
          <CardContent className="flex flex-col gap-3 p-4">
            <p className="font-heading font-semibold capitalize">{groupKey.replace(/_/g, " ")}</p>
            {groupCriteria.map((c) => (
              <div key={c.criterion_key} className="flex items-center justify-between gap-3">
                <Label htmlFor={c.criterion_key} className="flex-1">
                  {c.label}
                </Label>
                <Input
                  id={c.criterion_key}
                  type="number"
                  min={0}
                  max={c.max_score}
                  value={scores[c.criterion_key]}
                  onChange={(e) => updateScore(c.criterion_key, c.max_score, Number(e.target.value))}
                  className="w-20"
                />
                <span className="w-12 text-sm text-muted-foreground">/ {c.max_score}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}

      <p className="text-right font-heading text-lg font-bold">
        Tổng điểm: {total}/{maxTotal}
      </p>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="strengths">Điểm mạnh</Label>
        <Textarea id="strengths" value={strengths} onChange={(e) => setStrengths(e.target.value)} maxLength={1000} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="improvements">Điểm cần cải thiện</Label>
        <Textarea id="improvements" value={improvements} onChange={(e) => setImprovements(e.target.value)} maxLength={1000} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="overallComment">Nhận xét chung</Label>
        <Textarea id="overallComment" value={overallComment} onChange={(e) => setOverallComment(e.target.value)} maxLength={2000} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="decision">Quyết định</Label>
          <Select id="decision" value={decision} onChange={(e) => setDecision(e.target.value as typeof decision)}>
            <option value="approved">Duyệt bài (Đã đạt)</option>
            <option value="revision_requested">Yêu cầu làm lại</option>
            <option value="rejected">Chưa đạt</option>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="bonusXp">XP thưởng thêm (tối đa {TEACHER_BONUS_XP_LIMIT})</Label>
          <Input
            id="bonusXp"
            type="number"
            min={0}
            max={TEACHER_BONUS_XP_LIMIT}
            value={bonusXp}
            onChange={(e) => setBonusXp(Math.min(TEACHER_BONUS_XP_LIMIT, Math.max(0, Number(e.target.value))))}
          />
        </div>
      </div>

      <Button size="lg" onClick={() => setConfirmOpen(true)} disabled={isSubmitting}>
        Gửi kết quả chấm bài
      </Button>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmSubmit}
        title="Xác nhận gửi kết quả chấm bài"
        description="Học viên sẽ nhận được thông báo và XP tương ứng ngay sau khi bạn xác nhận."
        confirmLabel="Xác nhận"
        isDestructive={false}
        isLoading={isSubmitting}
      />
    </div>
  );
}
