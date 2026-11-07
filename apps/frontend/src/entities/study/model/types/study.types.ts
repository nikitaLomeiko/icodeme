import { IProjectMeta } from "@/entities/ide/model/types/ide.types";
import { IQuiz } from "./quiz.types";

export interface IStudy extends INotation {
  _id: string;
  userId: string;
  levelPlanJSON: IPosition[];
  level: IPosition;
  studyPlanJSON: IModule[];
  study: IPlan;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IPosition {
  experienceToNextLevel: number;
  positionCount: number;
  positionName: string;
}

export interface IPlan {
  context: string;
  module: number;
  moduleTitle: string;
  level: number;
  levelTitle: string;
  step: number;
}

export interface IModule extends INotation {
  id?: string;
  isCompleted?: boolean;
  isCurrent?: boolean;
  levels: ILevel[];
}

export interface ILevel extends INotation {
  id?: string;
  isCompleted?: boolean;
  isCurrent?: boolean;
  steps: IStep[];
}

export interface IStep extends INotation {
  id?: string;
  isCompleted?: boolean;
  isCurrent?: boolean;
  type: StepType;
  position?: { x: number; y: number };
  document?: string;
  code?: string;
  quiz?: IQuiz;
  exam?: IQuiz;
  settings: ISettings;
}

export interface ISettings {
  language?: string;
  initProject?: IProjectMeta;
  entryFile?: string;
  timeLimitMs?: number;
  memoryLimitMb?: number;
}

export interface IStepByLevel {
  step: IStep;
  levelId: string;
  stepIndexInLevel: number;
}

export type StepType =
  | "document"
  | "code"
  | "terminal"
  | "quiz"
  | "test"
  | "exam";

export interface INotation {
  title: string;
  description: string;
}
