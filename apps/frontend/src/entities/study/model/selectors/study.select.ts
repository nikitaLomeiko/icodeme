import type { IStudyState } from "../types";

interface StudyStoreState {
  study: IStudyState;
}

export const selectStudyPlans = (state: StudyStoreState) => state.study.plans;
export const selectStudyView = (state: StudyStoreState) => state.study.view;

export const selectCurrentPlan = (state: StudyStoreState) =>
  state.study.currentPlan;
export const selectCurrentPlanIndex = (state: StudyStoreState) =>
  state.study.currentPlanIndex;

export const selectViewedModule = (state: StudyStoreState) =>
  state.study.viewedModule;
export const selectViewedModuleIndex = (state: StudyStoreState) =>
  state.study.viewedModuleIndex;

export const selectCurrentModule = (state: StudyStoreState) =>
  state.study.currentModule;
export const selectCurrentModuleIndex = (state: StudyStoreState) =>
  state.study.currentModuleIndex;

export const selectCurrentLevel = (state: StudyStoreState) =>
  state.study.currentLevel;
export const selectCurrentLevelIndex = (state: StudyStoreState) =>
  state.study.currentLevelIndex;

export const selectCurrentStep = (state: StudyStoreState) =>
  state.study.currentStep;
export const selectCurrentStepIndex = (state: StudyStoreState) =>
  state.study.currentStepIndex;

export const selectSelectedStep = (state: StudyStoreState) =>
  state.study.selectedStep;
export const selectSelectedLevelIndex = (state: StudyStoreState) =>
  state.study.selectedLevelIndex;
export const selectSelectedStepIndex = (state: StudyStoreState) =>
  state.study.selectedStepIndex;
