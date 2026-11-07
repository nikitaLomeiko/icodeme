import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type {
  IStudy,
  IStudyState,
  IStudyStepSelection,
  IStudyView,
} from "../types";

const initialState: IStudyState = {
  plans: [],
  view: { studyId: null, moduleIndex: 0 },
  currentPlanIndex: -1,
  currentPlan: null,
  viewedModuleIndex: 0,
  viewedModule: null,
  currentModuleIndex: -1,
  currentModule: null,
  currentLevelIndex: -1,
  currentLevel: null,
  currentStepIndex: -1,
  currentStep: null,
  selectedLevelIndex: -1,
  selectedStepIndex: -1,
  selectedStep: null,
};

const clearSelectedStep = (state: IStudyState) => {
  state.selectedLevelIndex = -1;
  state.selectedStepIndex = -1;
  state.selectedStep = null;
};

const syncCurrentStudy = (state: IStudyState) => {
  const requestedIndex = state.plans.findIndex(
    (plan) => plan._id === state.view.studyId,
  );
  const firstPlanIndex = state.plans.length > 0 ? 0 : -1;
  state.currentPlanIndex =
    requestedIndex >= 0 ? requestedIndex : firstPlanIndex;
  state.currentPlan = state.plans[state.currentPlanIndex] ?? null;
  state.viewedModuleIndex = state.view.moduleIndex;
  state.viewedModule =
    state.currentPlan?.studyPlanJSON[state.viewedModuleIndex] ?? null;

  const progressModuleIndex = state.currentPlan?.study.module ?? -1;
  state.currentModule =
    state.currentPlan?.studyPlanJSON[progressModuleIndex] ?? null;
  state.currentModuleIndex = state.currentModule ? progressModuleIndex : -1;
  state.currentLevelIndex =
    state.currentModule?.levels.findIndex((level) => level.isCurrent) ?? -1;
  state.currentLevel =
    state.currentModule?.levels[state.currentLevelIndex] ?? null;
  state.currentStepIndex =
    state.currentLevel?.steps.findIndex((step) => step.isCurrent) ?? -1;
  state.currentStep =
    state.currentLevel?.steps[state.currentStepIndex] ?? null;

  state.selectedStep =
    state.viewedModule?.levels[state.selectedLevelIndex]?.steps[
      state.selectedStepIndex
    ] ?? null;
  if (!state.selectedStep) clearSelectedStep(state);
};

export const StudySlice = createSlice({
  name: "study",
  initialState,
  reducers: {
    setStudyPlans: (state, action: PayloadAction<IStudy[]>) => {
      state.plans = action.payload;
      syncCurrentStudy(state);
    },
    setStudyView: (state, action: PayloadAction<IStudyView>) => {
      if (
        state.view.studyId !== action.payload.studyId ||
        state.view.moduleIndex !== action.payload.moduleIndex
      ) {
        clearSelectedStep(state);
      }
      state.view = action.payload;
      syncCurrentStudy(state);
    },
    selectStudyStep: (state, action: PayloadAction<IStudyStepSelection>) => {
      state.selectedLevelIndex = action.payload.levelIndex;
      state.selectedStepIndex = action.payload.stepIndex;
      state.selectedStep =
        state.viewedModule?.levels[action.payload.levelIndex]?.steps[
          action.payload.stepIndex
        ] ?? null;
      if (!state.selectedStep) clearSelectedStep(state);
    },
    clearSelectedStudyStep: (state) => {
      clearSelectedStep(state);
    },
    resetStudyState: () => initialState,
  },
});

export const {
  setStudyPlans,
  setStudyView,
  selectStudyStep,
  clearSelectedStudyStep,
  resetStudyState,
} = StudySlice.actions;
export const studySliceReducer = StudySlice.reducer;
