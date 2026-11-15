"use client";

import { DocumentView } from "@/widgets/document-view";
import { StepShell } from "../step-shell";
import { useStepRouteParams, useStudyStep } from "../lib/hooks";
import { GenerateStepContent } from "./generate-step-content";

export const DocumentationStepView: React.FC = () => {
  const params = useStepRouteParams();
  const { isValid, isLoading, isError, study, step } = useStudyStep(params);
  const documentStep = step?.type === "document" ? step : undefined;

  if (!isValid) return <StepShell message="Некорректная ссылка на шаг." />;
  if (isLoading) return <StepShell loading />;
  if (isError || !study)
    return <StepShell message="Не удалось загрузить план обучения." />;
  if (documentStep && !documentStep.document)
    return (
      <StepShell>
        <GenerateStepContent params={params} kind="document" />
      </StepShell>
    );
  if (!documentStep?.document)
    return <StepShell message="Документация для этого шага не найдена." />;

  const documentId = `${params.studyId}:${params.moduleIndex}:${params.levelIndex}:${params.stepIndex}`;

  return (
    <StepShell
      title={documentStep.title}
      description={documentStep.description}
    >
      <DocumentView
        key={documentId}
        documentId={documentId}
        title={documentStep.title}
        content={documentStep.document}
      />
    </StepShell>
  );
};
