import {
  IQuiz,
  IQuestion,
  IVariant,
  IInput,
  ICode,
  ITrueFolse,
  IQuestionError,
} from '../models/quiz.types';
import type { IGeneratedStep } from '../models/study.model';
import { isRecord } from '@core/types/guards/is-record';

export class TypeGuards {
  static isVariant(value: unknown): value is IVariant {
    if (!isRecord(value)) return false;

    return (
      typeof value.char === 'string' &&
      /^[A-Z]$/.test(value.char) &&
      typeof value.content === 'string' &&
      typeof value.isTrue === 'boolean'
    );
  }

  static isInput(value: unknown): value is IInput {
    if (!isRecord(value)) return false;

    return (
      typeof value.label === 'string' &&
      typeof value.input === 'string' &&
      Array.isArray(value.correct) &&
      value.correct.every((item) => typeof item === 'string')
    );
  }

  static isCode(value: unknown): value is ICode {
    if (!isRecord(value)) return false;

    return (
      typeof value.code === 'string' &&
      Array.isArray(value.correctCode) &&
      value.correctCode.every((item) => typeof item === 'string') &&
      Array.isArray(value.correctResult) &&
      value.correctResult.every((item) => typeof item === 'string')
    );
  }

  static isTrueFolse(value: unknown): value is ITrueFolse {
    if (!isRecord(value)) return false;

    return (
      typeof value.isTrue === 'boolean' && typeof value.correct === 'boolean'
    );
  }

  static isQuestionError(value: unknown): value is IQuestionError {
    if (!isRecord(value)) return false;

    return typeof value.message === 'string';
  }

  static isQuestion(value: unknown): value is IQuestion {
    if (!isRecord(value)) return false;

    if (typeof value.title !== 'string' || !value.title.trim()) return false;
    if (typeof value.description !== 'string' || !value.description.trim())
      return false;

    if (typeof value.type !== 'string') return false;
    if (!['abcd', 'input', 'code', 'true/false'].includes(value.type))
      return false;

    if (!Array.isArray(value.errors)) return false;
    if (!value.errors.every((error) => this.isQuestionError(error)))
      return false;

    switch (value.type) {
      case 'abcd':
        return (
          Array.isArray(value.variants) &&
          value.variants.length > 0 &&
          value.variants.every((variant) => this.isVariant(variant))
        );

      case 'input':
        return (
          Array.isArray(value.inputs) &&
          value.inputs.length > 0 &&
          value.inputs.every((input) => this.isInput(input))
        );

      case 'code':
        return this.isCode(value.code);

      case 'true/false':
        return this.isTrueFolse(value.truefolse);

      default:
        return false;
    }
  }

  static isQuiz(value: unknown): value is IQuiz {
    if (!isRecord(value)) return false;

    if (typeof value.title !== 'string' || !value.title.trim()) return false;
    if (typeof value.description !== 'string' || !value.description.trim())
      return false;

    if (!Array.isArray(value.questions)) return false;
    if (value.questions.length === 0) return false;

    return value.questions.every((question) => this.isQuestion(question));
  }

  static isGeneratedStep(value: unknown): value is IGeneratedStep {
    if (!isRecord(value)) return false;

    return (
      typeof value.title === 'string' &&
      value.title.trim().length > 0 &&
      typeof value.description === 'string' &&
      value.description.trim().length > 0 &&
      typeof value.type === 'string' &&
      ['document', 'code', 'test', 'exam'].includes(value.type) &&
      typeof value.experience === 'number' &&
      Number.isFinite(value.experience) &&
      value.experience >= 0
    );
  }

  static isGeneratedStepArray(value: unknown): value is IGeneratedStep[] {
    return (
      Array.isArray(value) && value.every((step) => this.isGeneratedStep(step))
    );
  }
}
