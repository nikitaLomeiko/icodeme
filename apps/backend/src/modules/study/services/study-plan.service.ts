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
  SubmitQuizDto,
} from '../dto/study.dto';
import {
  createInteractiveTestQuiz,
  createTestStudyModule,
} from '../factories/test-study-module.factory';
import { StudyService } from './study.service';
import { StudyGenerationService } from './study-generation.service';
import { runtimeForStudy } from './study-runtime-config';
import { StudyGenerationQuotaService } from './study-generation-quota.service';

@Injectable()
export class StudyPlanService {
  constructor(
    private readonly studyService: StudyService,
    private readonly generationService: StudyGenerationService,
    private readonly quota: StudyGenerationQuotaService,
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

    return this.normalizeLegacyStepTypes(userId, result.data);
  }

  private async normalizeLegacyStepTypes(
    userId: string,
    study: IStudy,
  ): Promise<IStudy> {
    type LegacyStep = Omit<IStep, 'type'> & {
      type: string;
      exam?: IQuiz;
    };

    const hasLegacyTypes = study.studyPlanJSON.some((module) =>
      module.levels.some((level) =>
        level.steps.some((step) => {
          const legacyStep = step as unknown as LegacyStep;
          return (
            legacyStep.type === 'quiz' ||
            legacyStep.type === 'exam' ||
            Boolean(legacyStep.exam)
          );
        }),
      ),
    );
    if (!hasLegacyTypes) return study;

    const normalizedPlan = study.studyPlanJSON.map((module) => ({
      ...module,
      levels: module.levels.map((level) => ({
        ...level,
        steps: level.steps.map((step) => {
          const legacyStep = step as unknown as LegacyStep;
          if (
            legacyStep.type !== 'quiz' &&
            legacyStep.type !== 'exam' &&
            !legacyStep.exam
          )
            return step;

          const { exam, ...canonicalStep } = legacyStep;
          return {
            ...canonicalStep,
            type:
              legacyStep.type === 'quiz' || legacyStep.type === 'exam'
                ? 'test'
                : legacyStep.type,
            quiz: canonicalStep.quiz ?? exam,
          } as IStep;
        }),
      })),
    }));
    const updatedAt = new Date();
    const updated = await this.studyService.replaceStudyPlanIfUnchanged(
      userId,
      study._id,
      study.updatedAt,
      normalizedPlan,
      updatedAt,
    );
    if (updated) {
      return { ...study, studyPlanJSON: normalizedPlan, updatedAt };
    }

    const latest = await this.studyService.getStudyByIdAndUserId(
      study._id,
      userId,
    );
    return latest.success && latest.data ? latest.data : study;
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
    const current = await this.getStudy(userId, studyId);
    if (current.studyPlanJSON.length > 0) {
      const hasTest = current.studyPlanJSON.some((module) =>
        module.levels.some((level) =>
          level.steps.some((step) => step.type === 'test'),
        ),
      );
      if (!hasTest) {
        const firstLevel = current.studyPlanJSON[0]?.levels[0];
        if (firstLevel) {
          const quiz = createInteractiveTestQuiz();
          const y =
            Math.max(-320, ...firstLevel.steps.map((step) => step.position.y)) +
            320;
          await this.studyService.addTestStepIfMissing(userId, studyId, {
            id: randomUUID(),
            title: 'Пробный тест: основы Python',
            description: quiz.description,
            type: 'test',
            quiz,
            isCompleted: false,
            isCurrent: false,
            position: { x: 50, y },
            settings: { startCommand: [] },
          });
        }
      }
      return { success: true, data: await this.getStudy(userId, studyId) };
    }
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

    await this.quota.consume(userId);
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
    if (module.levels.length)
      throw new BadRequestException('Уровни уже созданы');
    await this.quota.consume(userId);
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
    if (level.steps.length) throw new BadRequestException('Шаги уже созданы');
    await this.quota.consume(userId);
    const generated = await this.generationService.generateSteps(
      module,
      level,
      study.study.context,
    );

    if (!generated.success || !generated.data) {
      throw new BadRequestException('Не удалось создать шаги');
    }

    const runtime = runtimeForStudy(study.study.context);
    if (
      !runtime &&
      generated.data.some((step) => step.type === 'code')
    )
      throw new BadRequestException(
        'Для языка этого плана пока недоступна среда выполнения',
      );
    const steps: IStep[] = generated.data.map((step, stepIndex) => ({
      ...step,
      id: randomUUID(),
      isCompleted: false,
      isCurrent: stepIndex === 0,
      position: { x: 50, y: stepIndex * 320 },
      settings: step.type === 'code' ? { ...runtime } : {},
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

  async submitQuiz(
    userId: string,
    data: SubmitQuizDto,
  ): Promise<
    IControllerResponse<{ correct: number; total: number; completed: boolean }>
  > {
    const study = await this.getStudy(userId, data.studyId);
    const step = this.getStep(
      this.getLevel(this.getModule(study, data.moduleIndex), data.levelIndex),
      data.stepIndex,
    );
    if (step.type !== 'test')
      throw new BadRequestException('Шаг не является тестом');
    const quiz = step.quiz;
    if (!quiz?.questions.length)
      throw new BadRequestException('Тест не найден');
    if (
      !data.answers ||
      typeof data.answers !== 'object' ||
      Array.isArray(data.answers)
    )
      throw new BadRequestException('Некорректные ответы');
    const answers = data.answers;
    const normalize = (value: string) => value.trim().toLocaleLowerCase();
    let correct = 0;
    let total = 0;
    quiz.questions.forEach((question, index) => {
      const answer = answers[`question-${index}`];
      const validAnswer =
        typeof answer === 'string' ||
        (Array.isArray(answer) &&
          answer.every((part) => typeof part === 'string'));
      if (question.type === 'abcd') {
        const expected = (question.variants ?? []).flatMap(
          (variant, optionIndex) =>
            variant.isTrue ? [String(optionIndex)] : [],
        );
        if (!expected.length) return;
        total++;
        if (!validAnswer) return;
        const actual = Array.isArray(answer) ? answer : [answer];
        if (
          expected.length > 0 &&
          expected.length === actual.length &&
          expected.every((item) => actual.includes(item))
        )
          correct++;
      } else if (question.type === 'true/false') {
        if (!question.truefolse) return;
        total++;
        if (question.truefolse && answer === String(question.truefolse.correct))
          correct++;
      } else if (question.type === 'input') {
        const inputs = question.inputs ?? [];
        if (!inputs.length || inputs.some((input) => !input.correct.length))
          return;
        total++;
        if (!validAnswer) return;
        const actual = Array.isArray(answer) ? answer : [answer];
        if (
          inputs.length > 0 &&
          actual.length === inputs.length &&
          inputs.every((input, i) =>
            input.correct.some(
              (value) => normalize(value) === normalize(actual[i]),
            ),
          )
        )
          correct++;
      } else if (question.type === 'code' && typeof answer === 'string') {
        const expected = [
          ...(question.code?.correctCode ?? []),
          ...(question.code?.correctResult ?? []),
        ];
        if (!expected.length) return;
        total++;
        if (expected.some((value) => normalize(value) === normalize(answer)))
          correct++;
      } else if (question.type === 'code') {
        const expected = [
          ...(question.code?.correctCode ?? []),
          ...(question.code?.correctResult ?? []),
        ];
        if (expected.length) total++;
      }
    });
    if (!total)
      throw new BadRequestException('Тест не содержит проверяемых вопросов');
    const completed = correct / total >= 0.7;
    if (completed && !step.isCompleted)
      await this.studyService.completeStep(
        userId,
        data.studyId,
        data.moduleIndex,
        data.levelIndex,
        data.stepIndex,
      );
    return { success: true, data: { correct, total, completed } };
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
    const existing =
      kind === 'document'
        ? step.document
        : kind === 'code'
          ? step.code
          : step.quiz;
    if (existing !== undefined) return { success: true, data: existing };
    await this.quota.consume(userId);
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
