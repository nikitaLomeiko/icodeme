import { INotation } from '@core/types/Notation.type';

export class TypeGuards {
  static isNotation(obj: any): obj is INotation {
    if (!obj || typeof obj !== 'object') return false;

    return (
      typeof obj.title === 'string' &&
      obj.title.trim().length > 0 &&
      typeof obj.description === 'string' &&
      obj.description.trim().length > 0
    );
  }

  static isNotationArray(obj: any): obj is INotation[] {
    return Array.isArray(obj) && obj.every((item) => this.isNotation(item));
  }
}
