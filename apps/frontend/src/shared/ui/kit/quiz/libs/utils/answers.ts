import { AnswerValue, IQuestion } from "../../types/types";

export const optionLabel = (question: IQuestion, id: string) =>
  question.options?.find((option) => option.id === id)?.label ?? id;

export const formatUserAnswer = (
  question: IQuestion,
  answer?: AnswerValue,
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

export const formatCorrectAnswer = (question: IQuestion): string => {
  if (question.type === "fields") {
    return question.fields?.map((field) => field.correct.join(" / ")).join("; ") ?? "";
  }
  if (!question.correct?.length) return "";
  if (question.type === "choice") {
    return question.correct.map((id) => optionLabel(question, id)).join(", ");
  }
  return question.correct.join(" / ");
};

export const pointsLabel = (points: number): string => {
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
