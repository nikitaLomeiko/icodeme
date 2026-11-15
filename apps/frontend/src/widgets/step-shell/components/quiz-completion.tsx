"use client";

import { useEffect, useRef } from "react";
import { useSubmitQuizMutation } from "@/entities/study";
import { useQuiz } from "@/features/quiz";
import type { StudyStepParams } from "../lib/hooks/use.study-step";

export const QuizCompletion = ({ params }: { params: StudyStepParams }) => {
  const { state } = useQuiz();
  const [submit, result] = useSubmitQuizMutation();
  const submitted = useRef(false);

  useEffect(() => {
    if (state.phase !== "finished") {
      submitted.current = false;
      return;
    }
    if (submitted.current) return;
    submitted.current = true;
    void submit({
      studyId: params.studyId!,
      moduleIndex: Number(params.moduleIndex),
      levelIndex: Number(params.levelIndex),
      stepIndex: Number(params.stepIndex),
      answers: state.answers,
    });
  }, [
    params.studyId,
    params.moduleIndex,
    params.levelIndex,
    params.stepIndex,
    state.phase,
    state.answers,
    submit,
  ]);

  if (state.phase !== "finished") return null;
  if (result.isLoading)
    return (
      <p role="status" className="p-4">
        Сохраняем результат...
      </p>
    );
  if (result.isError || result.data?.success === false)
    return (
      <p role="alert" className="p-4 text-red-500">
        Результат не сохранён. Обновите страницу и пройдите тест повторно.
      </p>
    );
  if (!result.data?.data) return null;
  return (
    <p role="status" className="p-4">
      {result.data.data.completed
        ? "Шаг завершён, прогресс сохранён."
        : "Для завершения шага нужно ответить верно минимум на 70% вопросов."}
    </p>
  );
};
