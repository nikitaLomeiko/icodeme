import { INotation } from '@core/types/notation.type';
import { isRecord } from './is-record';

export class TypeGuards {
  static isNotation(value: unknown): value is INotation {
    if (!isRecord(value)) return false;

    return (
      typeof value.title === 'string' &&
      value.title.trim().length > 0 &&
      typeof value.description === 'string' &&
      value.description.trim().length > 0
    );
  }

  static isNotationArray(value: unknown): value is INotation[] {
    return Array.isArray(value) && value.every((item) => this.isNotation(item));
  }
}
