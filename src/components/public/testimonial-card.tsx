import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Quote } from "lucide-react";

export function TestimonialCard({
  authorName,
  authorRole,
  content,
  isPlaceholder,
}: {
  authorName: string;
  authorRole?: string | null;
  content: string;
  isPlaceholder: boolean;
}) {
  return (
    <Card className="h-full">
      <CardContent className="flex h-full flex-col gap-4 p-6">
        <Quote className="h-6 w-6 text-brand-gold" aria-hidden="true" />
        <p className="flex-1 text-sm text-foreground/90">{content}</p>
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-sm font-semibold">{authorName}</p>
            {authorRole && <p className="text-xs text-muted-foreground">{authorRole}</p>}
          </div>
          {isPlaceholder && <Badge variant="warning">Nội dung minh họa</Badge>}
        </div>
      </CardContent>
    </Card>
  );
}
