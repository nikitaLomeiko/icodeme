"use client";

import { useCallback, useMemo } from "react";
import { FaRedo } from "react-icons/fa";
import { computeResults } from "../libs/utils/scoring";
import {
  formatCorrectAnswer,
  formatUserAnswer,
  pointsLabel,
} from "../libs/utils/answers";
import { restartQuiz } from "../store/actions";
import { useQuiz } from "../store/use.quiz";
import { ResultStat } from "./components/result.stat";
import { stateMeta } from "../consts/stat.meta";

export const ResultsScreen: React.FC = () => {
  const { state, dispatch } = useQuiz();
  const { answers, skipped, quiz } = state;

  const results = useMemo(
    () => computeResults(answers, skipped, quiz),
    [answers, skipped, quiz],
  );

  const percent = quiz?.settings.isScore && results?.maxScore
    ? results.totalEarned / results.maxScore
    : results?.gradedCount
      ? results.correctCount / results.gradedCount
      : 0;

  const ringSize = 120;
  const ringStroke = 12;
  const ringRadius = (ringSize - ringStroke) / 3;
  const ringCircumference = 2 * Math.PI * ringRadius;

  const restart = useCallback(() => {
    dispatch(restartQuiz());
  }, [dispatch]);

  return (
    <div className="w-full min-w-0 space-y-6">
      <div className="bg-[var(--ui-background-secondary)] border border-[var(--ui-border)] rounded-2xl shadow-sm p-6 sm:p-8 text-center">
        <p className="text-xs uppercase tracking-widest text-[var(--ui-text-muted)] font-semibold">
          Тест пройден
        </p>
        <h2 className="text-2xl sm:text-3xl font-bold text-[var(--ui-text)] mt-1">
          {state.quiz?.title}
        </h2>

        <div className="relative h-96 mx-auto mt-7">
          <svg
            className="w-full h-full -rotate-90"
            viewBox={`0 0 ${ringSize} ${ringSize}`}
          >
            <defs>
              <linearGradient
                id="quiz-result-gradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="var(--ui-primary)" />
                <stop offset="100%" stopColor="var(--ui-secondary)" />
              </linearGradient>
            </defs>
            <circle
              cx={ringSize / 2}
              cy={ringSize / 2}
              r={ringRadius}
              fill="none"
              stroke="var(--ui-border)"
              strokeWidth={ringStroke}
            />
            <circle
              cx={ringSize / 2}
              cy={ringSize / 2}
              r={ringRadius}
              fill="none"
              stroke="url(#quiz-result-gradient)"
              strokeWidth={ringStroke}
              strokeLinecap="round"
              strokeDasharray={ringCircumference}
              strokeDashoffset={ringCircumference * (1 - Math.min(percent, 1))}
              className="transition-all duration-700 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {quiz?.settings.isScore ? (
              <>
                <span className="text-3xl font-bold text-[var(--ui-text)]">
                  {results?.totalEarned}
                </span>
                <span className="text-xs text-[var(--ui-text-muted)] font-semibold">
                  из {results?.maxScore} баллов
                </span>
              </>
            ) : (
              <>
                <span className="text-3xl font-bold text-[var(--ui-text)]">
                  {results?.correctCount}
                </span>
                <span className="text-xs text-[var(--ui-text-muted)] font-semibold">
                  из {results?.gradedCount} проверяемых
                </span>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-7">
          <ResultStat
            label="Отвечено"
            value={results?.answeredCount || 0}
            color="var(--ui-primary)"
          />
          <ResultStat
            label="Не отвечено"
            value={results?.skippedCount || 0}
            color="var(--ui-text-muted)"
          />
          <ResultStat
            label="Верно"
            value={results?.correctCount || 0}
            color="var(--ui-success)"
          />
          {quiz?.settings.isScore ? (
            <ResultStat
              label="Баллы"
              value={`${results?.totalEarned} / ${results?.maxScore}`}
              color="var(--ui-warning)"
            />
          ) : (
            <ResultStat
              label="Неверно"
              value={
                results?.detail.filter((item) => item.state === "incorrect")
                  .length || 0
              }
              color="var(--ui-error)"
            />
          )}
        </div>

        <button
          type="button"
          onClick={restart}
          className="
            mt-8 inline-flex items-center justify-center gap-2
            px-6 py-3 text-base font-bold rounded-xl
            bg-[var(--ui-primary)] text-[var(--ui-text-inverse)]
            hover:bg-[var(--ui-primary-hover)] shadow-md hover:shadow-lg
            transition-all duration-200 cursor-pointer active:scale-[0.98]
          "
        >
          <FaRedo size={15} />
          <p>Пройти заново</p>
        </button>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-[var(--ui-text-secondary)] uppercase tracking-wider">
          Разбор ответов
        </h3>
        {results?.detail.map((entry, index) => {
          const meta = stateMeta[entry.state];
          const StateIcon = meta.icon;

          return (
            <div
              key={entry.question.id}
              className="bg-[var(--ui-background-secondary)] border border-[var(--ui-border)] rounded-2xl shadow-sm p-4 sm:p-5"
            >
              <div className="flex items-start gap-3">
                <span
                  className={`
                    mt-0.5 w-9 h-9 shrink-0 rounded-lg flex items-center justify-center
                    ${meta.chip}
                  `}
                >
                  <StateIcon size={15} />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <p className="text-sm font-semibold text-[var(--ui-text)] leading-snug">
                      {index + 1}. {entry.question.title}
                    </p>
                    {quiz?.settings.isScore && (
                      <span className="text-xs font-bold text-[var(--ui-warning)] whitespace-nowrap">
                        {entry.question.points
                          ? `${entry.earned} / ${entry.question.points} ${pointsLabel(entry.question.points)}`
                          : "—"}
                      </span>
                    )}
                  </div>

                  {entry.answered && (
                    <p className="text-xs text-[var(--ui-text-muted)] mt-1.5">
                      Ваш ответ:{" "}
                      <span className="text-[var(--ui-text-secondary)] font-medium">
                        {formatUserAnswer(
                          entry.question,
                          answers[entry.question.id],
                        )}
                      </span>
                    </p>
                  )}

                  {entry.state !== "correct" &&
                    (entry.question.correct?.length || entry.question.fields?.some((field) => field.correct.length)) && (
                      <p className="text-xs text-[var(--ui-success)] mt-0.5">
                        Правильный ответ:{" "}
                        <span className="font-medium">
                          {formatCorrectAnswer(entry.question)}
                        </span>
                      </p>
                    )}
                  {entry.state === "incorrect" && entry.question.errors?.map((message, errorIndex) => (
                    <p key={errorIndex} className="mt-1 text-xs text-[var(--ui-text-muted)]">{message}</p>
                  ))}
                </div>
                <span
                  className={`
                    shrink-0 text-[10px] font-bold px-2 py-1 rounded-full
                    ${meta.chip}
                  `}
                >
                  {meta.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
