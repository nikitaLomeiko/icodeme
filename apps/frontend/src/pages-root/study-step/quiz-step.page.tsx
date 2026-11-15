"use client";

import { useMemo } from "react";
import { QuizWidget } from "@/widgets/quiz";
import { adaptStudyQuiz, useStudyStepData } from "@/widgets/step-shell";

export const QuizStepPage: React.FC = () => {
  const studyStep = useStudyStepData();
  const { params, step } = studyStep;
  const sourceQuiz = step?.quiz;

  const quiz = useMemo(
    () => (sourceQuiz ? adaptStudyQuiz(sourceQuiz) : null),
    [sourceQuiz],
  );

  const matches = step?.type === "test";

  if (!matches || !step)
    return <p role="alert">Этот шаг не является тестом.</p>;

  if (!quiz) return <p role="alert">Для этого шага тест не создан.</p>;

  if (!quiz.questions.length)
    return <p role="alert">В этом тесте пока нет вопросов.</p>;

  const stepKey = `${params.studyId}:${params.moduleIndex}:${params.levelIndex}:${params.stepIndex}`;

  return (
    <QuizWidget key={stepKey} quiz={quiz} />
  );
};
