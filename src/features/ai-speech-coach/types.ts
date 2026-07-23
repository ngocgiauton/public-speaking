/**
 * Kiến trúc mở rộng cho AI Speech Coach — CHƯA tích hợp AI thật trong MVP.
 * Feature flag `NEXT_PUBLIC_ENABLE_AI_SPEECH_COACH` kiểm soát việc hiển thị.
 * Khi tích hợp AI thật, implement một class thỏa `SpeechAnalysisProvider` và
 * đăng ký ở nơi khởi tạo thay vì `MockSpeechAnalysisProvider`.
 */

export interface SpeechAnalysisResult {
  speakingRatePerMinute: number;
  pauseCount: number;
  fillerWordCount: number;
  averageVolumeDb: number;
  pronunciationScore: number;
  eyeContactScore: number;
  smileScore: number;
  postureScore: number;
  movementScore: number;
  confidenceScore: number;
  suggestions: string[];
}

export interface SpeechAnalysisInput {
  submissionId: string;
  videoStoragePath: string;
}

export interface SpeechAnalysisProvider {
  analyze(input: SpeechAnalysisInput): Promise<SpeechAnalysisResult>;
}

/**
 * Provider mock — CHỈ dùng trong development để xem trước giao diện, không
 * bao giờ được gọi trong production và không bao giờ hiển thị kết quả này
 * như thể là phân tích AI thật cho người dùng cuối.
 */
export class MockSpeechAnalysisProvider implements SpeechAnalysisProvider {
  async analyze(_input: SpeechAnalysisInput): Promise<SpeechAnalysisResult> {
    if (process.env.NODE_ENV === "production") {
      throw new Error("MockSpeechAnalysisProvider không được phép chạy trong production.");
    }
    return {
      speakingRatePerMinute: 120,
      pauseCount: 4,
      fillerWordCount: 2,
      averageVolumeDb: -18,
      pronunciationScore: 80,
      eyeContactScore: 75,
      smileScore: 70,
      postureScore: 82,
      movementScore: 65,
      confidenceScore: 78,
      suggestions: [
        "Đây là dữ liệu mẫu (mock) — chỉ dùng để xem trước giao diện trong development.",
      ],
    };
  }
}
