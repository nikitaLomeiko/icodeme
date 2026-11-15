"use client";

import { useCallback, useMemo } from "react";
import {
  TestResultsScreen,
  TestStartScreen,
  type IQuizTest,
} from "@/entities/quiz";
import {
  QuizProvider,
  QuizSession,
  computeResults,
  restartQuiz,
  startQuiz,
  useQuiz,
} from "@/features/quiz";

interface IProps {
  quiz: IQuizTest;
}

const QuizWidgetContent: React.FC = () => {
  const { state, dispatch } = useQuiz();
  const results = useMemo(
    () =>
      state.phase === "finished"
        ? computeResults(state.answers, state.skipped, state.quiz)
        : null,
    [state.phase, state.answers, state.skipped, state.quiz],
  );
  const start = useCallback(() => dispatch(startQuiz()), [dispatch]);
  const restart = useCallback(() => dispatch(restartQuiz()), [dispatch]);

  if (state.phase === "idle" && state.quiz)
    return <TestStartScreen quiz={state.quiz} onStart={start} />;

  if (state.phase === "running") return <QuizSession />;

  if (state.phase === "finished" && state.quiz && results)
    return (
      <TestResultsScreen
        quiz={state.quiz}
        answers={state.answers}
        results={results}
        onRestart={restart}
      />
    );

  return null;
};

export const QuizWidget: React.FC<IProps> = ({ quiz }) => (
  <QuizProvider quiz={quiz}>
    <QuizWidgetContent />
  </QuizProvider>
);
