"use client";

import { Document } from "@/entities/document";
import {
  StepShell,
  useStepRouteParams,
  useStudyStep,
} from "@/widgets/step-shell";

export function DocumentationStepPage() {
  const params = useStepRouteParams();
  const { isValid, isLoading, isError, study, step } = useStudyStep(params);
  const documentStep = step?.type === "document" ? step : undefined;

  if (!isValid) return <StepShell message="Некорректная ссылка на шаг." />;

  if (isLoading) return <StepShell loading />;

  if (isError || !study)
    return <StepShell message="Не удалось загрузить план обучения." />;

  if (!documentStep?.document)
    return <StepShell message="Документация для этого шага не найдена." />;

  return (
    <StepShell
      title={documentStep.title}
      description={documentStep.description}
    >
      <Document
        key={`${params.studyId}:${params.moduleIndex}:${params.levelIndex}:${params.stepIndex}`}
        documentId={`${params.studyId}:${params.moduleIndex}:${params.levelIndex}:${params.stepIndex}`}
        title={documentStep.title}
        content={documentStep.document}
      />
    </StepShell>
  );
}
