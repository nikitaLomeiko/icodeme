"use client";

import React, { useRef } from "react";
import { SideBar } from "./components/side.bar";
import {
  selectCurrentPlan,
  selectSelectedLevelIndex,
  selectSelectedStep,
  selectSelectedStepIndex,
  selectViewedModuleIndex,
  stepPageRoutes,
  type IStudy,
} from "@/entities/study";
import { ActionsBar } from "./components/actions.bar";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/shared/lib";
import { BottomSheet, Button, PageLoading } from "@/shared/ui/kit";
import { StepIllustration } from "./components/step.illustration";

interface IProps {
  children: React.ReactNode;
  isLoading?: boolean;
  isError?: boolean;
  smoothWheelScroll?: boolean;
  study?: IStudy;
  showCurrentStepButton?: boolean;
  isMobileStepSheetOpen?: boolean;
  onCloseMobileStepSheet?: () => void;
}

export const WorkZone: React.FC<IProps> = (props) => {
  const {
    children,
    isLoading,
    isError,
    study,
    showCurrentStepButton = true,
    isMobileStepSheetOpen = false,
    onCloseMobileStepSheet = () => {},
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

    const stepPage = stepPageRoutes[selectedStep.type];
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

      <div className="lg:hidden">
        <BottomSheet
          isOpen={isMobileStepSheetOpen && Boolean(selectedStep)}
          onClose={onCloseMobileStepSheet}
          title="Информация о шаге"
          variant="dark"
          closeOnOverlayClick
          closeOnEsc
          className="lg:hidden"
          overlayClassName="lg:hidden"
        >
          {selectedStep && (
            <div className="px-5 pb-5">
              <StepIllustration type={selectedStep.type} />
              <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--ui-primary)]">
                {levelIndex >= 0 && stepIndex >= 0
                  ? `Уровень ${levelIndex + 1} · шаг ${stepIndex + 1}`
                  : "Выбранный шаг"}
              </div>
              <h2 className="mt-1 text-xl font-bold text-[var(--ui-text)]">
                {selectedStep.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-[var(--ui-text-muted)]">
                {selectedStep.description}
              </p>
              {selectedStep.isCompleted && (
                <p className="mt-3 text-xs font-semibold text-[var(--ui-primary)]">
                  Пройдено
                </p>
              )}
              <Button
                size="lg"
                fullWidth
                className="mt-5"
                disabled={!currentPlan || levelIndex < 0 || stepIndex < 0}
                onClick={handleStartStep}
              >
                Перейти
              </Button>
            </div>
          )}
        </BottomSheet>
      </div>
    </div>
  );
};
