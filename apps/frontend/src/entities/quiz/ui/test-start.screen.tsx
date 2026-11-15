"use client";

import { FaClock, FaList, FaPlay, FaStar } from "react-icons/fa";
import type { IQuizTest } from "../model/types/quiz-session.types";
import { QuizMiniStat } from "./components/quiz-mini-stat";

interface IProps {
  quiz: IQuizTest;
  onStart: () => void;
}

export const TestStartScreen: React.FC<IProps> = ({ quiz, onStart }) => {
  const maxScore = quiz.questions.reduce(
    (sum, question) => sum + (question.points ?? 0),
    0,
  );
  const timedCount = quiz.questions.filter((question) => question.timeLimit).length;

  return (
    <div className="w-full min-w-0">
      <div className="bg-[var(--ui-background-secondary)] border border-[var(--ui-border)] rounded-2xl shadow-sm p-6 sm:p-10 text-center">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-[var(--ui-primary)] to-[var(--ui-secondary)] flex items-center justify-center text-white shadow-lg">
          <FaList size={26} />
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--ui-text)] mt-5">
          {quiz.title}
        </h1>
        <p className="text-sm text-[var(--ui-text-muted)] mt-2 leading-relaxed max-w-md mx-auto">
          {quiz.description}
        </p>

        <div className="flex justify-center gap-10 mt-5">
          <QuizMiniStat
            icon={FaList}
            value={quiz.questions.length}
            label="Вопросов"
          />
          {quiz.settings.isScore && (
            <QuizMiniStat icon={FaStar} value={maxScore} label="Макс. баллов" />
          )}
          <QuizMiniStat
            icon={FaClock}
            value={timedCount}
            label="С таймером"
          />
        </div>

        <button
          type="button"
          onClick={onStart}
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

        {timedCount > 0 && (
          <p className="text-[11px] text-[var(--ui-text-muted)] mt-4">
            При истечении времени вопрос автоматически засчитывается как не
            отвеченный и пропускается
          </p>
        )}
      </div>
    </div>
  );
};
