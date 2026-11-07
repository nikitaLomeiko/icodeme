import type { ILevel, IModule, IStep, IStudy } from "./study.types";

export interface IStudyView {
  studyId: string | null;
  moduleIndex: number;
}

export interface IStudyStepSelection {
  levelIndex: number;
  stepIndex: number;
}

export interface IStudyState {
  plans: IStudy[];
  view: IStudyView;
  currentPlanIndex: number;
  currentPlan: IStudy | null;
  viewedModuleIndex: number;
  viewedModule: IModule | null;
  currentModuleIndex: number;
  currentModule: IModule | null;
  currentLevelIndex: number;
  currentLevel: ILevel | null;
  currentStepIndex: number;
  currentStep: IStep | null;
  selectedLevelIndex: number;
  selectedStepIndex: number;
  selectedStep: IStep | null;
}
