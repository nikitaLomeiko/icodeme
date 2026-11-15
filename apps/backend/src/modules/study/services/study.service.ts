import { ILevel, IModule, IQuiz, IStep, IStudy, StudyKey } from '../models';
import { Injectable } from '@nestjs/common';
import { IServiceResponse } from '@core/types/response.type';
import { StudyError } from '../types';
import { Collection, Db, Filter } from 'mongodb';
import { BaseMongoRepository } from '@core/database';
import { generateId } from '@core/helpers/generate-id';
import { randomUUID } from 'crypto';

@Injectable()
export class StudyService {
  private readonly repositoryStudy: BaseMongoRepository<IStudy>;
  private readonly collection: Collection<IStudy>;
  private readonly contentCollection: Collection<{
    _id: string;
    userId: string;
    studyId: string;
    stepId: string;
    kind: 'document' | 'code' | 'quiz';
    value: string | IQuiz;
    updatedAt: Date;
  }>;

  constructor(db: Db) {
    this.collection = db.collection<IStudy>(StudyKey);
    this.contentCollection = db.collection('studyStepContent');
    this.repositoryStudy = new BaseMongoRepository<IStudy>(
      db.collection(StudyKey),
    );
  }

  async getStudiesByUserId(
    userId: string,
  ): Promise<IServiceResponse<IStudy[], StudyError>> {
    const study = await this.repositoryStudy.find({ userId });

    return { success: true, data: study.map((item) => this.withStepIds(item)) };
  }

  async getStudyByIdAndUserId(
    studyId: string,
    userId: string,
  ): Promise<IServiceResponse<IStudy, StudyError>> {
    const study = await this.repositoryStudy.findOne({
      _id: studyId,
      userId,
    });

    if (!study) {
      return { success: false, error: StudyError.STUDY_NOT_FOUND };
    }

    return {
      success: true,
      data: await this.withContent(this.withStepIds(study)),
    };
  }

  async getStepByIdAndUserId(
    stepId: string,
    userId: string,
  ): Promise<IStep | null> {
    const storedStudy = await this.collection.findOne({
      userId,
      'studyPlanJSON.levels.steps.id': stepId,
    } as Filter<IStudy>);
    if (!storedStudy) return null;
    const study = this.withStepIds(storedStudy);
    for (const module of study.studyPlanJSON) {
      for (const level of module.levels) {
        const step = level.steps.find((item) => item.id === stepId);
        if (step) return step;
      }
    }

    return null;
  }

  private withStepIds(study: IStudy): IStudy {
    return {
      ...study,
      studyPlanJSON: study.studyPlanJSON.map((module, moduleIndex) => ({
        ...module,
        levels: module.levels.map((level, levelIndex) => ({
          ...level,
          steps: level.steps.map((step, stepIndex) => {
            const legacyStep = step as unknown as Omit<IStep, 'type'> & {
              type: string;
              exam?: IQuiz;
            };
            const { exam, ...canonicalStep } = legacyStep;
            const type =
              legacyStep.type === 'quiz' || legacyStep.type === 'exam'
                ? 'test'
                : legacyStep.type;

            return {
              ...canonicalStep,
              type: type as IStep['type'],
              quiz: canonicalStep.quiz ?? exam,
              id:
                step.id ||
                generateId(
                  `study-step:${study._id}:${moduleIndex}:${levelIndex}:${stepIndex}`,
                ),
            };
          }),
        })),
      })),
    };
  }

  private async withContent(study: IStudy): Promise<IStudy> {
    const entries = await this.contentCollection
      .find({ userId: study.userId, studyId: study._id })
      .toArray();
    if (!entries.length) return study;
    const values = new Map(
      entries.map((item) => [`${item.stepId}:${item.kind}`, item.value]),
    );
    return {
      ...study,
      studyPlanJSON: study.studyPlanJSON.map((module) => ({
        ...module,
        levels: module.levels.map((level) => ({
          ...level,
          steps: level.steps.map((step) => {
            const document = values.get(`${step.id}:document`);
            const code = values.get(`${step.id}:code`);
            const quiz = values.get(`${step.id}:quiz`);
            return {
              ...step,
              document: typeof document === 'string' ? document : step.document,
              code: typeof code === 'string' ? code : step.code,
              quiz: quiz && typeof quiz === 'object' ? quiz : step.quiz,
            };
          }),
        })),
      })),
    };
  }

  async createStudy(
    context: string,
    userId: string,
  ): Promise<IServiceResponse<IStudy, StudyError>> {
    const now = new Date();
    const trimmedContext = context.trim();
    const title =
      trimmedContext.length > 0 && trimmedContext.length <= 60
        ? trimmedContext
        : 'Персональный учебный план';

    const newStudy: IStudy = {
      title,
      description: 'Персональный план изучения программирования',
      _id: randomUUID(),
      userId,
      levelPlanJSON: [],
      level: {
        experienceToNextLevel: 10,
        positionCount: 0,
        positionName: 'Новичок',
      },
      studyPlanJSON: [],
      study: {
        context,
        module: 0,
        moduleTitle: '',
        level: 0,
        levelTitle: '',
        step: 0,
      },
      createdAt: now,
      updatedAt: now,
    };

    await this.repositoryStudy.create(newStudy);

    return { success: true, data: newStudy };
  }

  async deleteStudyByIdAndUserId(
    id: string,
    userId: string,
  ): Promise<IServiceResponse<null, StudyError>> {
    const study = await this.repositoryStudy.findOne({ _id: id });

    if (!study) {
      return { success: false, error: StudyError.STUDY_NOT_FOUND };
    }

    if (study.userId !== userId) {
      return { success: false, error: StudyError.USER_NOT_FOUND };
    }

    await this.repositoryStudy.delete({ _id: id });
    await this.contentCollection.deleteMany({ studyId: id, userId });

    return { success: true, data: null };
  }

  async setModulesIfEmpty(
    userId: string,
    id: string,
    modules: IModule[],
  ): Promise<boolean> {
    const result = await this.collection.updateOne(
      { _id: id, userId, 'studyPlanJSON.0': { $exists: false } },
      { $set: { studyPlanJSON: modules, updatedAt: new Date() } },
    );
    return result.matchedCount > 0;
  }

  async addTestStepIfMissing(
    userId: string,
    studyId: string,
    step: IStep,
  ): Promise<boolean> {
    const result = await this.collection.updateOne(
      {
        _id: studyId,
        userId,
        'studyPlanJSON.0.levels.0': { $exists: true },
        'studyPlanJSON.levels.steps.type': { $ne: 'test' },
      },
      {
        $push: { 'studyPlanJSON.0.levels.0.steps': step },
        $set: { updatedAt: new Date() },
      },
    );
    return result.modifiedCount > 0;
  }

  async replaceStudyPlanIfUnchanged(
    userId: string,
    studyId: string,
    expectedUpdatedAt: Date | undefined,
    modules: IModule[],
    updatedAt: Date,
  ): Promise<boolean> {
    const result = await this.collection.updateOne(
      { _id: studyId, userId, updatedAt: expectedUpdatedAt },
      { $set: { studyPlanJSON: modules, updatedAt } },
    );
    return result.modifiedCount > 0;
  }

  async setLevelsIfEmpty(
    userId: string,
    id: string,
    moduleIndex: number,
    levels: ILevel[],
  ): Promise<boolean> {
    const path = `studyPlanJSON.${moduleIndex}.levels`;
    const result = await this.collection.updateOne(
      {
        _id: id,
        userId,
        [`studyPlanJSON.${moduleIndex}`]: { $exists: true },
        [`${path}.0`]: { $exists: false },
      },
      { $set: { [path]: levels, updatedAt: new Date() } },
    );
    return result.modifiedCount > 0;
  }

  async setStepsIfEmpty(
    userId: string,
    id: string,
    moduleIndex: number,
    levelIndex: number,
    steps: IStep[],
  ): Promise<boolean> {
    const path = `studyPlanJSON.${moduleIndex}.levels.${levelIndex}.steps`;
    const result = await this.collection.updateOne(
      {
        _id: id,
        userId,
        [`studyPlanJSON.${moduleIndex}.levels.${levelIndex}`]: {
          $exists: true,
        },
        [`${path}.0`]: { $exists: false },
      },
      { $set: { [path]: steps, updatedAt: new Date() } },
    );
    return result.modifiedCount > 0;
  }

  async setStepContent(
    userId: string,
    id: string,
    moduleIndex: number,
    levelIndex: number,
    stepIndex: number,
    kind: 'document' | 'code' | 'quiz',
    value: string | IQuiz,
  ): Promise<boolean> {
    const path = `studyPlanJSON.${moduleIndex}.levels.${levelIndex}.steps.${stepIndex}`;
    const study = await this.collection.findOne({
      _id: id,
      userId,
      [path]: { $exists: true },
    } as Filter<IStudy>);
    const step =
      study?.studyPlanJSON?.[moduleIndex]?.levels?.[levelIndex]?.steps?.[
        stepIndex
      ];
    if (!step?.id) return false;
    await this.contentCollection.updateOne(
      { _id: `${id}:${step.id}:${kind}` },
      {
        $set: {
          userId,
          studyId: id,
          stepId: step.id,
          kind,
          value,
          updatedAt: new Date(),
        },
      },
      { upsert: true },
    );
    return true;
  }

  async completeStep(
    userId: string,
    studyId: string,
    moduleIndex: number,
    levelIndex: number,
    stepIndex: number,
  ): Promise<boolean> {
    const path = `studyPlanJSON.${moduleIndex}.levels.${levelIndex}.steps.${stepIndex}`;
    const result = await this.collection.updateOne(
      { _id: studyId, userId, [`${path}.isCompleted`]: false },
      { $set: { [`${path}.isCompleted`]: true, updatedAt: new Date() } },
    );
    return result.modifiedCount > 0;
  }
}
