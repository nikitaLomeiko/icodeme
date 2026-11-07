"use client";

import React, { useRef } from "react";
import { SideBar } from "./components/side.bar";
import {
  selectCurrentPlan,
  selectSelectedLevelIndex,
  selectSelectedStep,
  selectSelectedStepIndex,
  selectViewedModuleIndex,
  StepPage,
  type IStudy,
} from "@/entities/study";
import { ActionsBar } from "./components/actions.bar";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/shared/lib/hooks";
import { PageLoading } from "@/widgets/layout/ui/page-loading";

interface IProps {
  children: React.ReactNode;
  isLoading?: boolean;
  isError?: boolean;
  smoothWheelScroll?: boolean;
  study?: IStudy;
  showCurrentStepButton?: boolean;
}

export const WorkZone: React.FC<IProps> = (props) => {
  const {
    children,
    isLoading,
    isError,
    study,
    showCurrentStepButton = true,
  } = props;

  const router = useRouter();

  const selectedStep = useAppSelector(selectSelectedStep);
  const currentPlan = useAppSelector(selectCurrentPlan);
  const moduleIndex = useAppSelector(selectViewedModuleIndex);
  const levelIndex = useAppSelector(selectSelectedLevelIndex);
  const stepIndex = useAppSelector(selectSelectedStepIndex);

  const contentRef = useRef<HTMLDivElement>(null);

  const handleStartStep = () => {
    if (
      selectedStep == null ||
      currentPlan == null ||
      levelIndex < 0 ||
      stepIndex < 0
    ) {
      return;
    }

    const stepPage = StepPage[selectedStep.type];
    if (!stepPage) return;

    const params = new URLSearchParams({
      studyId: currentPlan._id,
      moduleIndex: String(moduleIndex),
      levelIndex: String(levelIndex),
      stepIndex: String(stepIndex),
    });

    router.push(`${stepPage}?${params.toString()}`);
  };

  return (
    <div className="relative h-full min-h-0 w-full">
      <div
        ref={contentRef}
        className="h-full min-h-0 lg:pr-[440px] pr-[0px]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(128, 128, 128, 0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(128, 128, 128, 0.06) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
          backgroundColor: "var(--ui-background)",
        }}
      >
        {isLoading ? (
          <PageLoading />
        ) : isError ? (
          <p className="p-6 text-[var(--ui-text-muted)]">Нет плана обучения.</p>
        ) : (
          children
        )}
      </div>

      <ActionsBar
        contentRef={contentRef}
        showCurrentStepButton={showCurrentStepButton}
        study={study}
      />

      <SideBar onStartStep={handleStartStep} />
    </div>
  );
};
