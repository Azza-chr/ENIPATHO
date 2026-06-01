export interface SpeechRequest { transcript: string; }
export interface SpeechResponse { answer: string; model: string; }

export interface OcrResponse {
  extractedText: string;
  summary: string;
  characterCount: number;
}

export interface QuizRequest { sourceText: string; numQuestions: number; }
export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}
export interface QuizResponse { topic: string; questions: QuizQuestion[]; }

export interface ApiError { message: string; }
