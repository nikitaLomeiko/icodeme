import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Request,
  UseGuards,
  NotFoundException,
  BadRequestException,
  Param,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { IModule, ISettings, IStep, IStudy } from '@models/study';
import { StudyService } from '@services/studyService/StudyService';
import type { IControllerResponse } from '@core/types/Response.type';
import type { INotation } from '@core/types/Notation.type';
import type { IQuiz } from '@models/study';
import { randomUUID } from 'crypto';

@Controller('study')
@UseGuards(AuthGuard('jwt'))
export class StudyController {
  constructor(private readonly studyService: StudyService) {}

  @Get('me')
  async getMyStudy(@Request() req): Promise<IControllerResponse<IStudy[]>> {
    const result = await this.studyService.getStudyByUserId(req.user.userId);
    return result;
  }

  @Get('me/:studyId')
  async getMyStudyById(
    @Request() req,
    @Param('studyId') studyId: string,
  ): Promise<IControllerResponse<IStudy>> {
    const result = await this.studyService.getStudyByIdAndUserId(
      studyId,
      req.user.userId,
    );

    if (!result.success || !result.data) {
      throw new NotFoundException('Study not found');
    }

    return { success: true, data: result.data };
  }

  @Post('test/modules')
  async insertTestModule(
    @Request() req,
    @Body() data: { studyId: string },
  ): Promise<IControllerResponse<IStudy>> {
    // Тестовые данные повторяют реальные модели IModule -> ILevel -> IStep.
    const levelContent = [
      {
        title: 'Переменные и типы данных',
        description: 'Работа с числами, строками, логическими значениями и преобразованием типов.',
        article: 'Переменная связывает имя со значением. Python определяет тип значения во время выполнения; для форматирования строк удобно использовать f-строки.',
        example: 'name = "Анна"\nage = 20\nprint(f"{name}: {age} лет")',
        exercise: 'Напишите функцию make_profile(name, age), которая возвращает строку «Имя: <name>, возраст: <age>». Убедитесь, что возраст форматируется как целое число.',
        advancedExercise: 'Реализуйте calculate_total(price, quantity, discount_percent), возвращающую итоговую стоимость после скидки. Проверьте вычисление на цене 1200, количестве 2 и скидке 15%.',
        question: 'Как вставить значение переменной name в строку f-формата?',
        answer: '{name}',
      },
      {
        title: 'Условия и логика',
        description: 'Ветвление программы, сравнения и составные логические выражения.',
        article: 'Условие if выполняет блок кода, когда выражение истинно. Для нескольких случаев используют elif и else; составные проверки связывают операторами and и or.',
        example: 'temperature = 18\nif temperature < 0:\n    weather = "мороз"\nelif temperature < 20:\n    weather = "прохладно"\nelse:\n    weather = "тепло"',
        exercise: 'Напишите функцию classify_score(score): она возвращает «отлично» для 90–100, «зачёт» для 60–89, «не зачёт» для 0–59 и «некорректный балл» вне диапазона.',
        advancedExercise: 'Реализуйте can_ride(age, height), возвращающую True, если посетителю не меньше 12 лет и его рост не меньше 140 см. Проверьте граничные значения.',
        question: 'Какой оператор требует, чтобы оба логических условия были истинны?',
        answer: 'and',
      },
      {
        title: 'Циклы',
        description: 'Повторение действий с помощью for и while, управление итерациями.',
        article: 'Цикл for перебирает элементы последовательности. range(start, stop) создаёт целочисленную последовательность, не включая stop. Цикл while повторяется, пока условие истинно.',
        example: 'prices = [120, 80, 250]\ntotal = 0\nfor price in prices:\n    total += price\nprint(total)  # 450',
        exercise: 'Напишите функцию sum_positive(numbers), которая циклом суммирует только положительные числа списка.',
        advancedExercise: 'Создайте функцию find_index(items, target), которая возвращает индекс первого совпадения или -1, если элемент не найден. Не используйте метод list.index().',
        question: 'Включает ли range(1, 5) число 5?',
        answer: 'Нет',
      },
      {
        title: 'Функции',
        description: 'Параметры, возвращаемые значения, область видимости и разбиение программы на части.',
        article: 'Функция объявляется через def. Параметры принимают входные данные, а return возвращает результат вызывающему коду. Значение по умолчанию задают в списке параметров.',
        example: 'def discounted_price(price, discount_percent=0):\n    return price * (1 - discount_percent / 100)\n\nprint(discounted_price(1000, 15))  # 850.0',
        exercise: 'Напишите функцию celsius_to_fahrenheit(celsius), возвращающую температуру по формуле F = C × 9 / 5 + 32.',
        advancedExercise: 'Разбейте расчёт заказа на функции: одна считает стоимость товаров, другая применяет скидку, третья добавляет налог. Каждая функция должна возвращать число.',
        question: 'Какое ключевое слово возвращает значение из функции?',
        answer: 'return',
      },
      {
        title: 'Списки и кортежи',
        description: 'Хранение последовательностей, индексы, срезы и обработка коллекций.',
        article: 'Список хранит упорядоченную изменяемую последовательность. Индексация начинается с нуля; срез items[a:b] включает a, но не включает b. Кортеж подходит для фиксированного набора значений.',
        example: 'scores = [4, 5, 3, 5]\nscores.append(4)\npassed = [score for score in scores if score >= 4]\nprint(passed)  # [4, 5, 5, 4]',
        exercise: 'Напишите функцию average_score(scores), которая возвращает среднее значение списка и None для пустого списка.',
        advancedExercise: 'Напишите функцию remove_duplicates(items), сохраняющую порядок первого появления элементов и возвращающую новый список.',
        question: 'Как добавить элемент в конец списка values?',
        answer: 'values.append(item)',
      },
      {
        title: 'Словари и множества',
        description: 'Хранение пар ключ-значение, подсчёт частот и удаление дубликатов.',
        article: 'Словарь сопоставляет уникальные ключи значениям. Метод get позволяет задать значение по умолчанию, а items возвращает пары ключ-значение. Множество хранит только уникальные элементы.',
        example: 'visits = {"/": 12, "/about": 5}\nvisits["/"] += 1\nvisits["/contact"] = 3\nunique_pages = set(visits)\nprint(unique_pages)',
        exercise: 'Напишите функцию count_words(words), возвращающую словарь, где каждому слову соответствует число его появлений.',
        advancedExercise: 'Для списка заказов вида [{"product": "чай", "quantity": 2}, ...] посчитайте суммарное количество каждого товара.',
        question: 'Какая структура данных автоматически хранит только уникальные значения?',
        answer: 'set',
      },
      {
        title: 'Строки и файлы',
        description: 'Обработка текстовых данных и безопасная работа с файлами.',
        article: 'Строки неизменяемы: методы strip, replace и lower возвращают новые строки. Файл открывают через with open(...), чтобы он закрылся автоматически; для русского текста указывают encoding="utf-8".',
        example: 'text = "  Python, код и практика  "\nwords = text.strip().replace(",", "").split()\nprint(words)  # ["Python", "код", "и", "практика"]',
        exercise: 'Напишите функцию normalize_line(line), удаляющую пробелы по краям и сводящую последовательность пробелов к одному.',
        advancedExercise: 'Реализуйте read_tasks(path): прочитайте UTF-8 файл, где одна задача записана в строке, удалите пустые строки и верните список задач.',
        question: 'Зачем файл открывают внутри конструкции with?',
        answer: 'Чтобы файл автоматически закрылся после выхода из блока',
      },
      {
        title: 'Ошибки и исключения',
        description: 'Проверка входных данных и обработка ожидаемых ошибок без падения программы.',
        article: 'Исключение сигнализирует об ошибке во время выполнения. Блок try содержит рискованную операцию, except обрабатывает ожидаемый тип ошибки. Не следует перехватывать Exception без необходимости.',
        example: 'def parse_age(value):\n    try:\n        age = int(value)\n    except ValueError:\n        return None\n    return age if age >= 0 else None',
        exercise: 'Напишите безопасную функцию parse_price(value), которая преобразует строку в положительное число и возвращает None при неверном формате или отрицательном значении.',
        advancedExercise: 'Создайте функцию withdraw(balance, amount): отклоняйте отрицательную сумму и снятие больше остатка через ValueError, иначе возвращайте новый баланс.',
        question: 'Какое исключение обычно возникает при int("abc")?',
        answer: 'ValueError',
      },
      {
        title: 'Классы и объекты',
        description: 'Моделирование предметной области с помощью классов, атрибутов и методов.',
        article: 'Класс описывает состояние и поведение объектов. Метод __init__ инициализирует экземпляр, а self ссылается на конкретный объект. Атрибуты экземпляра задаются через self.',
        example: 'class Counter:\n    def __init__(self, value=0):\n        self.value = value\n\n    def increment(self):\n        self.value += 1',
        exercise: 'Создайте класс BankAccount с владельцем и балансом. Добавьте методы deposit(amount) и withdraw(amount) с проверкой положительной суммы и достаточного баланса.',
        advancedExercise: 'Реализуйте класс ShoppingCart с методом add_item(name, price, quantity) и методом total(), возвращающим сумму заказа.',
        question: 'Как называется первый параметр метода экземпляра по соглашению Python?',
        answer: 'self',
      },
      {
        title: 'Модули и тестирование',
        description: 'Организация кода по файлам, импорт функций и проверка поведения программы.',
        article: 'Модуль — Python-файл, который можно импортировать. Блок if __name__ == "__main__" отделяет запуск программы от её импорта. Тесты фиксируют ожидаемое поведение функций.',
        example: 'def normalize_name(name):\n    return name.strip().title()\n\nassert normalize_name("  аННа ") == "Анна"\n\nif __name__ == "__main__":\n    print(normalize_name("иван"))',
        exercise: 'Напишите функцию add_task(tasks, title) и тесты для пустого списка, обычной задачи и строки с пробелами по краям.',
        advancedExercise: 'Создайте консольный трекер задач: добавление задачи, отметка выполнения и вывод списка. Разделите логику на функции и проверьте их через unittest.',
        question: 'Какой блок выполняется только при запуске файла как основной программы?',
        answer: 'if __name__ == "__main__"',
      },
    ];
    const stepPositions = [
      { x: 10, y: 60 },
      { x: 40, y: 460 },
      { x: 80, y: 900 },
      { x: 30, y: 1300 },
      { x: 20, y: 1700 },
      { x: 70, y: 2100 },
    ];
    const pythonDockerFile =
      'FROM python:3.11-slim\nWORKDIR /app\nCOPY . .\nCMD ["tail", "-f", "/dev/null"]';
    const terminalDockerFile =
      'FROM ubuntu:24.04\nWORKDIR /workspace\nCOPY . .\nCMD ["tail", "-f", "/dev/null"]';

    const levels: IModule['levels'] = levelContent.map((content, levelIndex) => {
      const makeQuiz = (title: string, description: string): IQuiz => ({
        title,
        description,
        questions: [
          {
            title: content.question,
            description: `Тема: ${content.title}.`,
            type: 'input',
            inputs: [{ label: 'Введите ответ', input: '', correct: [content.answer] }],
            errors: [{ message: `Повторите раздел документации «${content.title}» и проверьте синтаксис в примере.` }],
          },
          {
            title: 'Какой результат выведет пример?',
            description: `Разберите код и предскажите результат.\n\n\`\`\`python\n${content.example}\n\`\`\``,
            type: 'code',
            code: { code: content.example, correctCode: [], correctResult: [] },
            errors: [{ message: 'Проследите за выполнением кода по строкам и уточните значения переменных после каждого шага.' }],
          },
          {
            title: 'Верно ли, что код следует проверять на граничных значениях?',
            description: 'Например, на пустых данных, нуле, минимальном и максимальном допустимых значениях.',
            type: 'true/false',
            truefolse: { isTrue: true, correct: true },
            errors: [{ message: 'Граничные случаи часто выявляют ошибки, которые не видны на обычном примере.' }],
          },
        ],
      });

      const quiz = makeQuiz(`Проверка: ${content.title}`, `Проверьте понимание темы «${content.title}» на вопросах и примере кода.`);
      const exam = makeQuiz(`Итоговая проверка: ${content.title}`, `Проверьте, можете ли вы применить знания уровня «${content.title}» на практике.`);

      return {
        title: content.title,
        description: content.description,
        isCompleted: false,
        isCurrent: levelIndex === 0,
        steps: [
          {
            title: `Основы: ${content.title}`,
            description: `Изучите ключевые правила темы «${content.title}» и разберите пример.`,
            type: 'document' as const,
            document: `# ${content.title}\n\n${content.description}\n\n## Основные положения\n\n${content.article}\n\n## Пример на Python\n\n\`\`\`python\n${content.example}\n\`\`\`\n\n## На что обратить внимание\n\nПроверьте, что входные данные соответствуют ожидаемому типу. Разделяйте вычисления на понятные шаги и проверяйте граничные случаи.`,
          },
          {
            title: `Разбор примера: ${content.title}`,
            description: 'Прочитайте пример, объясните назначение каждой строки и предскажите результат до запуска.',
            type: 'document' as const,
            document: `# Разбор кода\n\n\`\`\`python\n${content.example}\n\`\`\`\n\n## Разбор\n\nПроследите за значениями переменных в порядке выполнения. Обратите внимание на используемые конструкции Python и на то, какое значение или результат они создают. Измените входные данные и сравните результат.`,
          },
          {
            title: `Практика: ${content.title}`,
            description: content.exercise,
            type: 'code' as const,
            code: `${content.exercise}\n\nПроверьте решение как минимум на двух обычных примерах и одном граничном случае.`,
          },
          ...(levelIndex === 0
            ? [{
                title: 'Первые команды Linux',
                description: 'Откройте терминал, выполните pwd и ls, затем создайте каталог через mkdir и перейдите в него командой cd.',
                type: 'terminal' as const,
              }]
            : []),
          {
            title: `Проверка знаний: ${content.title}`,
            description: 'Ответьте на вопросы и разберите поведение кода.',
            type: 'quiz' as const,
            quiz,
          },
          {
            title: `Итоговое задание: ${content.title}`,
            description: `Выполните итоговое задание: ${content.advancedExercise}`,
            type: 'exam' as const,
            code: content.advancedExercise,
            exam,
          },
        ].map((step, stepIndex) => {
          let settings: ISettings = { startCommand: [] };

          if (step.type === 'code' || step.type === 'exam') {
            settings = {
              language: 'python',
              dockerFile: pythonDockerFile,
              initProject: {
                name: `python-level-${levelIndex + 1}-step-${stepIndex + 1}`,
                title: step.title,
                subtitle: content.description,
                language: 'python',
              },
              entryFile: 'main.py',
              timeLimitMs: 5000,
              memoryLimitMb: 256,
              startCommand: ['python', '-u', 'main.py'],
            };
          } else if (step.type === 'terminal') {
            settings = {
              language: 'bash',
              dockerFile: terminalDockerFile,
              initProject: {
                name: 'linux-terminal-basics',
                title: step.title,
                subtitle: 'Практика базовых команд Linux',
                language: 'bash',
              },
              timeLimitMs: 30000,
              memoryLimitMb: 128,
              startCommand: ['/bin/bash'],
            };
          }

          return {
            ...step,
            id: randomUUID(),
            isCompleted: levelIndex === 0 && stepIndex < 3,
            isCurrent: levelIndex === 0 && stepIndex === 3,
            position: stepPositions[stepIndex],
            settings,
          };
        }),
      };
    });

    const module: IModule = {
      title: 'Python: от основ до первого проекта',
      description: 'Практический курс по Python: от переменных и ветвлений до организации кода и тестирования.',
      levels,
    };

    const result = await this.studyService.getStudyByUserId(req.user.userId);
    const study = result.data?.find((item) => item._id === data.studyId);

    if (!study) {
      throw new NotFoundException('Study not found');
    }

    const studyPlan = [...study.studyPlanJSON, module];
    const resultChanged = await this.studyService.ChangeStudyPlanById(
      studyPlan,
      data.studyId,
    );

    if (!resultChanged.success || !resultChanged.data) {
      throw new BadRequestException(
        resultChanged.error || 'Failed to insert test module',
      );
    }

    return { success: true, data: resultChanged.data };
  }

  @Post('me')
  async createNewStudy(
    @Request() req,
    @Body() data: { context: string },
  ): Promise<IControllerResponse<IStudy>> {
    const result = await this.studyService.createNewStudy(
      data.context,
      req.user.userId,
    );

    if (!result.success) {
      throw new BadRequestException('Error when creating a study');
    }

    return result;
  }

  @Delete('me/:studyId')
  async deleteMyStudy(
    @Request() req,
    @Param('studyId') studyId: string,
  ): Promise<IControllerResponse> {
    const result = await this.studyService.removeStudyById(
      studyId,
      req.user.userId,
    );

    if (!result.success) {
      throw new NotFoundException(result.error);
    }

    return result;
  }

  @Post('modules')
  async generateStudyModule(
    @Request() req,
    @Body() data: { studyId: string },
  ): Promise<IControllerResponse<IModule[]>> {
    const result = await this.studyService.getStudyByUserId(req.user.userId);
    const study = result.data?.find((item) => item._id === data.studyId);

    if (!study) {
      throw new NotFoundException(result.error);
    }

    if (study.studyPlanJSON.length !== 0) {
      throw new BadRequestException('Study plan already formed');
    }

    const resultGenerated = await this.studyService.generateStudyModules(
      study.study.context,
    );

    const modules = resultGenerated.data;

    if (!resultGenerated.success || !modules) {
      throw new BadRequestException(
        resultGenerated.error || 'Failed to generate modules',
      );
    }

    const newStudyPlan: IModule[] = [];

    modules.forEach((module) => {
      newStudyPlan.push({
        ...module,
        levels: [],
      });
    });

    const resultChanged = await this.studyService.ChangeStudyPlanById(
      newStudyPlan,
      data.studyId,
    );

    if (!resultChanged.success) {
      throw new NotFoundException(resultChanged.error);
    }

    return { success: true, data: newStudyPlan };
  }

  @Post('levels')
  async generateStudyLevels(
    @Request() req,
    @Body() data: { moduleIndex: number; studyId: string },
  ): Promise<IControllerResponse<INotation[]>> {
    const result = await this.studyService.getStudyByUserId(req.user.userId);
    const study = result.data?.find((item) => item._id === data.studyId);

    if (!study) {
      throw new NotFoundException(result.error);
    }

    if (study.studyPlanJSON.length === 0) {
      throw new NotFoundException('Study plan not found');
    }

    if (study.studyPlanJSON.length < data.moduleIndex) {
      throw new NotFoundException('Study plan not found');
    }

    const module = study.studyPlanJSON[data.moduleIndex];

    const resultGenerated = await this.studyService.generateStudyLevels(
      module,
      study.study.context,
    );

    const levels = resultGenerated.data;

    if (!resultGenerated.success || !levels) {
      throw new BadRequestException(
        result.error || 'Failed to generate levels',
      );
    }

    levels.forEach((level) => {
      module.levels?.push({
        ...level,
        isCompleted: false,
        isCurrent: module.levels.length === 0,
        steps: [],
      });
    });

    study.studyPlanJSON[data.moduleIndex] = module;

    const resultChanged = await this.studyService.ChangeStudyPlanById(
      study.studyPlanJSON,
      data.studyId,
    );

    if (!resultChanged.success) {
      throw new NotFoundException(resultChanged.error);
    }

    return { success: true, data: levels };
  }

  @Post('steps')
  async generateStudySteps(
    @Request() req,
    @Body() data: { moduleIndex: number; levelIndex: number; studyId: string },
  ): Promise<IControllerResponse<IStep[]>> {
    const result = await this.studyService.getStudyByUserId(req.user.userId);
    const study = result.data?.find((item) => item._id === data.studyId);

    if (!study) {
      throw new NotFoundException(result.error);
    }

    if (study.studyPlanJSON.length === 0) {
      throw new NotFoundException('Study plan not found');
    }

    if (study.studyPlanJSON.length < data.moduleIndex) {
      throw new NotFoundException('Study plan not found');
    }

    if (study.studyPlanJSON[data.moduleIndex].levels.length < data.levelIndex) {
      throw new NotFoundException('Study plan not found');
    }

    const module = study.studyPlanJSON[data.moduleIndex];
    const level = module.levels[data.levelIndex];

    const resultGenerated = await this.studyService.generateStudySteps(
      module,
      level,
      study.study.context,
    );

    const steps = resultGenerated.data;

    if (!resultGenerated.success || !steps) {
      throw new BadRequestException(
        resultGenerated.error || 'Failed to generate steps',
      );
    }

    const stepsWithIds = steps.map((step) => ({ ...step, id: randomUUID() }));
    level.steps.push(...stepsWithIds);

    study.studyPlanJSON[data.moduleIndex].levels[data.levelIndex] = level;

    const resultChanged = await this.studyService.ChangeStudyPlanById(
      study.studyPlanJSON,
      data.studyId,
    );

    if (!resultChanged.success) {
      throw new NotFoundException(resultChanged.error);
    }

    return { success: true, data: stepsWithIds };
  }

  @Post('steps/doc')
  async generateStepDocumentation(
    @Request() req,
    @Body()
    data: {
      moduleIndex: number;
      levelIndex: number;
      stepIndex: number;
      studyId: string;
    },
  ): Promise<IControllerResponse<string>> {
    const result = await this.studyService.getStudyByUserId(req.user.userId);
    const study = result.data?.find((item) => item._id === data.studyId);

    if (!study) {
      throw new NotFoundException(result.error || 'Profile not found');
    }

    if (study.studyPlanJSON.length === 0) {
      throw new NotFoundException('Study plan not found');
    }

    if (study.studyPlanJSON.length <= data.moduleIndex) {
      throw new NotFoundException('Module not found');
    }

    if (
      study.studyPlanJSON[data.moduleIndex].levels.length <= data.levelIndex
    ) {
      throw new NotFoundException('Level not found');
    }

    if (
      study.studyPlanJSON[data.moduleIndex].levels[data.levelIndex].steps
        .length <= data.stepIndex
    ) {
      throw new NotFoundException('Step not found');
    }

    const module = study.studyPlanJSON[data.moduleIndex];
    const level = module.levels[data.levelIndex];
    const step = level.steps[data.stepIndex];

    const resultGenerated = await this.studyService.generateDocumentation(
      module,
      level,
      step,
      study.study.context,
    );

    const document = resultGenerated.data;

    if (!resultGenerated.success || !document) {
      throw new BadRequestException(
        resultGenerated.error || 'Failed to generate document',
      );
    }

    study.studyPlanJSON[data.moduleIndex].levels[data.levelIndex].steps[
      data.stepIndex
    ].document = document;

    const resultChanged = await this.studyService.ChangeStudyPlanById(
      study.studyPlanJSON,
      data.studyId,
    );

    if (!resultChanged.success) {
      throw new NotFoundException(resultChanged.error);
    }

    return { success: true, data: document };
  }

  @Post('steps/code')
  async generateStepPractice(
    @Request() req,
    @Body()
    data: {
      moduleIndex: number;
      levelIndex: number;
      stepIndex: number;
      studyId: string;
    },
  ): Promise<IControllerResponse<string>> {
    const result = await this.studyService.getStudyByUserId(req.user.userId);
    const study = result.data?.find((item) => item._id === data.studyId);

    if (!study) {
      throw new NotFoundException(result.error || 'Profile not found');
    }

    if (study.studyPlanJSON.length === 0) {
      throw new NotFoundException('Study plan not found');
    }

    if (study.studyPlanJSON.length <= data.moduleIndex) {
      throw new NotFoundException('Module not found');
    }

    if (
      study.studyPlanJSON[data.moduleIndex].levels.length <= data.levelIndex
    ) {
      throw new NotFoundException('Level not found');
    }

    if (
      study.studyPlanJSON[data.moduleIndex].levels[data.levelIndex].steps
        .length <= data.stepIndex
    ) {
      throw new NotFoundException('Step not found');
    }

    const module = study.studyPlanJSON[data.moduleIndex];
    const level = module.levels[data.levelIndex];
    const step = level.steps[data.stepIndex];

    const resultGenerated = await this.studyService.generatePractice(
      module,
      level,
      step,
      study.study.context,
    );

    const practice = resultGenerated.data;

    if (!resultGenerated.success || !practice) {
      throw new BadRequestException(
        resultGenerated.error || 'Failed to generate practice',
      );
    }

    study.studyPlanJSON[data.moduleIndex].levels[data.levelIndex].steps[
      data.stepIndex
    ].code = practice;

    const resultChanged = await this.studyService.ChangeStudyPlanById(
      study.studyPlanJSON,
      data.studyId,
    );

    if (!resultChanged.success) {
      throw new NotFoundException(resultChanged.error);
    }

    return {
      success: true,
      data: practice,
    };
  }

  @Post('steps/quiz')
  async generateStepQuiz(
    @Request() req,
    @Body()
    data: {
      moduleIndex: number;
      levelIndex: number;
      stepIndex: number;
      studyId: string;
    },
  ): Promise<IControllerResponse<IQuiz>> {
    const result = await this.studyService.getStudyByUserId(req.user.userId);
    const study = result.data?.find((item) => item._id === data.studyId);

    if (!study) {
      throw new NotFoundException(result.error || 'Profile not found');
    }

    if (study.studyPlanJSON.length === 0) {
      throw new NotFoundException('Study plan not found');
    }

    if (study.studyPlanJSON.length <= data.moduleIndex) {
      throw new NotFoundException('Module not found');
    }

    if (
      study.studyPlanJSON[data.moduleIndex].levels.length <= data.levelIndex
    ) {
      throw new NotFoundException('Level not found');
    }

    if (
      study.studyPlanJSON[data.moduleIndex].levels[data.levelIndex].steps
        .length <= data.stepIndex
    ) {
      throw new NotFoundException('Step not found');
    }

    const module = study.studyPlanJSON[data.moduleIndex];
    const level = module.levels[data.levelIndex];
    const step = level.steps[data.stepIndex];

    const resultGenerated = await this.studyService.generateQuiz(
      module,
      level,
      step,
      study.study.context,
    );

    const quiz = resultGenerated.data;

    if (!resultGenerated.success || !quiz) {
      throw new BadRequestException(
        resultGenerated.error || 'Failed to generate quiz',
      );
    }

    study.studyPlanJSON[data.moduleIndex].levels[data.levelIndex].steps[
      data.stepIndex
    ].quiz = quiz;

    const resultChanged = await this.studyService.ChangeStudyPlanById(
      study.studyPlanJSON,
      data.studyId,
    );

    if (!resultChanged.success) {
      throw new NotFoundException(resultChanged.error);
    }

    return { success: true, data: quiz };
  }
}
