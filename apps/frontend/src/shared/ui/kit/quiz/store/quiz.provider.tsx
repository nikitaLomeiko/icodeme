"use client";

import { createContext, Dispatch, useEffect, useReducer } from "react";
import { initialState, quizReducer } from "./quiz.reducer";
import { QuizAction, setQuiz } from "./actions";
import { IQuizState, ITest } from "../types";

export interface QuizStoreReturn {
  state: IQuizState;
  dispatch: Dispatch<QuizAction>;
}

interface IProps {
  children: React.ReactNode;
  quiz: ITest;
}

export const quizContext = createContext<QuizStoreReturn | null>(null);

export const QuizProvider: React.FC<IProps> = ({ children, quiz }) => {
  const [state, dispatch] = useReducer(quizReducer, initialState);

  useEffect(() => {
    dispatch(setQuiz(quiz));
  }, [quiz]);

  return (
    <quizContext.Provider value={{ state, dispatch }}>
      {children}
    </quizContext.Provider>
  );
};
