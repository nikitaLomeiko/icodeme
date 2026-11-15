import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from '@modules/auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '@modules/auth/types';
import type { IControllerResponse } from '@core/types/response.type';
import type { INotation } from '@core/types/notation.type';
import type { IModule, IQuiz, IStep, IStudy } from '../models';
import {
  CreateStudyDto,
  GenerateLevelsDto,
  GenerateStepContentDto,
  GenerateStepsDto,
  StudyIdDto,
  SubmitQuizDto,
} from '../dto/study.dto';
import { StudyPlanService } from '../services/study-plan.service';

@Controller('study')
@UseGuards(AuthGuard('jwt'))
export class StudyController {
  constructor(private readonly studyPlanService: StudyPlanService) {}

  @Get('me')
  getMyStudies(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<IControllerResponse<IStudy[]>> {
    return this.studyPlanService.getStudies(user.userId);
  }

  @Get('me/:studyId')
  async getMyStudyById(
    @CurrentUser() user: AuthenticatedUser,
    @Param('studyId') studyId: string,
  ): Promise<IControllerResponse<IStudy>> {
    const study = await this.studyPlanService.getStudy(user.userId, studyId);
    return { success: true, data: study };
  }

  @Post('test/modules')
  addInitialTestModule(
    @CurrentUser() user: AuthenticatedUser,
    @Body() data: StudyIdDto,
  ): Promise<IControllerResponse<IStudy>> {
    return this.studyPlanService.addInitialTestModule(
      user.userId,
      data.studyId,
    );
  }

  @Post('me')
  createMyStudy(
    @CurrentUser() user: AuthenticatedUser,
    @Body() data: CreateStudyDto,
  ): Promise<IControllerResponse<IStudy>> {
    return this.studyPlanService.createStudy(user.userId, data.context);
  }

  @Delete('me/:studyId')
  deleteMyStudy(
    @CurrentUser() user: AuthenticatedUser,
    @Param('studyId') studyId: string,
  ): Promise<IControllerResponse> {
    return this.studyPlanService.deleteStudy(user.userId, studyId);
  }

  @Post('modules')
  generateModules(
    @CurrentUser() user: AuthenticatedUser,
    @Body() data: StudyIdDto,
  ): Promise<IControllerResponse<IModule[]>> {
    return this.studyPlanService.generateModules(user.userId, data.studyId);
  }

  @Post('levels')
  generateLevels(
    @CurrentUser() user: AuthenticatedUser,
    @Body() data: GenerateLevelsDto,
  ): Promise<IControllerResponse<INotation[]>> {
    return this.studyPlanService.generateLevels(user.userId, data);
  }

  @Post('steps')
  generateSteps(
    @CurrentUser() user: AuthenticatedUser,
    @Body() data: GenerateStepsDto,
  ): Promise<IControllerResponse<IStep[]>> {
    return this.studyPlanService.generateSteps(user.userId, data);
  }

  @Post('steps/doc')
  generateDocumentation(
    @CurrentUser() user: AuthenticatedUser,
    @Body() data: GenerateStepContentDto,
  ): Promise<IControllerResponse<string>> {
    return this.studyPlanService.generateDocumentation(user.userId, data);
  }

  @Post('steps/code')
  generatePractice(
    @CurrentUser() user: AuthenticatedUser,
    @Body() data: GenerateStepContentDto,
  ): Promise<IControllerResponse<string>> {
    return this.studyPlanService.generatePractice(user.userId, data);
  }

  @Post('steps/quiz')
  generateQuiz(
    @CurrentUser() user: AuthenticatedUser,
    @Body() data: GenerateStepContentDto,
  ): Promise<IControllerResponse<IQuiz>> {
    return this.studyPlanService.generateQuiz(user.userId, data);
  }

  @Post('steps/quiz/submit')
  submitQuiz(
    @CurrentUser() user: AuthenticatedUser,
    @Body() data: SubmitQuizDto,
  ): Promise<
    IControllerResponse<{ correct: number; total: number; completed: boolean }>
  > {
    return this.studyPlanService.submitQuiz(user.userId, data);
  }
}
