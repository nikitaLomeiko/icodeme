"use client";

import { useMemo } from "react";
import Link from "next/link";
import { QuizPage, QuizProvider } from "@/features/quiz";
import { StepShell } from "../step-shell";
import { useStepRouteParams, useStudyStep } from "../lib/hooks";
import { adaptStudyQuiz } from "../lib/utils";
import { GenerateStepContent } from "./generate-step-content";
import { QuizCompletion } from "./quiz-completion";

interface IProps {
  kind: "quiz" | "test" | "exam";
}

export const QuizStepView: React.FC<IProps> = ({ kind }) => {
  const params = useStepRouteParams();
  const { isValid, isLoading, isError, study, step } = useStudyStep(params);
  const sourceQuiz =
    step?.type === "quiz" ? step.quiz : (step?.exam ?? step?.quiz);
  const quiz = useMemo(
    () => (sourceQuiz ? adaptStudyQuiz(sourceQuiz) : null),
    [sourceQuiz],
  );

  if (!isValid) return <StepShell message="Некорректная ссылка на шаг." />;
  if (isLoading) return <StepShell loading />;
  if (isError || !study)
    return <StepShell message="Не удалось загрузить план обучения." />;

  const matches =
    kind === "quiz"
      ? step?.type === "quiz"
      : step?.type === "test" || step?.type === "exam";
  if (matches && step && !quiz)
    return (
      <StepShell>
        <GenerateStepContent params={params} kind="quiz" />
      </StepShell>
    );
  if (!matches || !quiz || !step)
    return <StepShell message="Тест для этого шага не найден." />;
  if (!quiz.questions.length)
    return <StepShell message="В этом тесте пока нет вопросов." />;

  const stepKey = `${params.studyId}:${params.moduleIndex}:${params.levelIndex}:${params.stepIndex}`;
  const codeUrl = `/code?${new URLSearchParams({
    studyId: params.studyId ?? "",
    moduleIndex: params.moduleIndex ?? "",
    levelIndex: params.levelIndex ?? "",
    stepIndex: params.stepIndex ?? "",
  })}`;

  return (
    <StepShell>
      {step.code && (
        <div className="mb-6 w-full rounded-2xl border border-[var(--ui-border)] bg-[var(--ui-background-secondary)] p-5">
          <h1 className="font-semibold">{step.title}</h1>
          <p className="mt-2 whitespace-pre-wrap text-sm text-[var(--ui-text-muted)]">
            {step.code}
          </p>
          <Link
            href={codeUrl}
            className="mt-3 inline-block text-sm text-[var(--ui-primary)] underline"
          >
            Открыть IDE для задания
          </Link>
        </div>
      )}
      <QuizProvider key={stepKey} quiz={quiz}>
        <QuizPage />
        <QuizCompletion params={params} />
      </QuizProvider>
    </StepShell>
  );
};

export const QuizRouteView: React.FC = () => <QuizStepView kind="quiz" />;
export const TestRouteView: React.FC = () => <QuizStepView kind="test" />;
export const ExamRouteView: React.FC = () => <QuizStepView kind="exam" />;
