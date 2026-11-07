import type { IQuestion as StudyQuestion, IQuiz as StudyQuiz } from "@/entities/study";
import type { IQuestion, ITest } from "@/shared/ui/kit/quiz";

function adaptQuestion(question: StudyQuestion, index: number): IQuestion {
  const base = {
    id: `question-${index}`,
    title: question.title,
    description: question.description,
    errors: question.errors?.map((error) => error.message),
  };

  switch (question.type) {
    case "abcd": {
      const variants = question.variants ?? [];
      return {
        ...base,
        type: "choice",
        options: variants.map((variant, optionIndex) => ({
          id: String(optionIndex),
          label: variant.content,
        })),
        correct: variants.flatMap((variant, optionIndex) => variant.isTrue ? [String(optionIndex)] : []),
        multiple: variants.filter((variant) => variant.isTrue).length > 1,
      };
    }
    case "true/false":
      return {
        ...base,
        type: "choice",
        options: [{ id: "true", label: "Верно" }, { id: "false", label: "Неверно" }],
        correct: question.truefolse ? [String(question.truefolse.correct)] : [],
      };
    case "input": {
      const inputs = question.inputs ?? [];
      return inputs.length === 1
        ? { ...base, type: "text", correct: inputs[0].correct, answerLabel: inputs[0].label, answerPlaceholder: inputs[0].input }
        : { ...base, type: "fields", fields: inputs.map((input) => ({ label: input.label, placeholder: input.input, correct: input.correct })) };
    }
    case "code":
      return {
        ...base,
        type: "text",
        codeSnippet: question.code?.code,
        correct: [...(question.code?.correctCode ?? []), ...(question.code?.correctResult ?? [])],
        answerPlaceholder: "Напишите код или результат выполнения",
      };
  }
}

export function adaptStudyQuiz(quiz: StudyQuiz): ITest {
  return {
    title: quiz.title,
    description: quiz.description,
    settings: { isScore: false, isNavigate: true },
    questions: quiz.questions.map(adaptQuestion),
  };
}
