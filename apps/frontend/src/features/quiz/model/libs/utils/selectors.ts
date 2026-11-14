import { AnswerValue, IQuestion } from "../../types/types";

export const isQuestionAnswered = (
  answers: Record<string, AnswerValue>,
  questionId: string,
): boolean => {
  const value = answers[questionId];
  if (value === undefined) return false;
  return Array.isArray(value)
    ? value.some((item) => item.trim().length > 0)
    : value.trim().length > 0;
};

export const isOptionSelected = (
  answers: Record<string, AnswerValue>,
  question: IQuestion,
  optionId: string,
): boolean => {
  const value = answers[question.id];
  if (Array.isArray(value)) return value.includes(optionId);
  return value === optionId;
};

export const getTextAnswer = (
  answers: Record<string, AnswerValue>,
  questionId: string,
): string => {
  const value = answers[questionId];
  return typeof value === "string" ? value : "";
};
