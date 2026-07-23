import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export function ProgressCard({
  title,
  percent,
  description,
}: {
  title: string;
  percent: number;
  description?: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <Progress value={percent} label={title} />
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{description}</span>
          <span className="font-medium text-foreground">{percent}%</span>
        </div>
      </CardContent>
    </Card>
  );
}
