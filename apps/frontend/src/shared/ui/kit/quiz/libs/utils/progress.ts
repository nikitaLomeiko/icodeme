import { IQuizProgressState, ITest } from "../../types";
import { isQuestionAnswered } from "./selectors";

export const processedCount = (
  state: IQuizProgressState,
  quiz?: ITest,
): number =>
  (quiz?.questions || []).filter(
    (question) =>
      isQuestionAnswered(state.answers, question.id) ||
      state.skipped[question.id],
  ).length;

export const progressPercent = (
  state: IQuizProgressState,
  quiz?: ITest,
): number =>
  (quiz?.questions || []).length
    ? (processedCount(state, quiz) / (quiz?.questions?.length || 1)) * 100
    : 0;
