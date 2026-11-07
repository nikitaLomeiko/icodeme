import type { RootState } from "@/app/providers/redux-store";

export const selectStudyPlans = (state: RootState) => state.study.plans;
export const selectStudyView = (state: RootState) => state.study.view;

export const selectCurrentPlan = (state: RootState) => state.study.currentPlan;
export const selectCurrentPlanIndex = (state: RootState) =>
  state.study.currentPlanIndex;

export const selectViewedModule = (state: RootState) => state.study.viewedModule;
export const selectViewedModuleIndex = (state: RootState) =>
  state.study.viewedModuleIndex;

export const selectCurrentModule = (state: RootState) =>
  state.study.currentModule;
export const selectCurrentModuleIndex = (state: RootState) =>
  state.study.currentModuleIndex;

export const selectCurrentLevel = (state: RootState) => state.study.currentLevel;
export const selectCurrentLevelIndex = (state: RootState) =>
  state.study.currentLevelIndex;

export const selectCurrentStep = (state: RootState) => state.study.currentStep;
export const selectCurrentStepIndex = (state: RootState) =>
  state.study.currentStepIndex;

export const selectSelectedStep = (state: RootState) => state.study.selectedStep;
export const selectSelectedLevelIndex = (state: RootState) =>
  state.study.selectedLevelIndex;
export const selectSelectedStepIndex = (state: RootState) =>
  state.study.selectedStepIndex;
