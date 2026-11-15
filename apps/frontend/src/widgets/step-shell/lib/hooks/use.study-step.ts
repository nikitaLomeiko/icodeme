"use client";

import { useGetStudyByIdQuery } from "@/entities/study";
import type { IStep, IStudy } from "@/entities/study";

export interface StudyStepParams {
  studyId?: string;
  moduleIndex?: string;
  levelIndex?: string;
  stepIndex?: string;
}

export interface StudyStepPageData {
  params: StudyStepParams;
  isValid: boolean;
  isLoading: boolean;
  isError: boolean;
  study?: IStudy;
  step?: IStep;
}

export function useStudyStep(params: StudyStepParams) {
  const positions = [params.moduleIndex, params.levelIndex, params.stepIndex];

  const indices = positions.map(Number);
  const isValid =
    Boolean(params.studyId) &&
    positions.every((position) => position !== undefined && position !== "") &&
    indices.every((index) => Number.isInteger(index) && index >= 0);

  const query = useGetStudyByIdQuery(params.studyId ?? "", {
    skip: !isValid,
    refetchOnMountOrArgChange: true,
  });
  const study = query.data?.data;
  const step = isValid
    ? study?.studyPlanJSON?.[indices[0]]?.levels?.[indices[1]]?.steps?.[
        indices[2]
      ]
    : undefined;

  return {
    ...query,
    isValid,
    // Keep the current step mounted while RTK Query refreshes stale study data.
    isLoading: query.isLoading,
    isError: (query.isError && !query.data) || query.data?.success === false,
    study,
    step,
  };
}
