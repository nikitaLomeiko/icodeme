import { randomUUID } from 'crypto';
import type { IModule, IQuiz, ISettings } from '../models';

export const createInteractiveTestQuiz = (): IQuiz => ({
  title: 'Пробный тест: основы Python',
  description:
    'Короткий тест для проверки разных форматов вопросов: выбор, ввод ответа, верно/неверно и результат кода.',
  questions: [
    {
      title: 'Какой тип данных вернёт выражение 3 > 1?',
      description: 'Выберите один вариант ответа.',
      type: 'abcd',
      variants: [
        { char: 'A', content: 'Строка', isTrue: false },
        { char: 'B', content: 'Логическое значение', isTrue: true },
        { char: 'C', content: 'Список', isTrue: false },
      ],
      errors: [{ message: 'Сравнение возвращает True или False.' }],
    },
    {
      title: 'Чему равно 2 + 4?',
      description: 'Введите число.',
      type: 'input',
      inputs: [{ label: 'Ответ', input: 'Например, 6', correct: ['6'] }],
      errors: [{ message: 'Сложите два числа.' }],
    },
    {
      title: 'Функция print выводит значение в консоль.',
      description: 'Отметьте, верно ли утверждение.',
      type: 'true/false',
      truefolse: { isTrue: true, correct: true },
      errors: [{ message: 'print показывает значение в консоли.' }],
    },
    {
      title: 'Какой результат выведет этот код?',
      description: 'Введите результат выполнения программы.',
      type: 'code',
      code: { code: 'print(2 + 4)', correctCode: [], correctResult: ['6'] },
      errors: [{ message: 'Выполните сложение перед выводом.' }],
    },
  ],
});

export const createTestStudyModule = (): IModule => {
  // Тестовые данные повторяют реальные модели IModule -> ILevel -> IStep.
  const levelContent = [
    {
      title: 'Переменные и типы данных',
      description:
        'Работа с числами, строками, логическими значениями и преобразованием типов.',
      article:
        'Переменная связывает имя со значением. Python определяет тип значения во время выполнения; для форматирования строк удобно использовать f-строки.',
      example: 'name = "Анна"\nage = 20\nprint(f"{name}: {age} лет")',
      exercise:
        'Напишите функцию make_profile(name, age), которая возвращает строку «Имя: <name>, возраст: <age>». Убедитесь, что возраст форматируется как целое число.',
    },
    {
      title: 'Условия и логика',
      description:
        'Ветвление программы, сравнения и составные логические выражения.',
      article:
        'Условие if выполняет блок кода, когда выражение истинно. Для нескольких случаев используют elif и else; составные проверки связывают операторами and и or.',
      example:
        'temperature = 18\nif temperature < 0:\n    weather = "мороз"\nelif temperature < 20:\n    weather = "прохладно"\nelse:\n    weather = "тепло"',
      exercise:
        'Напишите функцию classify_score(score): она возвращает «отлично» для 90–100, «зачёт» для 60–89, «не зачёт» для 0–59 и «некорректный балл» вне диапазона.',
    },
    {
      title: 'Циклы',
      description:
        'Повторение действий с помощью for и while, управление итерациями.',
      article:
        'Цикл for перебирает элементы последовательности. range(start, stop) создаёт целочисленную последовательность, не включая stop. Цикл while повторяется, пока условие истинно.',
      example:
        'prices = [120, 80, 250]\ntotal = 0\nfor price in prices:\n    total += price\nprint(total)  # 450',
      exercise:
        'Напишите функцию sum_positive(numbers), которая циклом суммирует только положительные числа списка.',
    },
    {
      title: 'Функции',
      description:
        'Параметры, возвращаемые значения, область видимости и разбиение программы на части.',
      article:
        'Функция объявляется через def. Параметры принимают входные данные, а return возвращает результат вызывающему коду. Значение по умолчанию задают в списке параметров.',
      example:
        'def discounted_price(price, discount_percent=0):\n    return price * (1 - discount_percent / 100)\n\nprint(discounted_price(1000, 15))  # 850.0',
      exercise:
        'Напишите функцию celsius_to_fahrenheit(celsius), возвращающую температуру по формуле F = C × 9 / 5 + 32.',
    },
    {
      title: 'Списки и кортежи',
      description:
        'Хранение последовательностей, индексы, срезы и обработка коллекций.',
      article:
        'Список хранит упорядоченную изменяемую последовательность. Индексация начинается с нуля; срез items[a:b] включает a, но не включает b. Кортеж подходит для фиксированного набора значений.',
      example:
        'scores = [4, 5, 3, 5]\nscores.append(4)\npassed = [score for score in scores if score >= 4]\nprint(passed)  # [4, 5, 5, 4]',
      exercise:
        'Напишите функцию average_score(scores), которая возвращает среднее значение списка и None для пустого списка.',
    },
    {
      title: 'Словари и множества',
      description:
        'Хранение пар ключ-значение, подсчёт частот и удаление дубликатов.',
      article:
        'Словарь сопоставляет уникальные ключи значениям. Метод get позволяет задать значение по умолчанию, а items возвращает пары ключ-значение. Множество хранит только уникальные элементы.',
      example:
        'visits = {"/": 12, "/about": 5}\nvisits["/"] += 1\nvisits["/contact"] = 3\nunique_pages = set(visits)\nprint(unique_pages)',
      exercise:
        'Напишите функцию count_words(words), возвращающую словарь, где каждому слову соответствует число его появлений.',
    },
    {
      title: 'Строки и файлы',
      description: 'Обработка текстовых данных и безопасная работа с файлами.',
      article:
        'Строки неизменяемы: методы strip, replace и lower возвращают новые строки. Файл открывают через with open(...), чтобы он закрылся автоматически; для русского текста указывают encoding="utf-8".',
      example:
        'text = "  Python, код и практика  "\nwords = text.strip().replace(",", "").split()\nprint(words)  # ["Python", "код", "и", "практика"]',
      exercise:
        'Напишите функцию normalize_line(line), удаляющую пробелы по краям и сводящую последовательность пробелов к одному.',
    },
    {
      title: 'Ошибки и исключения',
      description:
        'Проверка входных данных и обработка ожидаемых ошибок без падения программы.',
      article:
        'Исключение сигнализирует об ошибке во время выполнения. Блок try содержит рискованную операцию, except обрабатывает ожидаемый тип ошибки. Не следует перехватывать Exception без необходимости.',
      example:
        'def parse_age(value):\n    try:\n        age = int(value)\n    except ValueError:\n        return None\n    return age if age >= 0 else None',
      exercise:
        'Напишите безопасную функцию parse_price(value), которая преобразует строку в положительное число и возвращает None при неверном формате или отрицательном значении.',
    },
    {
      title: 'Классы и объекты',
      description:
        'Моделирование предметной области с помощью классов, атрибутов и методов.',
      article:
        'Класс описывает состояние и поведение объектов. Метод __init__ инициализирует экземпляр, а self ссылается на конкретный объект. Атрибуты экземпляра задаются через self.',
      example:
        'class Counter:\n    def __init__(self, value=0):\n        self.value = value\n\n    def increment(self):\n        self.value += 1',
      exercise:
        'Создайте класс BankAccount с владельцем и балансом. Добавьте методы deposit(amount) и withdraw(amount) с проверкой положительной суммы и достаточного баланса.',
    },
    {
      title: 'Модули и тестирование',
      description:
        'Организация кода по файлам, импорт функций и проверка поведения программы.',
      article:
        'Модуль — Python-файл, который можно импортировать. Блок if __name__ == "__main__" отделяет запуск программы от её импорта. Тесты фиксируют ожидаемое поведение функций.',
      example:
        'def normalize_name(name):\n    return name.strip().title()\n\nassert normalize_name("  аННа ") == "Анна"\n\nif __name__ == "__main__":\n    print(normalize_name("иван"))',
      exercise:
        'Напишите функцию add_task(tasks, title) и тесты для пустого списка, обычной задачи и строки с пробелами по краям.',
    },
  ];
  const stepPositions = [
    { x: 10, y: 60 },
    { x: 40, y: 460 },
    { x: 80, y: 900 },
    { x: 30, y: 1300 },
    { x: 20, y: 1700 },
  ];
  const interactiveTest = createInteractiveTestQuiz();
  const pythonDockerFile = [
    'FROM python:3.11-slim',
    'WORKDIR /app',
    'ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1',
    'RUN useradd -u 10001 -m learner',
    'COPY --chown=10001:10001 . .',
    'USER 10001',
    'CMD ["tail", "-f", "/dev/null"]',
  ].join('\n');
  const terminalDockerFile =
    'FROM ubuntu:24.04\nWORKDIR /workspace\nRUN useradd -u 10001 -m learner\nCOPY --chown=10001:10001 . .\nUSER 10001\nCMD ["tail", "-f", "/dev/null"]';

  const levels: IModule['levels'] = levelContent.map((content, levelIndex) => {
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
          description:
            'Прочитайте пример, объясните назначение каждой строки и предскажите результат до запуска.',
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
          ? [
              {
                title: 'Первые команды Linux',
                description:
                  'Откройте терминал, выполните pwd и ls, затем создайте каталог через mkdir и перейдите в него командой cd.',
                type: 'terminal' as const,
              },
            ]
          : []),
        ...(levelIndex === 0
          ? [
              {
                title: 'Пробный тест: основы Python',
                description: interactiveTest.description,
                type: 'test' as const,
                quiz: interactiveTest,
              },
            ]
          : []),
      ].map((step, stepIndex) => {
        let settings: ISettings = { startCommand: [] };

        if (step.type === 'code') {
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
    description:
      'Практический курс по Python: от переменных и ветвлений до организации кода и тестирования.',
    levels,
  };

  return module;
};
