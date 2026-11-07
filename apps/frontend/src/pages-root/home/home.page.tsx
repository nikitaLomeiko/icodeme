"use client";

import {
  selectStudyStep,
  selectStudyPlans,
  selectCurrentPlan,
  selectViewedModule,
  selectViewedModuleIndex,
  setStudyPlans,
  setStudyView,
  useGetMyStudyQuery,
} from "@/entities/study";
import { useAppDispatch, useAppSelector } from "@/shared/lib/hooks";
import { StudyModuleMap, StudyNav, WorkZone } from "@/widgets/study-view";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

export const HomePage = () => {
  const searchParams = useSearchParams();

  const dispatch = useAppDispatch();

  const { data, isLoading, isError } = useGetMyStudyQuery(null);

  const studyId = searchParams.get("studyId");
  const moduleIndex = Number(searchParams.get("moduleIndex"));

  const studies = useAppSelector(selectStudyPlans);
  const selectedStudy = useAppSelector(selectCurrentPlan);
  const activeModule = useAppSelector(selectViewedModule);
  const activeModuleIndex = useAppSelector(selectViewedModuleIndex);

  useEffect(() => {
    if (isError || data?.success === false) {
      dispatch(setStudyPlans([]));
    } else if (data?.data) {
      dispatch(setStudyPlans(data.data));
    }
  }, [data, dispatch, isError]);

  useEffect(() => {
    dispatch(setStudyView({ studyId, moduleIndex }));
  }, [dispatch, studyId, moduleIndex]);

  return (
    <>
      {studies.length > 1 && selectedStudy && <StudyNav />}

      <WorkZone
        key={`${selectedStudy?._id ?? ""}:${activeModuleIndex}`}
        isLoading={isLoading}
        isError={isError || data?.success === false}
        study={selectedStudy ?? undefined}
      >
        {activeModule && (
          <StudyModuleMap
            module={activeModule}
            moduleIndex={activeModuleIndex}
            onSelectStep={(levelIndex, stepIndex) => {
              dispatch(selectStudyStep({ levelIndex, stepIndex }));
            }}
          />
        )}
      </WorkZone>
    </>
  );
};
