import { useEffect, useRef } from "react";
import { useNotification } from "@/shared/ui/kit";
import {
  expireQuestion,
  setDeadline,
  setTimeLeft,
  useQuiz,
} from "../../model/store";

interface IProps {
  children: React.ReactNode;
}

export const TimerProvider: React.FC<IProps> = ({ children }) => {
  const { dispatch, state } = useQuiz();

  const { warning } = useNotification();
  const warned = useRef(new Set<string>());

  useEffect(() => {
    if (state.phase !== "running") warned.current.clear();
  }, [state.phase]);

  useEffect(() => {
    if (state.phase !== "running") return;

    const question = state.quiz?.questions[state.currentIndex];
    if (!question) return;

    dispatch(setTimeLeft(question.timeLimit ?? null));
    if (!question.timeLimit) return;

    const deadline =
      state.deadlines[question.id] ?? Date.now() + question.timeLimit * 1000;
    dispatch(setDeadline({ questionId: question.id, deadline }));
    let timeoutId: number | undefined;

    const tick = () => {
      const left = Math.max(Math.round((deadline - Date.now()) / 1000), 0);
      dispatch(setTimeLeft(left));

      if (left <= 0) {
        dispatch(expireQuestion(question.id));
        if (!warned.current.has(question.id)) {
          warned.current.add(question.id);
          warning(
            `Время на вопрос вышло — вопрос «${question.title}» засчитан как не отвеченный`,
          );
        }
      } else {
        timeoutId = window.setTimeout(tick, 300);
      }
    };

    tick();
    return () => window.clearTimeout(timeoutId);
  }, [
    state.currentIndex,
    state.phase,
    state.quiz?.questions,
    state.deadlines,
    dispatch,
    warning,
  ]);

  return children;
};
