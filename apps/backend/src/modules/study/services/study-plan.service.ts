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
    return this.studyService.getStudiesByUserId(userId);
  }

  async getStudy(userId: string, studyId: string): Promise<IStudy> {
    const result = await this.studyService.getStudyByIdAndUserId(
      studyId,
      userId,
    );

    if (!result.success || !result.data) {
      throw new NotFoundException('Учебный план не найден');
    }

    return result.data;
  }

  async addInitialTestModule(
    userId: string,
    studyId: string,
  ): Promise<IControllerResponse<IStudy>> {
    const studies = await this.getStudies(userId);
    if (
      !studies.data ||
      studies.data.length !== 1 ||
      studies.data[0]._id !== studyId
    )
      throw new BadRequestException(
        'Тестовый модуль доступен только при первоначальной настройке',
      );
    const current = studies.data[0];
    if (current.studyPlanJSON.length > 0)
      return { success: true, data: current };
    await this.studyService.setModulesIfEmpty(userId, studyId, [
      createTestStudyModule(),
    ]);
    return { success: true, data: await this.getStudy(userId, studyId) };
  }

  async createStudy(
    userId: string,
    context: string,
  ): Promise<IControllerResponse<IStudy>> {
    const result = await this.studyService.createStudy(context, userId);
    if (!result.success) {
      throw new BadRequestException('Не удалось создать учебный план');
    }
    return result;
  }

  async deleteStudy(
    userId: string,
    studyId: string,
  ): Promise<IControllerResponse> {
    const result = await this.studyService.deleteStudyByIdAndUserId(
      studyId,
      userId,
    );
    if (!result.success) throw new NotFoundException('Учебный план не найден');
    return result;
  }

  async generateModules(
    userId: string,
    studyId: string,
  ): Promise<IControllerResponse<IModule[]>> {
    const study = await this.getStudy(userId, studyId);
    if (study.studyPlanJSON.length > 0) {
      throw new BadRequestException('Учебный план уже сформирован');
    }

    const generated = await this.generationService.generateModules(
      study.study.context,
    );
    if (!generated.success || !generated.data) {
      throw new BadRequestException('Не удалось создать модули');
    }

    const modules = generated.data.map((module) => ({ ...module, levels: [] }));
    if (!(await this.studyService.setModulesIfEmpty(userId, studyId, modules)))
      throw new BadRequestException('Учебный план уже сформирован');
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
      throw new BadRequestException('Не удалось создать уровни');
    }

    const levels: ILevel[] = generated.data.map((level, index) => ({
      ...level,
      isCompleted: false,
      isCurrent: index === 0,
      steps: [],
    }));
    if (
      !(await this.studyService.setLevelsIfEmpty(
        userId,
        data.studyId,
        data.moduleIndex,
        levels,
      ))
    )
      throw new BadRequestException('Уровни уже созданы');
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
      throw new BadRequestException('Не удалось создать шаги');
    }

    const steps: IStep[] = generated.data.map((step, stepIndex) => ({
      ...step,
      id: randomUUID(),
      isCompleted: false,
      isCurrent: stepIndex === 0,
      position: { x: 50, y: stepIndex * 320 },
      settings: {},
    }));
    if (
      !(await this.studyService.setStepsIfEmpty(
        userId,
        data.studyId,
        data.moduleIndex,
        data.levelIndex,
        steps,
      ))
    )
      throw new BadRequestException('Шаги уже созданы');
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
      throw new BadRequestException('Не удалось создать содержимое шага');
    }

    if (
      !(await this.studyService.setStepContent(
        userId,
        data.studyId,
        data.moduleIndex,
        data.levelIndex,
        data.stepIndex,
        kind,
        generated.data,
      ))
    )
      throw new NotFoundException('Шаг не найден');
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
    if (!module) throw new NotFoundException('Модуль не найден');
    return module;
  }

  private getLevel(module: IModule, levelIndex: number): ILevel {
    const level = module.levels[levelIndex];
    if (!level) throw new NotFoundException('Уровень не найден');
    return level;
  }

  private getStep(level: ILevel, stepIndex: number): IStep {
    const step = level.steps[stepIndex];
    if (!step) throw new NotFoundException('Шаг не найден');
    return step;
  }
}
