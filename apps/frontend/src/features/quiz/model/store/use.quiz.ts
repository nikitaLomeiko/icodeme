"use client";

import { useAppDispatch, useAppSelector } from "@/shared/lib";
import type { IQuizState } from "../types";

interface IQuizRootState {
  quiz: IQuizState;
}

export const useQuiz = () => {
  const state = useAppSelector((root: IQuizRootState) => root.quiz);
  const dispatch = useAppDispatch();
  return { state, dispatch };
};
