"use client";

import { useState } from "react";
import {
  type IStudy,
  useGenerateModulesMutation,
  useGenerateLevelsMutation,
  useGenerateStepsMutation,
} from "@/entities/study";

interface Props {
  study: IStudy;
  moduleIndex: number;
}

export const StudyGenerationPanel = ({ study, moduleIndex }: Props) => {
  const [generateModules, modulesState] = useGenerateModulesMutation();
  const [generateLevels, levelsState] = useGenerateLevelsMutation();
  const [generateSteps, stepsState] = useGenerateStepsMutation();
  const [error, setError] = useState<string | null>(null);
  const viewedModule = study.studyPlanJSON[moduleIndex];
  const missingLevelIndex =
    viewedModule?.levels.findIndex((level) => level.steps.length === 0) ?? -1;
  const pending =
    modulesState.isLoading || levelsState.isLoading || stepsState.isLoading;
  const action =
    study.studyPlanJSON.length === 0
      ? {
          label: "Создать модули",
          run: () => generateModules(study._id).unwrap(),
        }
      : viewedModule && viewedModule.levels.length === 0
        ? {
            label: "Создать уровни",
            run: () =>
              generateLevels({ studyId: study._id, moduleIndex }).unwrap(),
          }
        : missingLevelIndex >= 0
          ? {
              label: `Создать шаги уровня ${missingLevelIndex + 1}`,
              run: () =>
                generateSteps({
                  studyId: study._id,
                  moduleIndex,
                  levelIndex: missingLevelIndex,
                }).unwrap(),
            }
          : null;

  if (!action) return null;

  return (
    <div className="m-4 rounded-xl border border-[var(--ui-border)] p-4">
      <p className="mb-3 text-sm text-[var(--ui-text-muted)]">
        Продолжите создание плана обучения.
      </p>
      <button
        type="button"
        disabled={pending}
        className="rounded-lg bg-[var(--ui-primary)] px-4 py-2 text-white disabled:opacity-50"
        onClick={async () => {
          setError(null);
          try {
            await action.run();
          } catch {
            setError("Не удалось создать содержимое. Повторите попытку позже.");
          }
        }}
      >
        {pending ? "Создание..." : action.label}
      </button>
      {error && (
        <p role="alert" className="mt-2 text-sm text-red-500">
          {error}
        </p>
      )}
    </div>
  );
};
