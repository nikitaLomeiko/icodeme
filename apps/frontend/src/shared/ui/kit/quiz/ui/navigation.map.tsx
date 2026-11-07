"use client";

import { motion } from "framer-motion";
import { isQuestionAnswered } from "../libs/utils/selectors";
import { goToQuestion } from "../store/actions";
import { useQuiz } from "../store/use.quiz";
import { useCallback } from "react";

export const NavigationMap: React.FC = () => {
  const { state, dispatch } = useQuiz();
  const { answers, skipped, currentIndex } = state;

  const chipClassName = (index: number): string => {
    if (index === currentIndex) {
      return "bg-[var(--ui-primary)] text-[var(--ui-text-inverse)] border-2 border-[var(--ui-primary)] shadow-md";
    }
    const question = state.quiz?.questions[index];
    if (skipped[question?.id || 0]) {
      return "bg-[var(--ui-error)]/10 text-[var(--ui-error)] border-2 border-[var(--ui-error)]/40";
    }
    if (isQuestionAnswered(answers, question?.id || "0")) {
      return "bg-[var(--ui-primary)]/10 text-[var(--ui-primary)] border-2 border-[var(--ui-primary)]/40";
    }
    return "bg-[var(--ui-background)] text-[var(--ui-text-muted)] border-2 border-[var(--ui-border)] hover:border-[var(--ui-primary)]";
  };

  const goTo = useCallback(
    (index: number) => {
      dispatch(goToQuestion(index));
    },
    [dispatch],
  );

  return (
    <div className="mt-5 bg-[var(--ui-background-secondary)] border border-[var(--ui-border)] rounded-2xl p-4">
      <p className="text-xs font-semibold text-[var(--ui-text-muted)] uppercase tracking-wider mb-3">
        Навигация по вопросам
      </p>
      <div className="flex flex-wrap gap-2">
        {state.quiz?.questions.map((question, index) => (
          <motion.button
            key={question.id}
            type="button"
            whileTap={{ scale: 0.95 }}
            onClick={() => goTo(index)}
            title={`${index + 1}. ${question.title}`}
            className={`
              w-10 h-10 rounded-lg flex items-center justify-center
              text-xs font-bold transition-all duration-200 cursor-pointer
              ${chipClassName(index)}
            `}
          >
            {index + 1}
          </motion.button>
        ))}
      </div>
    </div>
  );
};
