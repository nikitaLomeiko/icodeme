import { INotation } from '@core/types/notation.type';
import { isRecord } from './is-record';

export class TypeGuards {
  static isNotation(value: unknown): value is INotation {
    if (!isRecord(value)) return false;

    return (
      typeof value.title === 'string' &&
      value.title.trim().length > 0 &&
      value.title.length <= 200 &&
      typeof value.description === 'string' &&
      value.description.trim().length > 0 &&
      value.description.length <= 2000
    );
  }

  static isNotationArray(value: unknown): value is INotation[] {
    return (
      Array.isArray(value) &&
      value.length > 0 &&
      value.length <= 30 &&
      value.every((item) => this.isNotation(item))
    );
  }
}
