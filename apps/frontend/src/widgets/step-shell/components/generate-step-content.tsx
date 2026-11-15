"use client";

import { useState } from "react";
import {
  useGenerateDocumentationMutation,
  useGeneratePracticeMutation,
  useGenerateQuizMutation,
} from "@/entities/study";
import type { StudyStepParams } from "../lib/hooks/use.study-step";

interface Props {
  params: StudyStepParams;
  kind: "document" | "code" | "quiz";
}

export const GenerateStepContent = ({ params, kind }: Props) => {
  const [generateDocumentation, docState] = useGenerateDocumentationMutation();
  const [generatePractice, codeState] = useGeneratePracticeMutation();
  const [generateQuiz, quizState] = useGenerateQuizMutation();
  const [error, setError] = useState(false);
  const pending =
    docState.isLoading || codeState.isLoading || quizState.isLoading;
  const label =
    kind === "document"
      ? "Создать документацию"
      : kind === "code"
        ? "Создать задание"
        : "Создать тест";

  return (
    <div className="p-6">
      <button
        type="button"
        disabled={pending}
        className="rounded-lg bg-[var(--ui-primary)] px-4 py-2 text-white disabled:opacity-50"
        onClick={async () => {
          setError(false);
          const location = {
            studyId: params.studyId!,
            moduleIndex: Number(params.moduleIndex),
            levelIndex: Number(params.levelIndex),
            stepIndex: Number(params.stepIndex),
          };
          try {
            if (kind === "document")
              await generateDocumentation(location).unwrap();
            else if (kind === "code") await generatePractice(location).unwrap();
            else await generateQuiz(location).unwrap();
          } catch {
            setError(true);
          }
        }}
      >
        {pending ? "Создание..." : label}
      </button>
      {error && (
        <p role="alert" className="mt-2 text-sm text-red-500">
          Не удалось создать содержимое шага.
        </p>
      )}
    </div>
  );
};
