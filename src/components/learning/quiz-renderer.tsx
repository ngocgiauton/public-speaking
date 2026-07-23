"use client";

import { useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { submitQuizAttemptAction, type QuizResult } from "@/features/quizzes/actions";
import type { QuizOptionRow, QuizQuestionRow, QuizRow } from "@/types/database";

export function QuizRenderer({
  quiz,
  lessonId,
  questions,
  optionsByQuestion,
}: {
  quiz: QuizRow;
  lessonId: string;
  questions: QuizQuestionRow[];
  optionsByQuestion: Record<string, QuizOptionRow[]>;
}) {
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [orderAnswers, setOrderAnswers] = useState<Record<string, string[]>>({});
  const [result, setResult] = useState<QuizResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function toggleSingle(questionId: string, optionId: string) {
    setAnswers((prev) => ({ ...prev, [questionId]: [optionId] }));
  }

  function toggleMultiple(questionId: string, optionId: string) {
    setAnswers((prev) => {
      const current = prev[questionId] ?? [];
      const next = current.includes(optionId) ? current.filter((id) => id !== optionId) : [...current, optionId];
      return { ...prev, [questionId]: next };
    });
  }

  function moveOrderItem(questionId: string, index: number, direction: -1 | 1) {
    setOrderAnswers((prev) => {
      const current = prev[questionId] ?? optionsByQuestion[questionId].map((o) => o.id);
      const next = [...current];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return { ...prev, [questionId]: next };
    });
  }

  async function handleSubmit() {
    setError(null);
    setIsSubmitting(true);

    const payloadAnswers = questions.map((q) => {
      if (q.question_type === "ordering") {
        return {
          questionId: q.id,
          selectedOptionIds: orderAnswers[q.id] ?? optionsByQuestion[q.id].map((o) => o.id),
        };
      }
      return { questionId: q.id, selectedOptionIds: answers[q.id] ?? [] };
    });

    const response = await submitQuizAttemptAction({ quizId: quiz.id, lessonId, answers: payloadAnswers });
    setIsSubmitting(false);

    if (response.error) {
      setError(response.error);
      return;
    }
    if (response.result) setResult(response.result);
  }

  if (result) {
    return (
      <Card>
        <CardContent className="flex flex-col gap-4 p-6">
          <div className="flex items-center gap-3">
            {result.isPassed ? (
              <CheckCircle2 className="h-8 w-8 text-brand-success" />
            ) : (
              <XCircle className="h-8 w-8 text-brand-error" />
            )}
            <div>
              <p className="font-heading text-lg font-semibold">
                Điểm của bạn: {result.score}/100
              </p>
              <p className="text-sm text-muted-foreground">
                {result.isPassed
                  ? `Đạt yêu cầu (tối thiểu ${quiz.pass_score} điểm).`
                  : `Chưa đạt (tối thiểu ${quiz.pass_score} điểm). Bạn có thể làm lại.`}
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            {questions.map((q) => {
              const item = result.perQuestion.find((p) => p.questionId === q.id);
              return (
                <div key={q.id} className="rounded-[var(--radius-control)] border border-border p-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium">{q.question_text}</p>
                    {item?.isCorrect ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-brand-success" />
                    ) : (
                      <XCircle className="h-4 w-4 shrink-0 text-brand-error" />
                    )}
                  </div>
                  {q.explanation && <p className="mt-1 text-xs text-muted-foreground">{q.explanation}</p>}
                </div>
              );
            })}
          </div>
          {!result.isPassed && (
            <Button variant="outline" onClick={() => setResult(null)}>
              Làm lại
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {error && (
        <p role="alert" className="rounded-[var(--radius-control)] bg-brand-error/10 p-3 text-sm text-brand-error">
          {error}
        </p>
      )}
      {questions
        .sort((a, b) => a.order_index - b.order_index)
        .map((question, qIndex) => {
          const options = optionsByQuestion[question.id] ?? [];
          return (
            <Card key={question.id}>
              <CardContent className="flex flex-col gap-3 p-5">
                <p className="font-medium">
                  Câu {qIndex + 1}. {question.question_text}
                </p>

                {(question.question_type === "single_choice" || question.question_type === "true_false") && (
                  <div className="flex flex-col gap-2">
                    {options.map((opt) => (
                      <label key={opt.id} className="flex items-center gap-2 text-sm">
                        <input
                          type="radio"
                          name={question.id}
                          checked={(answers[question.id] ?? []).includes(opt.id)}
                          onChange={() => toggleSingle(question.id, opt.id)}
                        />
                        {opt.option_text}
                      </label>
                    ))}
                  </div>
                )}

                {question.question_type === "multiple_choice" && (
                  <div className="flex flex-col gap-2">
                    {options.map((opt) => (
                      <label key={opt.id} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={(answers[question.id] ?? []).includes(opt.id)}
                          onChange={() => toggleMultiple(question.id, opt.id)}
                        />
                        {opt.option_text}
                      </label>
                    ))}
                  </div>
                )}

                {question.question_type === "ordering" && (
                  <ol className="flex flex-col gap-2">
                    {(orderAnswers[question.id] ?? options.map((o) => o.id)).map((optId, index) => {
                      const opt = options.find((o) => o.id === optId);
                      return (
                        <li
                          key={optId}
                          className="flex items-center justify-between gap-2 rounded-[var(--radius-control)] border border-border p-2 text-sm"
                        >
                          <span>
                            {index + 1}. {opt?.option_text}
                          </span>
                          <span className="flex gap-1">
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => moveOrderItem(question.id, index, -1)}
                              aria-label="Di chuyển lên"
                            >
                              ↑
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => moveOrderItem(question.id, index, 1)}
                              aria-label="Di chuyển xuống"
                            >
                              ↓
                            </Button>
                          </span>
                        </li>
                      );
                    })}
                  </ol>
                )}
              </CardContent>
            </Card>
          );
        })}
      <Button onClick={handleSubmit} disabled={isSubmitting} size="lg">
        {isSubmitting ? "Đang chấm..." : "Nộp bài quiz"}
      </Button>
    </div>
  );
}
