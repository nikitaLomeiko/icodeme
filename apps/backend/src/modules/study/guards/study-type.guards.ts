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
  private static bounded(value: unknown, max: number): value is string {
    return typeof value === 'string' && value.length <= max;
  }

  static isVariant(value: unknown): value is IVariant {
    if (!isRecord(value)) return false;

    return (
      typeof value.char === 'string' &&
      /^[A-Z]$/.test(value.char) &&
      this.bounded(value.content, 2000) &&
      typeof value.isTrue === 'boolean'
    );
  }

  static isInput(value: unknown): value is IInput {
    if (!isRecord(value)) return false;

    return (
      this.bounded(value.label, 200) &&
      this.bounded(value.input, 2000) &&
      Array.isArray(value.correct) &&
      value.correct.length <= 20 &&
      value.correct.every((item) => this.bounded(item, 2000))
    );
  }

  static isCode(value: unknown): value is ICode {
    if (!isRecord(value)) return false;

    return (
      this.bounded(value.code, 10000) &&
      Array.isArray(value.correctCode) &&
      value.correctCode.length <= 20 &&
      value.correctCode.every((item) => this.bounded(item, 10000)) &&
      Array.isArray(value.correctResult) &&
      value.correctResult.length <= 20 &&
      value.correctResult.every((item) => this.bounded(item, 2000))
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

    return this.bounded(value.message, 2000);
  }

  static isQuestion(value: unknown): value is IQuestion {
    if (!isRecord(value)) return false;

    if (!this.bounded(value.title, 200) || !value.title.trim()) return false;
    if (!this.bounded(value.description, 2000) || !value.description.trim())
      return false;

    if (typeof value.type !== 'string') return false;
    if (!['abcd', 'input', 'code', 'true/false'].includes(value.type))
      return false;

    if (!Array.isArray(value.errors)) return false;
    if (value.errors.length > 20) return false;
    if (!value.errors.every((error) => this.isQuestionError(error)))
      return false;

    switch (value.type) {
      case 'abcd':
        return (
          Array.isArray(value.variants) &&
          value.variants.length > 0 &&
          value.variants.length <= 20 &&
          value.variants.every((variant) => this.isVariant(variant))
        );

      case 'input':
        return (
          Array.isArray(value.inputs) &&
          value.inputs.length > 0 &&
          value.inputs.length <= 20 &&
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

    if (!this.bounded(value.title, 200) || !value.title.trim()) return false;
    if (!this.bounded(value.description, 2000) || !value.description.trim())
      return false;

    if (!Array.isArray(value.questions)) return false;
    if (value.questions.length === 0) return false;
    if (value.questions.length > 50) return false;

    return value.questions.every((question) => this.isQuestion(question));
  }

  static isGeneratedStep(value: unknown): value is IGeneratedStep {
    if (!isRecord(value)) return false;

    return (
      typeof value.title === 'string' &&
      value.title.trim().length > 0 &&
      value.title.length <= 200 &&
      typeof value.description === 'string' &&
      value.description.trim().length > 0 &&
      value.description.length <= 2000 &&
      typeof value.type === 'string' &&
      ['document', 'code', 'test', 'exam'].includes(value.type) &&
      typeof value.experience === 'number' &&
      Number.isFinite(value.experience) &&
      value.experience >= 0 &&
      value.experience <= 10000
    );
  }

  static isGeneratedStepArray(value: unknown): value is IGeneratedStep[] {
    return (
      Array.isArray(value) &&
      value.length > 0 &&
      value.length <= 50 &&
      value.every((step) => this.isGeneratedStep(step))
    );
  }
}
