import { useEffect } from "react";
import { useNotification } from "../../../notification";
import { goNextQuestion, markSkipped, setTimeLeft, useQuiz } from "../../store";

interface IProps {
  children: React.ReactNode;
}

export const TimerProvider: React.FC<IProps> = ({ children }) => {
  const { dispatch, state } = useQuiz();

  const { warning } = useNotification();

  useEffect(() => {
    if (state.phase !== "running") return;

    const question = state.quiz?.questions[state.currentIndex];
    if (!question) return;

    dispatch(setTimeLeft(question.timeLimit ?? null));
    if (!question.timeLimit) return;

    const deadline = Date.now() + question.timeLimit * 1000;
    let timeoutId: number | undefined;

    const tick = () => {
      const left = Math.max(Math.round((deadline - Date.now()) / 1000), 0);
      dispatch(setTimeLeft(left));

      if (left <= 0) {
        dispatch(markSkipped(question.id));
        warning(
          `Время на вопрос вышло — вопрос «${question.title}» засчитан как не отвеченный`,
        );
        dispatch(goNextQuestion());
      } else {
        timeoutId = window.setTimeout(tick, 300);
      }
    };

    tick();
    return () => window.clearTimeout(timeoutId);
  }, [state.currentIndex, state.phase, state.quiz?.questions, dispatch, warning]);

  return children;
};
