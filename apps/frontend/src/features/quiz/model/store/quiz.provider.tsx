"use client";

import { useEffect, useRef } from "react";
import { useAppDispatch } from "@/shared/lib";
import type { ITest } from "../types";
import { loadQuiz, resetQuiz } from "./quiz.slice";

interface IProps {
  children: React.ReactNode;
  quiz: ITest;
}

export const QuizProvider: React.FC<IProps> = ({ children, quiz }) => {
  const dispatch = useAppDispatch();
  // Study refetches create new object references without changing quiz content.
  const quizKey = JSON.stringify(quiz);
  const quizRef = useRef({ key: quizKey, quiz });

  if (quizRef.current.key !== quizKey) {
    quizRef.current = { key: quizKey, quiz };
  }

  useEffect(() => {
    dispatch(loadQuiz(quizRef.current.quiz));
    return () => {
      dispatch(resetQuiz());
    };
  }, [dispatch, quizKey]);

  return children;
};
