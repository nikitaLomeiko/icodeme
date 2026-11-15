"use client";

import { AnimatePresence } from "framer-motion";
import { useQuiz } from "../model/store/use.quiz";
import { NavigationMap } from "./navigation.map";
import { QuizCard } from "./quiz.card";
import { QuizHead } from "./quiz.head";

export const QuizSession: React.FC = () => {
  const { state } = useQuiz();
  if (state.phase !== "running") return null;

  return (
    <div className="w-full min-w-0">
      <QuizHead
        count={state.quiz?.questions?.length || 0}
        title={state.quiz?.title || ""}
      />

      <AnimatePresence mode="wait">
        <QuizCard />
      </AnimatePresence>

      {state.quiz?.settings.isNavigate && <NavigationMap />}
    </div>
  );
};
