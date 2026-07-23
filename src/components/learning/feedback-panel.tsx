import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { SubmissionReviewRow, SubmissionScoreRow } from "@/types/database";

export function FeedbackPanel({
  review,
  scores,
}: {
  review: SubmissionReviewRow;
  scores: SubmissionScoreRow[];
}) {
  const totalMax = scores.reduce((sum, s) => sum + s.max_score, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Phản hồi của giáo viên</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div>
          <p className="text-sm font-medium">Tổng điểm</p>
          <p className="font-heading text-2xl font-bold text-brand-royal">
            {review.total_score}/{totalMax || 100}
          </p>
        </div>

        {scores.length > 0 && (
          <div className="flex flex-col gap-2">
            {scores.map((s) => (
              <div key={s.id}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span>{s.criterion_key}</span>
                  <span className="text-muted-foreground">
                    {s.score}/{s.max_score}
                  </span>
                </div>
                <Progress value={(s.score / s.max_score) * 100} />
              </div>
            ))}
          </div>
        )}

        {review.overall_comment && (
          <div>
            <p className="text-sm font-medium">Nhận xét chung</p>
            <p className="text-sm text-muted-foreground">{review.overall_comment}</p>
          </div>
        )}
        {review.strengths && (
          <div>
            <p className="text-sm font-medium text-brand-success">Điểm mạnh</p>
            <p className="text-sm text-muted-foreground">{review.strengths}</p>
          </div>
        )}
        {review.improvements && (
          <div>
            <p className="text-sm font-medium text-brand-warning">Điểm cần cải thiện</p>
            <p className="text-sm text-muted-foreground">{review.improvements}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
