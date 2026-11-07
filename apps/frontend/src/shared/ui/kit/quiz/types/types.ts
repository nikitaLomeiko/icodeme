export type QuestionType = "choice" | "text" | "fields";

export interface IOption {
  id: string;
  label: string;
}

export interface IQuestionField {
  label: string;
  placeholder?: string;
  correct: string[];
}

export interface IQuestion {
  id: string;
  type: QuestionType;
  title: string;
  description?: string;
  codeSnippet?: string;
  answerLabel?: string;
  answerPlaceholder?: string;
  fields?: IQuestionField[];
  errors?: string[];
  options?: IOption[];
  multiple?: boolean;
  points?: number;
  timeLimit?: number;
  correct?: string[];
}

export interface ITestSettings {
  isScore: boolean;
  isNavigate: boolean;
}

export interface ITest {
  title: string;
  description: string;
  settings: ITestSettings;
  questions: IQuestion[];
}

export type AnswerValue = string | string[];
export type Phase = "idle" | "running" | "finished";
export type QuestionState = "correct" | "incorrect" | "skipped" | "ungraded";

export interface IResultEntry {
  question: IQuestion;
  state: QuestionState;
  answered: boolean;
  earned: number;
  points: number;
}

export interface IResults {
  detail: IResultEntry[];
  totalEarned: number;
  maxScore: number;
  answeredCount: number;
  skippedCount: number;
  correctCount: number;
  gradedCount: number;
}

export interface IQuizState {
  quiz: ITest | null;
  phase: Phase;
  currentIndex: number;
  timeLeft: number | null;
  answers: Record<string, AnswerValue>;
  skipped: Record<string, boolean>;
}

export interface IQuizProgressState {
  answers: Record<string, string | string[]>;
  skipped: Record<string, boolean>;
}
