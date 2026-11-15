"use client";

import { TerminalSession } from "@/features/terminal-session";
import { useStudyStepData } from "@/widgets/step-shell";

export const TerminalStepPage: React.FC = () => {
  const studyStep = useStudyStepData();
  const { params, study, step } = studyStep;
  if (!study || !step || step.type !== "terminal") return null;

  const sessionKey = `${params.studyId}:${params.moduleIndex}:${params.levelIndex}:${params.stepIndex}`;

  return (
    <div className="flex w-full min-w-0 flex-col gap-5">
      <TerminalSession sessionKey={sessionKey} step={step} study={study} />
    </div>
  );
};
