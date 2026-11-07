import { ITest } from "../types/types";

export type QuizAction =
  | { type: "SET_QUIZ"; quiz: ITest }
  | { type: "SET_TIME_LEFT"; timeLeft: number | null }
  | { type: "START" }
  | { type: "RESTART" }
  | { type: "FINISH" }
  | { type: "GO_TO"; index: number }
  | { type: "GO_NEXT" }
  | { type: "GO_PREV" }
  | { type: "SELECT_OPTION"; optionId: string }
  | { type: "SET_TEXT_ANSWER"; value: string }
  | { type: "SET_FIELD_ANSWER"; index: number; value: string }
  | { type: "SKIP_QUESTION" }
  | { type: "MARK_SKIPPED"; questionId: string };

export const setTimeLeft = (timeLeft: number | null): QuizAction => ({
  type: "SET_TIME_LEFT",
  timeLeft,
});

export const setQuiz = (quiz: ITest): QuizAction => ({
  type: "SET_QUIZ",
  quiz,
});

export const startQuiz = (): QuizAction => ({ type: "START" });

export const restartQuiz = (): QuizAction => ({ type: "RESTART" });

export const finishQuiz = (): QuizAction => ({ type: "FINISH" });

export const goToQuestion = (index: number): QuizAction => ({
  type: "GO_TO",
  index,
});

export const goNextQuestion = (): QuizAction => ({ type: "GO_NEXT" });

export const goPrevQuestion = (): QuizAction => ({ type: "GO_PREV" });

export const selectOption = (optionId: string): QuizAction => ({
  type: "SELECT_OPTION",
  optionId,
});

export const setTextAnswer = (value: string): QuizAction => ({
  type: "SET_TEXT_ANSWER",
  value,
});

export const setFieldAnswer = (index: number, value: string): QuizAction => ({
  type: "SET_FIELD_ANSWER",
  index,
  value,
});

export const skipQuestion = (): QuizAction => ({ type: "SKIP_QUESTION" });

export const markSkipped = (questionId: string): QuizAction => ({
  type: "MARK_SKIPPED",
  questionId,
});
