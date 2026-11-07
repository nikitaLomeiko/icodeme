import { IStep } from '@models/study';

export class TypeGuards {
  static isStep(obj: any): obj is IStep {
    if (!obj || typeof obj !== 'object') return false;

    if (typeof obj.title !== 'string' || !obj.title.trim()) return false;
    if (typeof obj.description !== 'string' || !obj.description.trim())
      return false;

    if (typeof obj.type !== 'string') return false;
    if (!['document', 'code', 'test', 'exam'].includes(obj.type)) return false;

    if (typeof obj.experience !== 'number') return false;
    if (obj.experience < 0) return false;

    return true;
  }

  static isStepArray(obj: any): obj is IStep[] {
    return Array.isArray(obj) && obj.every((item) => this.isStep(item));
  }
}
