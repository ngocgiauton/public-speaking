import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ScoreRing } from "@/components/ui/score-ring";
import { CRITERION_LABELS } from "@/config/gamification";
import type { SubmissionReviewRow, SubmissionScoreRow } from "@/types/database";

export function FeedbackPanel({
  review,
  scores,
}: {
  review: SubmissionReviewRow;
  scores: SubmissionScoreRow[];
}) {
  const totalMax = scores.reduce((sum, s) => sum + s.max_score, 0) || 100;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Nỗ lực tuyệt vời!</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-5">
          <ScoreRing value={review.total_score} max={totalMax} label="Tổng điểm" />
          <div className="flex flex-col gap-2">
            {review.overall_comment && (
              <p className="font-body-md text-body-md text-on-surface-variant">{review.overall_comment}</p>
            )}
            {review.strengths && (
              <p className="text-sm text-brand-success">
                <span className="font-medium">Điểm mạnh:</span> {review.strengths}
              </p>
            )}
            {review.improvements && (
              <p className="text-sm text-brand-warning">
                <span className="font-medium">Cần cải thiện:</span> {review.improvements}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {scores.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Phân tích kỹ năng</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {scores.map((s) => (
              <div key={s.id}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="text-on-surface">{CRITERION_LABELS[s.criterion_key] ?? s.criterion_key}</span>
                  <span className="text-on-surface-variant">
                    {s.score}/{s.max_score}
                  </span>
                </div>
                <Progress value={(s.score / s.max_score) * 100} />
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
