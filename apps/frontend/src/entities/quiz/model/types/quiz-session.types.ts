export type QuizQuestionType = "choice" | "text" | "fields";

export interface IQuizOption {
  id: string;
  label: string;
}

export interface IQuizQuestionField {
  label: string;
  placeholder?: string;
  correct: string[];
}

export interface IQuizSessionQuestion {
  id: string;
  type: QuizQuestionType;
  title: string;
  description?: string;
  codeSnippet?: string;
  answerLabel?: string;
  answerPlaceholder?: string;
  fields?: IQuizQuestionField[];
  errors?: string[];
  options?: IQuizOption[];
  multiple?: boolean;
  points?: number;
  timeLimit?: number;
  correct?: string[];
}

export interface IQuizTestSettings {
  isScore: boolean;
  isNavigate: boolean;
}

export interface IQuizTest {
  title: string;
  description: string;
  settings: IQuizTestSettings;
  questions: IQuizSessionQuestion[];
}

export type QuizAnswerValue = string | string[];
export type QuizPhase = "idle" | "running" | "finished";
export type QuizQuestionState =
  | "correct"
  | "incorrect"
  | "skipped"
  | "ungraded";

export interface IQuizResultEntry {
  question: IQuizSessionQuestion;
  state: QuizQuestionState;
  answered: boolean;
  earned: number;
  points: number;
}

export interface IQuizResults {
  detail: IQuizResultEntry[];
  totalEarned: number;
  maxScore: number;
  answeredCount: number;
  skippedCount: number;
  correctCount: number;
  gradedCount: number;
}

export interface IQuizSessionState {
  quiz: IQuizTest | null;
  phase: QuizPhase;
  currentIndex: number;
  timeLeft: number | null;
  answers: Record<string, QuizAnswerValue>;
  skipped: Record<string, boolean>;
  deadlines: Record<string, number>;
}

export interface IQuizProgressState {
  answers: Record<string, string | string[]>;
  skipped: Record<string, boolean>;
}
