"use client";

import { DocumentView } from "@/widgets/document-view";
import { useStudyStepData } from "@/widgets/step-shell";

export const DocumentationStepPage: React.FC = () => {
  const studyStep = useStudyStepData();
  const { params, step } = studyStep;
  const documentStep = step?.type === "document" ? step : undefined;

  if (!documentStep?.document) return null;

  const documentId = `${params.studyId}:${params.moduleIndex}:${params.levelIndex}:${params.stepIndex}`;

  return (
    <DocumentView
      key={documentId}
      documentId={documentId}
      title={documentStep.title}
      content={documentStep.document}
    />
  );
};
