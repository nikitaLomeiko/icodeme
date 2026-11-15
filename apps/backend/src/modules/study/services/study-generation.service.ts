import { Injectable } from '@nestjs/common';
import { ChatSession } from '@core/ai';
import { BaseFileStorage } from '@core/storage';
import type { INotation } from '@core/types/notation.type';
import type { IServiceResponse } from '@core/types/response.type';
import { TypeGuards as NotationTypeGuards } from '@core/types/guards/notation-type.guards';
import type { IGeneratedStep, IQuiz } from '../models';
import { TypeGuards as StudyTypeGuards } from '../guards/study-type.guards';
import { applyPromptVariables } from '../helpers/apply-prompt-variables';
import { extractJsonFromMarkdown } from '../helpers/extract-json-from-markdown';
import { StudyError } from '../types';
import { join, resolve } from 'path';

@Injectable()
export class StudyGenerationService {
  private readonly promptPath = resolve(
    process.env.PROMPT_DIR || 'data/prompts',
  );
  private readonly promptCache = new Map<string, Promise<string>>();

  constructor(
    private readonly chat: ChatSession,
    private readonly fileStorage: BaseFileStorage,
  ) {}

  async generateModules(
    language: string,
  ): Promise<IServiceResponse<INotation[], StudyError>> {
    const answer = await this.sendPrompt('generate_modules.txt', { language });
    return this.parseGeneratedJson(
      answer,
      (value): value is INotation[] =>
        NotationTypeGuards.isNotationArray(value),
      StudyError.INVALID_MODULES_RESPONSE,
      StudyError.FAILED_TO_PARSE_MODULES,
    );
  }

  async generateLevels(
    module: INotation,
    language: string,
  ): Promise<IServiceResponse<INotation[], StudyError>> {
    const answer = await this.sendPrompt('generate_levels.txt', {
      language,
      module_title: module.title,
      module_description: module.description,
    });
    return this.parseGeneratedJson(
      answer,
      (value): value is INotation[] =>
        NotationTypeGuards.isNotationArray(value),
      StudyError.INVALID_LEVELS_RESPONSE,
      StudyError.FAILED_TO_PARSE_LEVELS,
    );
  }

  async generateSteps(
    module: INotation,
    level: INotation,
    language: string,
  ): Promise<IServiceResponse<IGeneratedStep[], StudyError>> {
    const answer = await this.sendPrompt('generate_steps.txt', {
      language,
      module_title: module.title,
      module_description: module.description,
      level_title: level.title,
      level_description: level.description,
    });
    return this.parseGeneratedJson(
      answer,
      (value): value is IGeneratedStep[] =>
        StudyTypeGuards.isGeneratedStepArray(value),
      StudyError.INVALID_STEPS_RESPONSE,
      StudyError.FAILED_TO_PARSE_STEPS,
    );
  }

  async generateDocumentation(
    module: INotation,
    level: INotation,
    step: INotation,
    language: string,
  ): Promise<IServiceResponse<string, StudyError>> {
    const answer = await this.sendPrompt(
      'generate_documentation.txt',
      this.stepPromptVariables(module, level, step, language),
    );
    return answer.length <= 50000
      ? { success: true, data: answer }
      : { success: false, error: StudyError.INVALID_DOCUMENTATION_RESPONSE };
  }

  async generatePractice(
    module: INotation,
    level: INotation,
    step: INotation,
    language: string,
  ): Promise<IServiceResponse<string, StudyError>> {
    const answer = await this.sendPrompt(
      'generate_practice.txt',
      this.stepPromptVariables(module, level, step, language),
    );
    return answer.length <= 50000
      ? { success: true, data: answer }
      : { success: false, error: StudyError.INVALID_PRACTICE_RESPONSE };
  }

  async generateQuiz(
    module: INotation,
    level: INotation,
    step: INotation,
    language: string,
  ): Promise<IServiceResponse<IQuiz, StudyError>> {
    const answer = await this.sendPrompt(
      'generate_quiz.txt',
      this.stepPromptVariables(module, level, step, language),
    );
    return this.parseQuiz(answer);
  }

  async checkQuiz(
    quiz: IQuiz,
  ): Promise<IServiceResponse<IQuiz | number, StudyError>> {
    const answer = await this.sendPrompt('check_quiz.txt', {
      quiz: JSON.stringify(quiz, null, 2),
    });
    if (answer.trim() === '200') return { success: true, data: 200 };
    return this.parseQuiz(answer);
  }

  async checkCode(
    task: INotation,
    code: string,
    language: string,
  ): Promise<IServiceResponse<number | string, StudyError>> {
    const answer = await this.sendPrompt('check_code.txt', {
      language,
      code,
      task_title: task.title,
      task_description: task.description,
    });
    const trimmed = answer.trim();
    return trimmed.length <= 10000
      ? { success: true, data: trimmed === '200' ? 200 : trimmed }
      : { success: false, error: StudyError.INVALID_CODE_RESPONSE };
  }

  private async sendPrompt(
    filename: string,
    variables: Record<string, string>,
  ): Promise<string> {
    let templatePromise = this.promptCache.get(filename);
    if (!templatePromise) {
      templatePromise = this.fileStorage.readFileAsync(
        join(this.promptPath, filename),
      );
      this.promptCache.set(filename, templatePromise);
    }
    const template = await templatePromise.catch((error: unknown) => {
      this.promptCache.delete(filename);
      throw error;
    });
    return this.chat.send(applyPromptVariables(template, variables));
  }

  private stepPromptVariables(
    module: INotation,
    level: INotation,
    step: INotation,
    language: string,
  ): Record<string, string> {
    return {
      language,
      module_title: module.title,
      module_description: module.description,
      level_title: level.title,
      level_description: level.description,
      step_title: step.title,
      step_description: step.description,
    };
  }

  private parseQuiz(answer: string): IServiceResponse<IQuiz, StudyError> {
    return this.parseGeneratedJson(
      answer,
      (value): value is IQuiz => StudyTypeGuards.isQuiz(value),
      StudyError.INVALID_QUIZ_RESPONSE,
      StudyError.FAILED_TO_PARSE_QUIZ,
    );
  }

  private parseGeneratedJson<T>(
    answer: string,
    isValid: (value: unknown) => value is T,
    invalidResponseError: StudyError,
    parseError: StudyError,
  ): IServiceResponse<T, StudyError> {
    if (answer.length > 128 * 1024)
      return { success: false, error: invalidResponseError };
    try {
      const parsed: unknown = JSON.parse(extractJsonFromMarkdown(answer));
      return isValid(parsed)
        ? { success: true, data: parsed }
        : { success: false, error: invalidResponseError };
    } catch {
      return { success: false, error: parseError };
    }
  }
}
