"use client";

import { useEffect, useRef, useState } from "react";
import { Play, RotateCcw, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { formatDuration } from "@/lib/utils/format";
import { completePracticeSessionAction } from "@/features/practice/actions";

export function PracticeTimer({ durationSeconds, practiceSlug }: { durationSeconds: number; practiceSlug: string }) {
  const [remaining, setRemaining] = useState(durationSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const [result, setResult] = useState<{ awarded: boolean; message: string } | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setRemaining((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            setFinished(true);
            if (intervalRef.current) clearInterval(intervalRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  function handleStart() {
    setFinished(false);
    setResult(null);
    setIsRunning(true);
  }

  function handleReset() {
    setIsRunning(false);
    setFinished(false);
    setResult(null);
    setRemaining(durationSeconds);
  }

  async function handleSelfAssess() {
    const response = await completePracticeSessionAction(practiceSlug);
    setResult(response);
  }

  const percent = Math.round(((durationSeconds - remaining) / durationSeconds) * 100);

  return (
    <div className="flex flex-col items-center gap-4 rounded-[var(--radius-card)] border border-border p-6 text-center">
      <p className="font-heading text-4xl font-bold text-brand-royal">{formatDuration(remaining)}</p>
      <Progress value={percent} className="w-full" label="Thời gian luyện tập" />
      <div className="flex gap-3">
        {!isRunning && !finished && (
          <Button onClick={handleStart}>
            <Play className="h-4 w-4" /> Bắt đầu
          </Button>
        )}
        {isRunning && (
          <Button variant="outline" onClick={() => setIsRunning(false)}>
            <Square className="h-4 w-4" /> Tạm dừng
          </Button>
        )}
        <Button variant="ghost" onClick={handleReset}>
          <RotateCcw className="h-4 w-4" /> Làm lại
        </Button>
      </div>

      {finished && !result && (
        <div className="mt-2 flex flex-col items-center gap-2">
          <p className="text-sm text-muted-foreground">Bạn đã hoàn thành bài luyện! Tự đánh giá bản thân nhé.</p>
          <Button variant="gold" onClick={handleSelfAssess}>
            Tôi đã luyện tập xong
          </Button>
        </div>
      )}
      {result && (
        <p className={`text-sm ${result.awarded ? "text-brand-success" : "text-muted-foreground"}`}>{result.message}</p>
      )}
    </div>
  );
}
