"use client";

import { Dispatch, useContext, useEffect, useMemo, useRef } from "react";
import { IQuizState } from "../types/types";
import { QuizAction } from "./actions";
import { quizContext, QuizStoreReturn } from "./quiz.provider";

export interface UseQuizReturn {
  state: IQuizState;
  dispatch: Dispatch<QuizAction>;
}

export const useQuiz = (): UseQuizReturn => {
  const context: QuizStoreReturn | null = useContext(quizContext);
  if (!context) {
    throw new Error("useQuiz must be used within QuizProvider");
  }

  const { state, dispatch } = context;
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  return useMemo<UseQuizReturn>(() => ({ state, dispatch }), [state, dispatch]);
};
