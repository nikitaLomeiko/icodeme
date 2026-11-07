import {
  AnswerValue,
  IQuestion,
  IResultEntry,
  IResults,
  ITest,
  QuestionState,
} from "../../types/types";
import { normalize } from "./normalize";
import { isQuestionAnswered } from "./selectors";

export const isAnswerCorrect = (
  question: IQuestion,
  answer?: AnswerValue,
): boolean => {
  if (question.type === "fields") {
    if (!Array.isArray(answer) || !question.fields?.length) return false;
    return question.fields.every((field, index) =>
      field.correct.some((value) => normalize(value) === normalize(answer[index] ?? "")),
    );
  }

  if (!question.correct?.length || !answer) return false;

  if (question.type === "text") {
    const normalized = normalize(String(answer));
    return question.correct.some((value) => normalize(value) === normalized);
  }

  const answerSet = new Set(Array.isArray(answer) ? answer : [answer]);
  const correctSet = new Set(question.correct);

  if (question.multiple) {
    if (answerSet.size !== correctSet.size) return false;
    return [...answerSet].every((item) => correctSet.has(item));
  }

  return [...correctSet].every((item) => answerSet.has(item));
};

export const computeResults = (
  answers: Record<string, AnswerValue>,
  skipped: Record<string, boolean>,
  quiz: ITest | null,
): IResults | null => {
  if (!quiz) return null;

  const detail: IResultEntry[] = quiz.questions.map((question) => {
    const answered =
      isQuestionAnswered(answers, question.id) && !skipped[question.id];
    const isSkipped = !answered && skipped[question.id];

    const gradable = question.type === "fields"
      ? Boolean(question.fields?.length && question.fields.every((field) => field.correct.length))
      : Boolean(question.correct?.length);
    let state: QuestionState = "skipped";
    let earned = 0;

    if (answered) {
      const correct = gradable && isAnswerCorrect(question, answers[question.id]);
      state = !gradable ? "ungraded" : correct ? "correct" : "incorrect";
      earned = correct && quiz.settings?.isScore ? (question.points ?? 0) : 0;
    }

    return {
      question,
      state: isSkipped ? "skipped" : state,
      answered,
      earned,
      points: question.points ?? 0,
    };
  });

  return {
    detail,
    totalEarned: detail.reduce((sum, item) => sum + item.earned, 0),
    maxScore: quiz.questions.reduce((sum, q) => sum + (q.points ?? 0), 0),
    answeredCount: detail.filter((item) => item.answered).length,
    skippedCount: detail.filter((item) => !item.answered).length,
    correctCount: detail.filter((item) => item.state === "correct").length,
    gradedCount: quiz.questions.filter((question) => question.type === "fields"
      ? Boolean(question.fields?.length && question.fields.every((field) => field.correct.length))
      : Boolean(question.correct?.length)).length,
  };
};
