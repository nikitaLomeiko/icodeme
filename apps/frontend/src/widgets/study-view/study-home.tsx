"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  selectCurrentPlan,
  selectStudyPlans,
  selectStudyStep,
  selectViewedModule,
  selectViewedModuleIndex,
  setStudyPlans,
  setStudyView,
  useGetStudiesQuery,
} from "@/entities/study";
import { useAppDispatch, useAppSelector } from "@/shared/lib";
import { StudyModuleMap } from "./study-module-map";
import { StudyNav } from "./study.nav";
import { WorkZone } from "./work-zone";

export const StudyHome: React.FC = () => {
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const { data, isLoading, isError } = useGetStudiesQuery(null);
  const studyId = searchParams.get("studyId");
  const moduleIndex = Number(searchParams.get("moduleIndex"));
  const studies = useAppSelector(selectStudyPlans);
  const selectedStudy = useAppSelector(selectCurrentPlan);
  const activeModule = useAppSelector(selectViewedModule);
  const activeModuleIndex = useAppSelector(selectViewedModuleIndex);

  useEffect(() => {
    if (isError || data?.success === false) dispatch(setStudyPlans([]));
    else if (data?.data) dispatch(setStudyPlans(data.data));
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
