"use client";

import { useEffect } from "react";
import { useAppDispatch } from "@/shared/lib";
import type { ITest } from "../types";
import { loadQuiz, resetQuiz } from "./quiz.slice";

interface IProps {
  children: React.ReactNode;
  quiz: ITest;
}

export const QuizProvider: React.FC<IProps> = ({ children, quiz }) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(loadQuiz(quiz));
    return () => {
      dispatch(resetQuiz());
    };
  }, [dispatch, quiz]);

  return children;
};
