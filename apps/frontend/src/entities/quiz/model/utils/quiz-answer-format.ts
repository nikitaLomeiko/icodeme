import type {
  IQuizSessionQuestion,
  QuizAnswerValue,
} from "../types/quiz-session.types";

const optionLabel = (question: IQuizSessionQuestion, id: string) =>
  question.options?.find((option) => option.id === id)?.label ?? id;

export const formatQuizUserAnswer = (
  question: IQuizSessionQuestion,
  answer?: QuizAnswerValue,
): string => {
  if (!answer) return "—";
  if (Array.isArray(answer)) {
    if (question.type === "choice")
      return answer.map((id) => optionLabel(question, id)).join(", ");
    return answer.join(", ");
  }
  if (question.type === "choice") return optionLabel(question, answer);
  return answer;
};

export const formatQuizCorrectAnswer = (
  question: IQuizSessionQuestion,
): string => {
  if (question.type === "fields") {
    return (
      question.fields?.map((field) => field.correct.join(" / ")).join("; ") ??
      ""
    );
  }
  if (!question.correct?.length) return "";
  if (question.type === "choice") {
    return question.correct.map((id) => optionLabel(question, id)).join(", ");
  }
  return question.correct.join(" / ");
};

export const quizPointsLabel = (points: number): string => {
  if (points % 10 === 1 && points % 100 !== 11) return "балл";
  if (
    points % 10 >= 2 &&
    points % 10 <= 4 &&
    (points % 100 < 10 || points % 100 >= 20)
  ) {
    return "балла";
  }
  return "баллов";
};
