"use client";

import { useMemo } from "react";
import Link from "next/link";
import { QuizPage, QuizProvider } from "@/shared/ui/kit/quiz";
import {
  StepShell,
  adaptStudyQuiz,
  useStepRouteParams,
  useStudyStep,
} from "@/widgets/step-shell/";

export function QuizStepPage({ kind }: { kind: "quiz" | "test" | "exam" }) {
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
      </QuizProvider>
    </StepShell>
  );
}

export function QuizRoute() {
  return <QuizStepPage kind="quiz" />;
}

export function TestRoute() {
  return <QuizStepPage kind="test" />;
}

export function ExamRoute() {
  return <QuizStepPage kind="exam" />;
}
