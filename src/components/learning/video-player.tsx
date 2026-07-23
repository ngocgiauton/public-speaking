"use client";

import { useRef, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { updateVideoWatchProgressAction } from "@/features/progress/actions";
import { Badge } from "@/components/ui/badge";

export function VideoPlayer({
  lessonId,
  videoUrl,
  thresholdPercent,
  initialCompleted,
}: {
  lessonId: string;
  videoUrl: string;
  thresholdPercent: number;
  initialCompleted: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const lastSentRef = useRef(0);
  const [completed, setCompleted] = useState(initialCompleted);

  function handleTimeUpdate() {
    const video = videoRef.current;
    if (!video || !video.duration) return;

    const now = Date.now();
    if (now - lastSentRef.current < 5000) return;
    lastSentRef.current = now;

    void updateVideoWatchProgressAction(lessonId, video.currentTime, video.duration).then(() => {
      const percent = Math.round((video.currentTime / video.duration) * 100);
      if (percent >= thresholdPercent) setCompleted(true);
    });
  }

  function handleEnded() {
    const video = videoRef.current;
    if (!video || !video.duration) return;
    void updateVideoWatchProgressAction(lessonId, video.duration, video.duration).then(() => setCompleted(true));
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="overflow-hidden rounded-[var(--radius-card)] border border-border bg-black">
        <video
          ref={videoRef}
          src={videoUrl}
          controls
          className="aspect-video w-full"
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded}
        >
          <track kind="captions" />
        </video>
      </div>
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Cần xem ít nhất {thresholdPercent}% video để hoàn thành phần này.</span>
        {completed && (
          <Badge variant="success">
            <CheckCircle2 className="h-3.5 w-3.5" /> Đã xem đủ
          </Badge>
        )}
      </div>
    </div>
  );
}
