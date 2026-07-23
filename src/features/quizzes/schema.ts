import { z } from "zod";

export const quizAnswerSchema = z.object({
  questionId: z.string().uuid(),
  selectedOptionIds: z.array(z.string().uuid()).max(20),
});

export const submitQuizSchema = z.object({
  quizId: z.string().uuid(),
  lessonId: z.string().uuid(),
  answers: z.array(quizAnswerSchema).min(1),
});

export type SubmitQuizInput = z.infer<typeof submitQuizSchema>;
