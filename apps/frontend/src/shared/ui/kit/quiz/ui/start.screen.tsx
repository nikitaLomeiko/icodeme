"use client";

import { FaClock, FaList, FaPlay, FaStar } from "react-icons/fa";
import { startQuiz } from "../store/actions";
import { useQuiz } from "../store/use.quiz";
import { MiniStat } from "./components/mini.stat";
import { useCallback } from "react";

export const StartScreen: React.FC = () => {
  const { dispatch, state } = useQuiz();

  const maxScore = state.quiz?.questions.reduce(
    (sum, q) => sum + (q.points ?? 0),
    0,
  );
  const timedCount = state.quiz?.questions.filter((q) => q.timeLimit).length;

  const start = useCallback(() => {
    dispatch(startQuiz());
  }, [dispatch]);

  return (
    <div className="w-full min-w-0">
      <div className="bg-[var(--ui-background-secondary)] border border-[var(--ui-border)] rounded-2xl shadow-sm p-6 sm:p-10 text-center">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-[var(--ui-primary)] to-[var(--ui-secondary)] flex items-center justify-center text-white shadow-lg">
          <FaList size={26} />
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--ui-text)] mt-5">
          {state.quiz?.title}
        </h1>
        <p className="text-sm text-[var(--ui-text-muted)] mt-2 leading-relaxed max-w-md mx-auto">
          {state.quiz?.description}
        </p>

        <div className="flex justify-center gap-10 mt-5">
          <MiniStat
            icon={FaList}
            value={state.quiz?.questions.length || 0}
            label="Вопросов"
          />
          {state.quiz?.settings.isScore && <MiniStat icon={FaStar} value={maxScore || 0} label="Макс. баллов" />}
          <MiniStat icon={FaClock} value={timedCount || 0} label="С таймером" />
        </div>

        <button
          type="button"
          onClick={start}
          className="
            mt-8 inline-flex items-center justify-center gap-2.5
            px-5 py-2 text-base font-bold rounded-xl
            bg-[var(--ui-primary)] text-[var(--ui-text-inverse)]
            hover:bg-[var(--ui-primary-hover)] shadow-md hover:shadow-lg
            transition-all duration-200 cursor-pointer active:scale-[0.98]
          "
        >
          <FaPlay className="mr-2" size={15} />
          Начать тест
        </button>

        {(timedCount || 0) > 0 && (
          <p className="text-[11px] text-[var(--ui-text-muted)] mt-4">
            При истечении времени вопрос автоматически засчитывается как не
            отвеченный и пропускается
          </p>
        )}
      </div>
    </div>
  );
};
