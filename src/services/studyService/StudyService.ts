import { ChatSession } from '@core/ai';
import { BaseFileStorage } from '@core/storage';
import { INotation } from '@core/types/Notation.type';
import { IModule, IQuiz, IStep, IStudy, StudyKey } from '@models/study';
import { Injectable } from '@nestjs/common';
import { applyPromptVariables } from './helpers/ApplyPromptVariables';
import { extractJsonFromMarkdown } from './helpers/ExtractJsonFromMarkdown';
import { TypeGuards as CoreTypeGuards } from '@core/types/guards/TypeGuards';
import { TypeGuards as ProfileTypeGuards } from '@models/profile/guards/TypeGuards';
import { TypeGuards as QuizTypeGuards } from '@models/study/guards/TypeGuards';
import { IServiceResponse } from '@core/types/Response.type';
import { StudyError } from './types';
import { Db } from 'mongodb';
import { BaseMongoRepository } from '@core/db';
import { generateId } from '@core/helpers/GenerateId';

@Injectable()
export class StudyService {
  private path = 'data/prompts';
  private repositoryStudy: BaseMongoRepository<IStudy>;

  constructor(
    db: Db,
    private chat: ChatSession,
    private fileStorage: BaseFileStorage,
  ) {
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
      _id: generateId(context),
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

  async ChangeStudyPlanById(
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

  async generateStudyModules(
    language: string,
  ): Promise<IServiceResponse<INotation[], StudyError>> {
    const prompt = applyPromptVariables(
      this.fileStorage.readFile(this.path + '/generate_modules.txt'),
      { language: language },
    );

    const answer = await this.chat.send(prompt);
    const json = extractJsonFromMarkdown(answer);

    try {
      const parsed = JSON.parse(json);

      if (!CoreTypeGuards.isNotationArray(parsed)) {
        return {
          success: false,
          error: StudyError.INVALID_MODULES_RESPONSE,
        };
      }

      return { success: true, data: parsed };
    } catch (err) {
      return {
        success: false,
        error: StudyError.FAILED_TO_PARSE_MODULES,
      };
    }
  }

  async generateStudyLevels(
    module: INotation,
    language: string,
  ): Promise<IServiceResponse<INotation[], StudyError>> {
    const prompt = applyPromptVariables(
      this.fileStorage.readFile(this.path + '/generate_levels.txt'),
      {
        language: language,
        module_title: module.title,
        module_description: module.description,
      },
    );

    const answer = await this.chat.send(prompt);
    const json = extractJsonFromMarkdown(answer);

    try {
      const parsed = JSON.parse(json);

      if (!CoreTypeGuards.isNotationArray(parsed)) {
        return {
          success: false,
          error: StudyError.INVALID_LEVELS_RESPONSE,
        };
      }

      return { success: true, data: parsed };
    } catch (err) {
      return {
        success: false,
        error: StudyError.FAILED_TO_PARSE_LEVELS,
      };
    }
  }

  async generateStudySteps(
    module: INotation,
    level: INotation,
    language: string,
  ): Promise<IServiceResponse<IStep[], StudyError>> {
    const prompt = applyPromptVariables(
      this.fileStorage.readFile(this.path + '/generate_steps.txt'),
      {
        language: language,
        module_title: module.title,
        module_description: module.description,
        level_title: level.title,
        level_description: level.description,
      },
    );

    const answer = await this.chat.send(prompt);
    const json = extractJsonFromMarkdown(answer);

    try {
      const parsed = JSON.parse(json);

      if (!ProfileTypeGuards.isStepArray(parsed)) {
        return {
          success: false,
          error: StudyError.INVALID_STEPS_RESPONSE,
        };
      }

      return { success: true, data: parsed };
    } catch (err) {
      return {
        success: false,
        error: StudyError.FAILED_TO_PARSE_STEPS,
      };
    }
  }

  async generateDocumentation(
    module: INotation,
    level: INotation,
    step: INotation,
    language: string,
  ): Promise<IServiceResponse<string, StudyError>> {
    const prompt = applyPromptVariables(
      this.fileStorage.readFile(this.path + '/generate_documentation.txt'),
      {
        language: language,
        module_title: module.title,
        module_description: module.description,
        level_title: level.title,
        level_description: level.description,
        step_title: step.title,
        step_description: step.description,
      },
    );

    const answer = await this.chat.send(prompt);

    return { success: true, data: answer };
  }

  async generatePractice(
    module: INotation,
    level: INotation,
    step: INotation,
    language: string,
  ): Promise<IServiceResponse<string, StudyError>> {
    const prompt = applyPromptVariables(
      this.fileStorage.readFile(this.path + '/generate_practice.txt'),
      {
        language: language,
        module_title: module.title,
        module_description: module.description,
        level_title: level.title,
        level_description: level.description,
        step_title: step.title,
        step_description: step.description,
      },
    );

    const answer = await this.chat.send(prompt);

    return { success: true, data: answer };
  }

  async generateQuiz(
    module: INotation,
    level: INotation,
    step: INotation,
    language: string,
  ): Promise<IServiceResponse<IQuiz, StudyError>> {
    const prompt = applyPromptVariables(
      this.fileStorage.readFile(this.path + '/generate_quiz.txt'),
      {
        language: language,
        module_title: module.title,
        module_description: module.description,
        level_title: level.title,
        level_description: level.description,
        step_title: step.title,
        step_description: step.description,
      },
    );

    const answer = await this.chat.send(prompt);
    const json = extractJsonFromMarkdown(answer);

    try {
      const parsed = JSON.parse(json);

      if (!QuizTypeGuards.isQuiz(parsed)) {
        return {
          success: false,
          error: StudyError.INVALID_QUIZ_RESPONSE,
        };
      }

      return { success: true, data: parsed };
    } catch (err) {
      return {
        success: false,
        error: StudyError.FAILED_TO_PARSE_QUIZ,
      };
    }
  }

  async checkQuiz(
    quiz: IQuiz,
  ): Promise<IServiceResponse<IQuiz | number, StudyError>> {
    const prompt = applyPromptVariables(
      this.fileStorage.readFile(this.path + '/check_quiz.txt'),
      {
        quiz: JSON.stringify(quiz, null, 2),
      },
    );

    const answer = await this.chat.send(prompt);
    const trimmed = answer.trim();

    if (trimmed === '200') {
      return { success: true, data: 200 };
    }

    const json = extractJsonFromMarkdown(answer);

    try {
      const parsed = JSON.parse(json);

      if (!QuizTypeGuards.isQuiz(parsed)) {
        return {
          success: false,
          error: StudyError.INVALID_QUIZ_RESPONSE,
        };
      }

      return { success: true, data: parsed };
    } catch (err) {
      return {
        success: false,
        error: StudyError.FAILED_TO_PARSE_QUIZ,
      };
    }
  }

  async checkCode(
    task: INotation,
    code: string,
    language: string,
  ): Promise<IServiceResponse<number | string, StudyError>> {
    const prompt = applyPromptVariables(
      this.fileStorage.readFile(this.path + '/check_code.txt'),
      {
        language: language,
        code: code,
        task_title: task.title,
        task_description: task.description,
      },
    );

    const answer = await this.chat.send(prompt);
    const trimmed = answer.trim();

    if (trimmed === '200') {
      return { success: true, data: 200 };
    }

    return { success: true, data: trimmed };
  }
}
