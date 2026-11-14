import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { isQuestionAnswered } from "../libs/utils/selectors";
import type { IQuizState, ITest } from "../types";

export const initialQuizState: IQuizState = {
  quiz: null,
  phase: "idle",
  currentIndex: 0,
  timeLeft: null,
  answers: {},
  skipped: {},
};

const getTimeLimit = (state: IQuizState, index: number) =>
  state.quiz?.questions[index]?.timeLimit ?? null;

const advance = (state: IQuizState) => {
  const nextIndex = state.currentIndex + 1;
  if (nextIndex >= (state.quiz?.questions.length ?? 0)) {
    state.phase = "finished";
    return;
  }
  state.currentIndex = nextIndex;
  state.timeLeft = getTimeLimit(state, nextIndex);
};

const skip = (state: IQuizState, questionId: string) => {
  delete state.answers[questionId];
  state.skipped[questionId] = true;
};

const quizSlice = createSlice({
  name: "quiz",
  initialState: initialQuizState,
  reducers: {
    loadQuiz: (_state, action: PayloadAction<ITest>) => ({
      ...initialQuizState,
      quiz: action.payload,
    }),
    resetQuiz: () => initialQuizState,
    setQuiz: (state, action: PayloadAction<ITest>) => {
      state.quiz = action.payload;
    },
    setTimeLeft: (state, action: PayloadAction<number | null>) => {
      state.timeLeft = action.payload;
    },
    startQuiz: (state) => {
      const quiz = state.quiz;
      Object.assign(state, initialQuizState, {
        quiz,
        phase: "running",
        timeLeft: getTimeLimit(state, 0),
      });
    },
    restartQuiz: (state) => {
      const quiz = state.quiz;
      Object.assign(state, initialQuizState, { quiz });
    },
    finishQuiz: (state) => {
      state.phase = "finished";
    },
    goToQuestion: (state, action: PayloadAction<number>) => {
      state.currentIndex = action.payload;
      state.timeLeft = getTimeLimit(state, action.payload);
    },
    goNextQuestion: (state) => {
      const question = state.quiz?.questions[state.currentIndex];
      if (question && !isQuestionAnswered(state.answers, question.id)) {
        skip(state, question.id);
      }
      advance(state);
    },
    goPrevQuestion: (state) => {
      const previous = Math.max(state.currentIndex - 1, 0);
      state.currentIndex = previous;
      state.timeLeft = getTimeLimit(state, previous);
    },
    markSkipped: (state, action: PayloadAction<string>) => {
      if (!state.skipped[action.payload]) skip(state, action.payload);
    },
    skipQuestion: (state) => {
      const question = state.quiz?.questions[state.currentIndex];
      if (!question) return;
      skip(state, question.id);
      advance(state);
    },
    selectOption: (state, action: PayloadAction<string>) => {
      const question = state.quiz?.questions[state.currentIndex];
      if (!question || question.type !== "choice") return;

      if (state.skipped[question.id]) state.skipped[question.id] = false;
      if (question.multiple) {
        const current = state.answers[question.id];
        const selected = Array.isArray(current) ? current : [];
        state.answers[question.id] = selected.includes(action.payload)
          ? selected.filter((id) => id !== action.payload)
          : [...selected, action.payload];
      } else {
        state.answers[question.id] = action.payload;
      }
    },
    setTextAnswer: (state, action: PayloadAction<string>) => {
      const question = state.quiz?.questions[state.currentIndex];
      if (!question || question.type !== "text") return;
      state.answers[question.id] = action.payload;
      if (state.skipped[question.id]) state.skipped[question.id] = false;
    },
    setFieldAnswer: (
      state,
      action: PayloadAction<{ index: number; value: string }>,
    ) => {
      const question = state.quiz?.questions[state.currentIndex];
      const { index, value } = action.payload;
      if (
        !question ||
        question.type !== "fields" ||
        !question.fields?.[index]
      ) {
        return;
      }
      const current = state.answers[question.id];
      const answer = Array.isArray(current) ? [...current] : [];
      answer[index] = value;
      state.answers[question.id] = answer;
      state.skipped[question.id] = false;
    },
  },
});

export const quizReducer = quizSlice.reducer;
export const {
  loadQuiz,
  resetQuiz,
  setQuiz,
  setTimeLeft,
  startQuiz,
  restartQuiz,
  finishQuiz,
  goToQuestion,
  goNextQuestion,
  goPrevQuestion,
  markSkipped,
  skipQuestion,
  selectOption,
  setTextAnswer,
  setFieldAnswer,
} = quizSlice.actions;
