import { z } from "zod";

export const createQuizSchema = z.object({
  lessonId: z.string().uuid(),
  title: z.string().min(3).max(200),
  instructions: z.string().max(1000).optional().or(z.literal("")),
  passScore: z.coerce.number().int().min(0).max(100),
  maxAttempts: z.coerce.number().int().min(1).optional().or(z.literal("")),
});

export const addQuestionSchema = z.object({
  quizId: z.string().uuid(),
  questionText: z.string().min(3).max(500),
  questionType: z.enum(["single_choice", "multiple_choice", "true_false", "ordering"]),
  explanation: z.string().max(1000).optional().or(z.literal("")),
  points: z.coerce.number().int().min(1).max(100),
  orderIndex: z.coerce.number().int().min(0).max(100),
  optionsText: z
    .string()
    .min(3, "Vui lòng nhập ít nhất một đáp án")
    .max(2000),
});

/**
 * Mỗi dòng: "Nội dung đáp án|correct" — hậu tố "|correct" đánh dấu đáp án
 * đúng. Với câu hỏi ordering, thứ tự các dòng chính là thứ tự đúng.
 */
export function parseOptionsText(text: string): { optionText: string; isCorrect: boolean }[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const isCorrect = /\|correct$/i.test(line);
      const optionText = line.replace(/\|correct$/i, "").trim();
      return { optionText, isCorrect };
    });
}
