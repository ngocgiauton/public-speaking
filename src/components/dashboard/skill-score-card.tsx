import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { EmptyState } from "@/components/shared/empty-state";
import { RUBRIC_GROUPS } from "@/config/gamification";

export interface SkillScores {
  body_language: number | null;
  tone_of_voice: number | null;
  content: number | null;
  stage_skills: number | null;
  confidence_connection: number | null;
}

export function SkillScoreCard({ scores }: { scores: SkillScores }) {
  const hasAnyData = Object.values(scores).some((v) => v != null);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Điểm kỹ năng</CardTitle>
      </CardHeader>
      <CardContent>
        {!hasAnyData ? (
          <EmptyState
            title="Chưa có dữ liệu điểm kỹ năng"
            description="Điểm sẽ hiển thị sau khi bài tập đầu tiên được giáo viên duyệt."
          />
        ) : (
          <div className="flex flex-col gap-4">
            {RUBRIC_GROUPS.map((group) => {
              const key = group.key as keyof SkillScores;
              const value = scores[key];
              const percent = value != null ? Math.round((value / group.maxScore) * 100) : 0;
              return (
                <div key={group.key}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-medium">{group.label}</span>
                    <span className="text-muted-foreground">
                      {value != null ? `${value}/${group.maxScore}` : "Chưa có dữ liệu"}
                    </span>
                  </div>
                  <Progress value={percent} label={group.label} />
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
