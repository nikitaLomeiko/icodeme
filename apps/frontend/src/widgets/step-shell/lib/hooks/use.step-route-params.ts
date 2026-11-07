"use client";

import { useSearchParams } from "next/navigation";
import { StudyStepParams } from "./use.study-step";

export function useStepRouteParams(): StudyStepParams {
  const params = useSearchParams();
  return {
    studyId: params.get("studyId") ?? undefined,
    moduleIndex: params.get("moduleIndex") ?? undefined,
    levelIndex: params.get("levelIndex") ?? undefined,
    stepIndex: params.get("stepIndex") ?? undefined,
  };
}
