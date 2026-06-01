export interface QuizOption {
  id: number;
  label: string;
  ordre?: number;
}

export interface QuizQuestion {
  id: number;
  label: string;
  explication?: string;
  ordre?: number;
  points?: number;
  options: QuizOption[];
}

export interface QuizDetail {
  id: number;
  titre: string;
  description?: string;
  durationMinutes?: number;
  seuilReussite: number;
  chapitreId?: number;
  questions: QuizQuestion[];
}

export interface QuizAnswerPayload {
  questionId: number;
  answerId: number;
}

export interface QuizSubmitResult {
  quizId: number;
  quizTitre?: string;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  passed: boolean;
}

