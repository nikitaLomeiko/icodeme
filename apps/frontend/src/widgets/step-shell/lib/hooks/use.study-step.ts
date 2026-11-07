"use client";

import { selectStudyPlans, useGetMyStudyByIdQuery } from "@/entities/study";
import { useAppSelector } from "@/shared/lib/hooks";

export interface StudyStepParams {
  studyId?: string;
  moduleIndex?: string;
  levelIndex?: string;
  stepIndex?: string;
}

export function useStudyStep(params: StudyStepParams) {
  const positions = [params.moduleIndex, params.levelIndex, params.stepIndex];

  const indices = positions.map(Number);
  const isValid =
    Boolean(params.studyId) &&
    positions.every((position) => position !== undefined && position !== "") &&
    indices.every((index) => Number.isInteger(index) && index >= 0);

  const plans = useAppSelector(selectStudyPlans);
  const cachedStudy = plans.find((plan) => plan._id === params.studyId);
  const cachedStep = isValid
    ? cachedStudy?.studyPlanJSON?.[indices[0]]?.levels?.[indices[1]]?.steps?.[
        indices[2]
      ]
    : undefined;
  const query = useGetMyStudyByIdQuery(params.studyId ?? "", {
    skip: !isValid || Boolean(cachedStep),
  });
  const study = cachedStep ? cachedStudy : query.data?.data;
  const step = isValid
    ? study?.studyPlanJSON?.[indices[0]]?.levels?.[indices[1]]?.steps?.[
        indices[2]
      ]
    : undefined;

  return {
    ...query,
    isValid,
    isLoading: !cachedStep && query.isLoading,
    isError: !cachedStep && (query.isError || query.data?.success === false),
    study,
    step,
  };
}
