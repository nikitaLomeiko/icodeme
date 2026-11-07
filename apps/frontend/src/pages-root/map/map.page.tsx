"use client";

import {
  Module,
  setStudyPlans,
  setStudyView,
  useGetMyStudyQuery,
} from "@/entities/study";
import { useAppDispatch } from "@/shared/lib/hooks";
import { StudyNav, WorkZone } from "@/widgets/study-view";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

export const MapPage = () => {
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const { data, isLoading, isError } = useGetMyStudyQuery(null);
  const studies = data?.data ?? [];
  const selectedStudyId = searchParams.get("studyId");
  const selectedStudy =
    studies.find((study) => study._id === selectedStudyId) ?? studies[0];
  const modules = selectedStudy?.studyPlanJSON ?? [];
  const storedModuleIndex = selectedStudy?.study.module ?? 0;
  const currentModuleIndex = modules[storedModuleIndex] ? storedModuleIndex : 0;

  useEffect(() => {
    if (isError || data?.success === false) {
      dispatch(setStudyPlans([]));
    } else if (data?.data) {
      dispatch(setStudyPlans(data.data));
    }
  }, [data, dispatch, isError]);

  useEffect(() => {
    dispatch(
      setStudyView({
        studyId: selectedStudyId,
        moduleIndex: selectedStudy?.study.module ?? 0,
      }),
    );
  }, [dispatch, selectedStudyId, selectedStudy?.study.module]);

  return (
    <>
      {studies.length > 1 && <StudyNav />}

      <WorkZone
        isLoading={isLoading}
        isError={isError || data?.success === false}
        study={selectedStudy}
      >
        {selectedStudy && (
          <div className="w-full px-4 py-6">
            <div className="mb-8">
              <div className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--ui-text-muted)]">
                Карта обучения
              </div>
              <h1 className="mt-2 text-3xl font-black">
                {selectedStudy.title}
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--ui-text-muted)]">
                {selectedStudy.description}
              </p>
            </div>

            <div className="space-y-4">
              {modules.map((item, index) => (
                <Module
                  key={item.id ?? index}
                  {...item}
                  index={index + 1}
                  href={`/?studyId=${encodeURIComponent(selectedStudy._id)}&moduleIndex=${index}`}
                  levelsCount={item.levels.length}
                  isCurrent={index === currentModuleIndex}
                  isCompleted={
                    item.isCompleted === true ||
                    (item.levels.length > 0 &&
                      item.levels.every(
                        (level) =>
                          level.isCompleted === true ||
                          (level.steps.length > 0 &&
                            level.steps.every((step) => step.isCompleted)),
                      ))
                  }
                />
              ))}
            </div>
          </div>
        )}
      </WorkZone>
    </>
  );
};
