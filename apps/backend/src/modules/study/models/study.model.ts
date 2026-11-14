import { BaseEntity } from '@core/types/base-entity.abstract';
import { INotation } from '@core/types/notation.type';
import { IQuiz } from './quiz.types';
import { IProjectMeta } from '@modules/project';

export interface IStudy extends BaseEntity, INotation {
  userId: string;
  levelPlanJSON: IPosition[];
  level: IPosition;
  studyPlanJSON: IModule[];
  study: IPlan;
}

export interface IPlan {
  context: string;
  module: number;
  moduleTitle: string;
  level: number;
  levelTitle: string;
  step: number;
}

export interface IPosition {
  experienceToNextLevel: number;
  positionCount: number;
  positionName: string;
}

export interface IModule extends INotation {
  levels: ILevel[];
}

export interface ILevel extends INotation {
  steps: IStep[];
  isCompleted: boolean;
  isCurrent: boolean;
}

export interface ISettings {
  language?: string;
  dockerFile?: string;
  initProject?: IProjectMeta;
  entryFile?: string;
  timeLimitMs?: number;
  memoryLimitMb?: number;
  tests?: {
    stdin: string;
    expectedStdout: string;
  }[];
  startCommand?: string[];
}

export interface IGeneratedStep extends INotation {
  type: 'document' | 'code' | 'test' | 'exam';
  experience: number;
}

export interface IStep extends INotation {
  id: string;
  type: 'document' | 'code' | 'quiz' | 'test' | 'exam' | 'terminal';
  isCompleted: boolean;
  isCurrent: boolean;
  document?: string;
  position: { x: number; y: number };
  code?: string;
  quiz?: IQuiz;
  exam?: IQuiz;
  settings: ISettings;
  experience?: number;
}

export const StudyKey = 'Study';
