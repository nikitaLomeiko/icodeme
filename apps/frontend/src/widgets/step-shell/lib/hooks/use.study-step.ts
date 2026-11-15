"use client";

import { useGetStudyByIdQuery } from "@/entities/study";

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
    isLoading: query.isLoading || query.isFetching,
    isError: query.isError || query.data?.success === false,
    study,
    step,
  };
}
