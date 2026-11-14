"use client";

import { TerminalSession } from "@/features/terminal-session";
import { StepShell } from "../step-shell";
import { useStepRouteParams, useStudyStep } from "../lib/hooks";

export const TerminalStepView: React.FC = () => {
  const params = useStepRouteParams();
  const { isValid, isLoading, isError, study, step } = useStudyStep(params);

  if (!isValid) return <StepShell message="Некорректная ссылка на шаг." />;
  if (isLoading) return <StepShell loading />;
  if (isError || !study)
    return <StepShell message="Не удалось загрузить план обучения." />;
  if (step?.type !== "terminal")
    return <StepShell message="Задание для терминала не найдено." />;

  const sessionKey = `${params.studyId}:${params.moduleIndex}:${params.levelIndex}:${params.stepIndex}`;

  return (
    <StepShell
      title={step.title}
      description={step.description}
      content={step.code}
      settings={step.settings}
    >
      <div className="flex w-full min-w-0 flex-col gap-5">
        <TerminalSession sessionKey={sessionKey} step={step} study={study} />
      </div>
    </StepShell>
  );
};
