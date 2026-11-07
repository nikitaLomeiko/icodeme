import {
  IQuiz,
  IQuestion,
  IVariant,
  IInput,
  ICode,
  ITrueFolse,
  IQuestionError,
} from '../types/Quiz.types';

export class TypeGuards {
  static isVariant(obj: any): obj is IVariant {
    if (!obj || typeof obj !== 'object') return false;

    return (
      typeof obj.char === 'string' &&
      /^[A-Z]$/.test(obj.char) &&
      typeof obj.content === 'string' &&
      typeof obj.isTrue === 'boolean'
    );
  }

  static isInput(obj: any): obj is IInput {
    if (!obj || typeof obj !== 'object') return false;

    return (
      typeof obj.label === 'string' &&
      typeof obj.input === 'string' &&
      Array.isArray(obj.correct) &&
      obj.correct.every((item: any) => typeof item === 'string')
    );
  }

  static isCode(obj: any): obj is ICode {
    if (!obj || typeof obj !== 'object') return false;

    return (
      typeof obj.code === 'string' &&
      Array.isArray(obj.correctCode) &&
      obj.correctCode.every((item: any) => typeof item === 'string') &&
      Array.isArray(obj.correctResult) &&
      obj.correctResult.every((item: any) => typeof item === 'string')
    );
  }

  static isTrueFolse(obj: any): obj is ITrueFolse {
    if (!obj || typeof obj !== 'object') return false;

    return typeof obj.isTrue === 'boolean' && typeof obj.correct === 'boolean';
  }

  static isQuestionError(obj: any): obj is IQuestionError {
    if (!obj || typeof obj !== 'object') return false;

    return typeof obj.message === 'string';
  }

  static isQuestion(obj: any): obj is IQuestion {
    if (!obj || typeof obj !== 'object') return false;

    if (typeof obj.title !== 'string' || !obj.title.trim()) return false;
    if (typeof obj.description !== 'string' || !obj.description.trim())
      return false;

    if (typeof obj.type !== 'string') return false;
    if (!['abcd', 'input', 'code', 'true/false'].includes(obj.type))
      return false;

    if (!Array.isArray(obj.errors)) return false;
    if (!obj.errors.every((e: any) => this.isQuestionError(e))) return false;

    switch (obj.type) {
      case 'abcd':
        return (
          Array.isArray(obj.variants) &&
          obj.variants.length > 0 &&
          obj.variants.every((v: any) => this.isVariant(v))
        );

      case 'input':
        return (
          Array.isArray(obj.inputs) &&
          obj.inputs.length > 0 &&
          obj.inputs.every((i: any) => this.isInput(i))
        );

      case 'code':
        return this.isCode(obj.code);

      case 'true/false':
        return this.isTrueFolse(obj.truefolse);

      default:
        return false;
    }
  }

  static isQuiz(obj: any): obj is IQuiz {
    if (!obj || typeof obj !== 'object') return false;

    if (typeof obj.title !== 'string' || !obj.title.trim()) return false;
    if (typeof obj.description !== 'string' || !obj.description.trim())
      return false;

    if (!Array.isArray(obj.questions)) return false;
    if (obj.questions.length === 0) return false;

    return obj.questions.every((q: any) => this.isQuestion(q));
  }
}
