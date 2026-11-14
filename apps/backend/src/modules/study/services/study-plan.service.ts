import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import type { IControllerResponse } from '@core/types/response.type';
import type { INotation } from '@core/types/notation.type';
import type { ILevel, IModule, IQuiz, IStep, IStudy } from '../models';
import type {
  GenerateLevelsDto,
  GenerateStepContentDto,
  GenerateStepsDto,
} from '../dto/study.dto';
import { createTestStudyModule } from '../factories/test-study-module.factory';
import { StudyService } from './study.service';
import { StudyGenerationService } from './study-generation.service';

@Injectable()
export class StudyPlanService {
  constructor(
    private readonly studyService: StudyService,
    private readonly generationService: StudyGenerationService,
  ) {}

  getStudies(userId: string): Promise<IControllerResponse<IStudy[]>> {
    return this.studyService.getStudyByUserId(userId);
  }

  async getStudy(userId: string, studyId: string): Promise<IStudy> {
    const result = await this.studyService.getStudyByIdAndUserId(
      studyId,
      userId,
    );

    if (!result.success || !result.data) {
      throw new NotFoundException('Study not found');
    }

    return result.data;
  }

  async insertTestModule(
    userId: string,
    studyId: string,
  ): Promise<IControllerResponse<IStudy>> {
    const study = await this.getStudy(userId, studyId);
    const result = await this.studyService.changeStudyPlanById(
      [...study.studyPlanJSON, createTestStudyModule()],
      studyId,
    );

    if (!result.success || !result.data) {
      throw new BadRequestException(
        result.error ?? 'Failed to insert test module',
      );
    }

    return { success: true, data: result.data };
  }

  async createStudy(
    userId: string,
    context: string,
  ): Promise<IControllerResponse<IStudy>> {
    const result = await this.studyService.createNewStudy(context, userId);
    if (!result.success) {
      throw new BadRequestException('Error when creating a study');
    }
    return result;
  }

  async deleteStudy(
    userId: string,
    studyId: string,
  ): Promise<IControllerResponse> {
    const result = await this.studyService.removeStudyById(studyId, userId);
    if (!result.success) throw new NotFoundException(result.error);
    return result;
  }

  async generateModules(
    userId: string,
    studyId: string,
  ): Promise<IControllerResponse<IModule[]>> {
    const study = await this.getStudy(userId, studyId);
    if (study.studyPlanJSON.length > 0) {
      throw new BadRequestException('Study plan already formed');
    }

    const generated = await this.generationService.generateModules(
      study.study.context,
    );
    if (!generated.success || !generated.data) {
      throw new BadRequestException(
        generated.error ?? 'Failed to generate modules',
      );
    }

    const modules = generated.data.map((module) => ({ ...module, levels: [] }));
    await this.savePlan(studyId, modules);
    return { success: true, data: modules };
  }

  async generateLevels(
    userId: string,
    data: GenerateLevelsDto,
  ): Promise<IControllerResponse<INotation[]>> {
    const study = await this.getStudy(userId, data.studyId);
    const module = this.getModule(study, data.moduleIndex);
    const generated = await this.generationService.generateLevels(
      module,
      study.study.context,
    );

    if (!generated.success || !generated.data) {
      throw new BadRequestException(
        generated.error ?? 'Failed to generate levels',
      );
    }

    for (const level of generated.data) {
      module.levels.push({
        ...level,
        isCompleted: false,
        isCurrent: module.levels.length === 0,
        steps: [],
      });
    }
    await this.savePlan(data.studyId, study.studyPlanJSON);
    return { success: true, data: generated.data };
  }

  async generateSteps(
    userId: string,
    data: GenerateStepsDto,
  ): Promise<IControllerResponse<IStep[]>> {
    const study = await this.getStudy(userId, data.studyId);
    const module = this.getModule(study, data.moduleIndex);
    const level = this.getLevel(module, data.levelIndex);
    const generated = await this.generationService.generateSteps(
      module,
      level,
      study.study.context,
    );

    if (!generated.success || !generated.data) {
      throw new BadRequestException(
        generated.error ?? 'Failed to generate steps',
      );
    }

    const steps: IStep[] = generated.data.map((step, stepIndex) => ({
      ...step,
      id: randomUUID(),
      isCompleted: false,
      isCurrent: level.steps.length === 0 && stepIndex === 0,
      position: { x: 50, y: stepIndex * 320 },
      settings: {},
    }));
    level.steps.push(...steps);
    await this.savePlan(data.studyId, study.studyPlanJSON);
    return { success: true, data: steps };
  }

  generateDocumentation(
    userId: string,
    data: GenerateStepContentDto,
  ): Promise<IControllerResponse<string>> {
    return this.generateStepContent(userId, data, 'document');
  }

  generatePractice(
    userId: string,
    data: GenerateStepContentDto,
  ): Promise<IControllerResponse<string>> {
    return this.generateStepContent(userId, data, 'code');
  }

  generateQuiz(
    userId: string,
    data: GenerateStepContentDto,
  ): Promise<IControllerResponse<IQuiz>> {
    return this.generateStepContent(userId, data, 'quiz');
  }

  private async generateStepContent(
    userId: string,
    data: GenerateStepContentDto,
    kind: 'document',
  ): Promise<IControllerResponse<string>>;
  private async generateStepContent(
    userId: string,
    data: GenerateStepContentDto,
    kind: 'code',
  ): Promise<IControllerResponse<string>>;
  private async generateStepContent(
    userId: string,
    data: GenerateStepContentDto,
    kind: 'quiz',
  ): Promise<IControllerResponse<IQuiz>>;
  private async generateStepContent(
    userId: string,
    data: GenerateStepContentDto,
    kind: 'document' | 'code' | 'quiz',
  ): Promise<IControllerResponse<string | IQuiz>> {
    const study = await this.getStudy(userId, data.studyId);
    const module = this.getModule(study, data.moduleIndex);
    const level = this.getLevel(module, data.levelIndex);
    const step = this.getStep(level, data.stepIndex);
    const generated = await this.generateContent(
      kind,
      module,
      level,
      step,
      study.study.context,
    );

    if (!generated.success || generated.data === undefined) {
      throw new BadRequestException(
        generated.error ?? `Failed to generate ${kind}`,
      );
    }

    if (kind === 'quiz') step.quiz = generated.data as IQuiz;
    else step[kind] = generated.data as string;

    await this.savePlan(data.studyId, study.studyPlanJSON);
    return { success: true, data: generated.data };
  }

  private generateContent(
    kind: 'document' | 'code' | 'quiz',
    module: IModule,
    level: ILevel,
    step: IStep,
    context: string,
  ) {
    if (kind === 'document') {
      return this.generationService.generateDocumentation(
        module,
        level,
        step,
        context,
      );
    }
    if (kind === 'code') {
      return this.generationService.generatePractice(
        module,
        level,
        step,
        context,
      );
    }
    return this.generationService.generateQuiz(module, level, step, context);
  }

  private getModule(study: IStudy, moduleIndex: number): IModule {
    const module = study.studyPlanJSON[moduleIndex];
    if (!module) throw new NotFoundException('Module not found');
    return module;
  }

  private getLevel(module: IModule, levelIndex: number): ILevel {
    const level = module.levels[levelIndex];
    if (!level) throw new NotFoundException('Level not found');
    return level;
  }

  private getStep(level: ILevel, stepIndex: number): IStep {
    const step = level.steps[stepIndex];
    if (!step) throw new NotFoundException('Step not found');
    return step;
  }

  private async savePlan(studyId: string, modules: IModule[]): Promise<void> {
    const result = await this.studyService.changeStudyPlanById(
      modules,
      studyId,
    );
    if (!result.success) throw new NotFoundException(result.error);
  }
}
