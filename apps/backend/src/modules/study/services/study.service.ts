import { IModule, IStep, IStudy, StudyKey } from '../models';
import { Injectable } from '@nestjs/common';
import { IServiceResponse } from '@core/types/response.type';
import { StudyError } from '../types';
import { Db } from 'mongodb';
import { BaseMongoRepository } from '@core/database';
import { generateId } from '@core/helpers/generate-id';
import { randomUUID } from 'crypto';

@Injectable()
export class StudyService {
  private readonly repositoryStudy: BaseMongoRepository<IStudy>;

  constructor(db: Db) {
    const collectionStudy = db.collection(StudyKey);
    this.repositoryStudy = new BaseMongoRepository<IStudy>(collectionStudy);
  }

  async getStudyByUserId(
    userId: string,
  ): Promise<IServiceResponse<IStudy[], StudyError>> {
    const study = await this.repositoryStudy.find({
      userId: userId,
    });

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

    return { success: true, data: this.withStepIds(study) };
  }

  async getStepByIdAndUserId(
    stepId: string,
    userId: string,
  ): Promise<IStep | null> {
    const studies = await this.repositoryStudy.find({ userId });

    for (const storedStudy of studies) {
      const study = this.withStepIds(storedStudy);
      for (const module of study.studyPlanJSON) {
        for (const level of module.levels) {
          const step = level.steps.find((item) => item.id === stepId);
          if (step) return step;
        }
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
          steps: level.steps.map((step, stepIndex) => ({
            ...step,
            id:
              step.id ||
              generateId(
                `study-step:${study._id}:${moduleIndex}:${levelIndex}:${stepIndex}`,
              ),
          })),
        })),
      })),
    };
  }

  async createNewStudy(
    context: string,
    userId: string,
  ): Promise<IServiceResponse<IStudy, StudyError>> {
    const now = new Date();

    const newStudy: IStudy = {
      title: 'Generate AI',
      description: 'Generate AI',
      _id: randomUUID(),
      userId: userId,
      levelPlanJSON: [],
      level: {
        experienceToNextLevel: 10,
        positionCount: 0,
        positionName: 'Beginner',
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

  async removeStudyById(
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

    return { success: true, data: null };
  }

  async changeStudyPlanById(
    studyPlanJSON: IModule[],
    id: string,
  ): Promise<IServiceResponse<IStudy, StudyError>> {
    const study = await this.repositoryStudy.findOne({ _id: id });

    if (!study) {
      return { success: false, error: StudyError.USER_NOT_FOUND };
    }

    const now = new Date();

    const newStudy = { ...study, studyPlanJSON, updatedAt: now };

    const result = await this.repositoryStudy.update({ _id: id }, newStudy);

    if (!result) {
      return { success: false, error: StudyError.USER_NOT_FOUND };
    }

    return { success: true, data: newStudy };
  }
}
