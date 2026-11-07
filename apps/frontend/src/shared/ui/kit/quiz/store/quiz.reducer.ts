import { isQuestionAnswered } from "../libs/utils/selectors";
import { IQuizState } from "../types";
import { QuizAction } from "./actions";

const getTimeLimit = (state: IQuizState, index: number): number | null =>
  state.quiz?.questions[index]?.timeLimit ?? null;

const goNextFrom = (state: IQuizState): IQuizState => {
  const next = state.currentIndex + 1;
  if (next >= (state.quiz?.questions?.length || 0)) {
    return { ...state, phase: "finished" };
  }
  return { ...state, currentIndex: next, timeLeft: getTimeLimit(state, next) };
};

const skipQuestionState = (
  state: IQuizState,
  questionId: string,
): IQuizState => {
  const answers = { ...state.answers };
  delete answers[questionId];
  return {
    ...state,
    answers,
    skipped: { ...state.skipped, [questionId]: true },
  };
};

export const initialState: IQuizState = {
  quiz: null,
  phase: "idle",
  currentIndex: 0,
  timeLeft: null,
  answers: {},
  skipped: {},
};

export const quizReducer = (
  state: IQuizState,
  action: QuizAction,
): IQuizState => {
  switch (action.type) {
    case "SET_QUIZ":
      return { ...state, quiz: action.quiz };
    case "SET_TIME_LEFT":
      return { ...state, timeLeft: action.timeLeft };

    case "START":
      return {
        ...initialState,
        quiz: state.quiz,
        phase: "running",
        timeLeft: getTimeLimit(state, 0),
      };

    case "RESTART":
      return { ...initialState, quiz: state.quiz };

    case "FINISH":
      return { ...state, phase: "finished" };

    case "GO_TO":
      return {
        ...state,
        currentIndex: action.index,
        timeLeft: getTimeLimit(state, action.index),
      };

    case "GO_NEXT": {
      const question = state.quiz?.questions[state.currentIndex];
      const nextState = question
        ? !isQuestionAnswered(state.answers, question.id)
          ? skipQuestionState(state, question.id)
          : state
        : state;
      return goNextFrom(nextState);
    }

    case "GO_PREV": {
      const prev = Math.max(state.currentIndex - 1, 0);
      return {
        ...state,
        currentIndex: prev,
        timeLeft: getTimeLimit(state, prev),
      };
    }

    case "MARK_SKIPPED": {
      if (state.skipped[action.questionId]) return state;
      const answers = { ...state.answers };
      delete answers[action.questionId];
      return {
        ...state,
        answers,
        skipped: { ...state.skipped, [action.questionId]: true },
      };
    }

    case "SKIP_QUESTION": {
      const question = state.quiz?.questions[state.currentIndex];
      if (!question) return state;
      return goNextFrom(skipQuestionState(state, question.id));
    }

    case "SELECT_OPTION": {
      const question = state.quiz?.questions[state.currentIndex];
      if (!question || question.type !== "choice") return state;

      const skipped = state.skipped[question.id]
        ? { ...state.skipped, [question.id]: false }
        : state.skipped;

      if (question.multiple) {
        const current = Array.isArray(state.answers[question.id])
          ? (state.answers[question.id] as string[])
          : [];
        const next = current.includes(action.optionId)
          ? current.filter((id) => id !== action.optionId)
          : [...current, action.optionId];
        return {
          ...state,
          answers: { ...state.answers, [question.id]: next },
          skipped,
        };
      }

      return {
        ...state,
        answers: { ...state.answers, [question.id]: action.optionId },
        skipped,
      };
    }

    case "SET_TEXT_ANSWER": {
      const question = state.quiz?.questions[state.currentIndex];
      if (!question || question.type !== "text") return state;

      const skipped = state.skipped[question.id]
        ? { ...state.skipped, [question.id]: false }
        : state.skipped;

      return {
        ...state,
        answers: { ...state.answers, [question.id]: action.value },
        skipped,
      };
    }

    case "SET_FIELD_ANSWER": {
      const question = state.quiz?.questions[state.currentIndex];
      if (!question || question.type !== "fields" || !question.fields?.[action.index]) return state;
      const current = state.answers[question.id];
      const answer = Array.isArray(current) ? [...current] : [];
      answer[action.index] = action.value;
      return {
        ...state,
        answers: { ...state.answers, [question.id]: answer },
        skipped: { ...state.skipped, [question.id]: false },
      };
    }

    default:
      return state;
  }
};
