"use client";

import { IDE } from "@/entities/ide";
import {
  StepShell,
  useStepRouteParams,
  useStudyStep,
} from "@/widgets/step-shell";

const defaultEntryFiles: Record<string, string> = {
  bash: "main.sh",
  c: "main.c",
  cpp: "main.cpp",
  go: "main.go",
  java: "Main.java",
  javascript: "index.js",
  python: "main.py",
  rust: "main.rs",
  typescript: "index.ts",
};

export function CodeStepPage() {
  const params = useStepRouteParams();

  const { isValid, isLoading, isError, study, step } = useStudyStep(params);

  if (!isValid) return <StepShell message="Некорректная ссылка на шаг." />;

  if (isLoading) return <StepShell loading />;

  if (isError || !study)
    return <StepShell message="Не удалось загрузить план обучения." />;

  if (!step || (step.type !== "code" && step.type !== "exam") || !step.code) {
    return <StepShell message="Задание для этого шага не найдено." />;
  }

  const language =
    step.settings?.language ?? step.settings?.initProject?.language ?? "python";
  const entryFile =
    step.settings?.entryFile ??
    defaultEntryFiles[language.toLowerCase()] ??
    "main.txt";
  const projectMeta = {
    name:
      step.settings?.initProject?.name ??
      `study-${params.studyId}-${params.moduleIndex}-${params.levelIndex}-${params.stepIndex}`,
    title: step.settings?.initProject?.title ?? step.title,
    subtitle: step.settings?.initProject?.subtitle ?? step.description,
    language,
  };
  const runtimeSettings = {
    ...step.settings,
    language,
    entryFile,
  };

  return (
    <StepShell
      title={step.title}
      description={step.description}
      content={step.code}
      settings={runtimeSettings}
    >
      <div className="flex w-full min-w-0 flex-col gap-5">
        <div className="w-full min-w-0 overflow-hidden rounded-xl border border-[var(--ui-border)]">
          <IDE
            stepId={step.id || "-1"}
            key={`${params.studyId}:${params.moduleIndex}:${params.levelIndex}:${params.stepIndex}`}
            userId={study?.userId ?? ""}
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
    </StepShell>
  );
}
