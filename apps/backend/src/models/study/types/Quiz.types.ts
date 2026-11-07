import { INotation } from '@core/types/Notation.type';

export interface IQuiz extends INotation {
  questions: IQuestion[];
}

export interface IQuestion extends INotation {
  type: 'abcd' | 'input' | 'code' | 'true/false';
  variants?: IVariant[];
  inputs?: IInput[];
  code?: ICode;
  truefolse?: ITrueFolse;
  errors: IQuestionError[];
}

export interface IVariant {
  char: string;
  content: string;
  isTrue: boolean;
}

export interface IInput {
  label: string;
  input: string;
  correct: string[];
}

export interface ICode {
  code: string;
  correctCode: string[];
  correctResult: string[];
}

export interface ITrueFolse {
  isTrue: boolean;
  correct: boolean;
}

export interface IQuestionError {
  message: string;
}
