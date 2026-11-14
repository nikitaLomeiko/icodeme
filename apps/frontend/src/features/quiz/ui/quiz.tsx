"use client";

import { AnimatePresence } from "framer-motion";
import { useQuiz } from "../model/store/use.quiz";
import { NavigationMap } from "./navigation.map";
import { QuizCard } from "./quiz.card";
import { ResultsScreen } from "./results.screen";
import { StartScreen } from "./start.screen";
import { QuizHead } from "./quiz.head";

export const QuizPage: React.FC = () => {
  const { state } = useQuiz();

  return (
    <>
      {state.phase === "idle" && <StartScreen />}

      {state.phase === "running" && (
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
      )}

      {state.phase === "finished" && <ResultsScreen />}
    </>
  );
};
