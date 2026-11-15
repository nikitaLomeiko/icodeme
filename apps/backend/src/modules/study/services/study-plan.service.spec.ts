import { StudyPlanService } from './study-plan.service';
import { StudyService } from './study.service';
import { StudyGenerationService } from './study-generation.service';
import { StudyGenerationQuotaService } from './study-generation-quota.service';
import { IStudy } from '../models';

jest.mock('@core/database', () => ({ BaseMongoRepository: class {} }));
jest.mock('@core/helpers/generate-id', () => ({ generateId: () => 'id' }));

describe('StudyPlanService quiz submission', () => {
  const study: IStudy = {
    _id: 'study-1',
    userId: 'user-1',
    title: 'Python',
    description: '',
    createdAt: new Date(),
    updatedAt: new Date(),
    levelPlanJSON: [],
    level: { experienceToNextLevel: 10, positionCount: 0, positionName: '' },
    study: {
      context: 'python',
      module: 0,
      moduleTitle: '',
      level: 0,
      levelTitle: '',
      step: 0,
    },
    studyPlanJSON: [
      {
        title: 'Basics',
        description: '',
        levels: [
          {
            title: 'Level',
            description: '',
            isCompleted: false,
            isCurrent: true,
            steps: [
              {
                id: 'step-1',
                title: 'Quiz',
                description: '',
                type: 'quiz',
                isCompleted: false,
                isCurrent: true,
                position: { x: 0, y: 0 },
                settings: {},
                quiz: {
                  title: 'Quiz',
                  description: '',
                  questions: [
                    {
                      title: 'Q',
                      description: '',
                      type: 'abcd',
                      errors: [],
                      variants: [
                        { char: 'A', content: 'Right', isTrue: true },
                        { char: 'B', content: 'Wrong', isTrue: false },
                      ],
                    },
                  ],
                },
              },
            ],
          },
        ],
      },
    ],
  };

  const completeStep = jest.fn().mockResolvedValue(true);
  const studyService = {
    getStudyByIdAndUserId: jest
      .fn()
      .mockResolvedValue({ success: true, data: study }),
    completeStep,
  } as unknown as StudyService;
  const service = new StudyPlanService(
    studyService,
    {} as StudyGenerationService,
    {} as StudyGenerationQuotaService,
  );

  beforeEach(() => completeStep.mockClear());

  it('scores an answer against server data and completes the step', async () => {
    const result = await service.submitQuiz('user-1', {
      studyId: 'study-1',
      moduleIndex: 0,
      levelIndex: 0,
      stepIndex: 0,
      answers: { 'question-0': '0' },
    });
    expect(result.data).toEqual({ correct: 1, total: 1, completed: true });
    expect(completeStep).toHaveBeenCalledTimes(1);
  });

  it('does not complete a step for an incorrect answer', async () => {
    const result = await service.submitQuiz('user-1', {
      studyId: 'study-1',
      moduleIndex: 0,
      levelIndex: 0,
      stepIndex: 0,
      answers: { 'question-0': '1' },
    });
    expect(result.data).toEqual({ correct: 0, total: 1, completed: false });
    expect(completeStep).not.toHaveBeenCalled();
  });

  it('excludes questions without a checking key from the threshold', async () => {
    const quiz = study.studyPlanJSON[0].levels[0].steps[0].quiz!;
    quiz.questions.push({
      title: 'Open code review',
      description: '',
      type: 'code',
      code: { code: '', correctCode: [], correctResult: [] },
      errors: [],
    });
    try {
      const result = await service.submitQuiz('user-1', {
        studyId: 'study-1',
        moduleIndex: 0,
        levelIndex: 0,
        stepIndex: 0,
        answers: { 'question-0': '0' },
      });
      expect(result.data).toEqual({ correct: 1, total: 1, completed: true });
    } finally {
      quiz.questions.pop();
    }
  });
});
