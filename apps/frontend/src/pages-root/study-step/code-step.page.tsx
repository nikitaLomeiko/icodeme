"use client";

import { IdeWidget } from "@/widgets/ide";
import { useStudyStepData } from "@/widgets/step-shell";

export const CodeStepPage: React.FC = () => {
  const studyStep = useStudyStepData();
  const { params, study, step } = studyStep;
  if (!study || !step || step.type !== "code" || !step.code) return null;

  const language = step.settings?.language ?? "python";
  const entryFile = step.settings?.entryFile ?? "main.py";
  const projectMeta = {
    name:
      step.settings?.initProject?.name ??
      `study-${params.studyId}-${params.moduleIndex}-${params.levelIndex}-${params.stepIndex}`,
    title: step.settings?.initProject?.title ?? step.title,
    subtitle: step.settings?.initProject?.subtitle ?? step.description,
    language,
  };

  return (
    <div className="flex w-full min-w-0 flex-col gap-5">
      <div className="w-full min-w-0 overflow-hidden rounded-xl border border-[var(--ui-border)]">
        <IdeWidget
          stepId={step.id || "-1"}
          key={`${params.studyId}:${params.moduleIndex}:${params.levelIndex}:${params.stepIndex}`}
          userId={study.userId}
          meta={projectMeta}
          initialFiles={[
            {
              id: "main",
              name: entryFile,
              type: "file",
              content: "",
              children: [],
            },
          ]}
          className="h-[85vh] min-h-[650px]"
        />
      </div>
    </div>
  );
};
