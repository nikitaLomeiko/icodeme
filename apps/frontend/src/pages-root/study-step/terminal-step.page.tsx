"use client";

import { useRef } from "react";
import { ITerminalHandle, Terminal } from "@/shared/ui/kit";
import {
  StepShell,
  useStepRouteParams,
  useStudyStep,
} from "@/widgets/step-shell/";

export function TerminalStepPage() {
  const params = useStepRouteParams();
  const { isValid, isLoading, isError, study, step } = useStudyStep(params);
  const terminalRef = useRef<ITerminalHandle>(null);

  if (!isValid) return <StepShell message="Некорректная ссылка на шаг." />;

  if (isLoading) return <StepShell loading />;

  if (isError || !study)
    return <StepShell message="Не удалось загрузить план обучения." />;

  if (step?.type !== "terminal")
    return <StepShell message="Задание для терминала не найдено." />;

  return (
    <StepShell
      title={step.title}
      description={step.description}
      content={step.code}
      settings={step.settings}
    >
      <div className="flex w-full min-w-0 flex-col gap-5">
        <div className="w-full min-w-0 overflow-hidden rounded-xl border border-[var(--ui-border)]">
          <Terminal
            key={`${params.studyId}:${params.moduleIndex}:${params.levelIndex}:${params.stepIndex}`}
            ref={terminalRef}
            user={study.userId || "student"}
            host="icodeme"
            bodyClassName="!h-[65vh] min-h-[560px] max-h-[780px]"
            onInput={(input) => {
              console.info("[onInput]", input);
            }}
            onCommand={async (command, context) => {
              console.info("[onCommand]", command, context);
              await new Promise((resolve) => setTimeout(resolve, 400));
              return [
                `server@${context.host}: принял «${command}»`,
                `ответ: ${new Date().toLocaleTimeString()}`,
              ];
            }}
          />
        </div>
      </div>
    </StepShell>
  );
}
