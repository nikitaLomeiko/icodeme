"use client";

import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getTextAnswer, isOptionSelected } from "../libs/utils/selectors";
import { goNextQuestion, selectOption, setFieldAnswer, setTextAnswer } from "../store/actions";
import { useQuiz } from "../store/use.quiz";
import { ChoiceItem } from "./components/choice.item";
import { AnswerField } from "./components/answer.field";
import { TimerProvider } from "./components/timer.provider";
import { QuestionFooter } from "./components/question.footer";
import { QuestionHead } from "./components/question.head";

export const QuizCard: React.FC = () => {
  const { state, dispatch } = useQuiz();

  const { quiz, currentIndex, timeLeft, answers } = state;
  const question = state.quiz?.questions[currentIndex];
  const total = state.quiz?.questions.length;

  const handleSubmit = () => {
    dispatch(goNextQuestion());
  };

  return (
    <TimerProvider>
      <motion.div
        key={question?.id || 0}
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -24 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="bg-[var(--ui-background-secondary)] border border-[var(--ui-border)] rounded-2xl shadow-sm"
      >
        <div className="p-5 sm:p-7">
          <QuestionHead
            currentIndex={currentIndex}
            isMultiple={question?.multiple ?? false}
            points={question?.points}
            timeLeft={timeLeft ?? 0}
            timeLimit={question?.timeLimit ?? 0}
            total={total || 0}
            type={question?.type || "choice"}
          />

          <h2 className="text-lg sm:text-xl font-bold text-[var(--ui-text)] leading-snug mb-6">
            {question?.title}
          </h2>

          {question?.description && <div className="mb-5 space-y-2 text-sm leading-7 text-[var(--ui-text-muted)] [&_pre]:overflow-x-auto [&_pre]:rounded-xl [&_pre]:bg-[var(--ui-background-tertiary)] [&_pre]:p-4"><ReactMarkdown remarkPlugins={[remarkGfm]}>{question.description}</ReactMarkdown></div>}
          {question?.codeSnippet && <pre className="mb-5 overflow-x-auto rounded-xl bg-[var(--ui-background-tertiary)] p-4 text-sm text-[var(--ui-text)]"><code>{question.codeSnippet}</code></pre>}

          {question?.type === "choice" ? (
            <div className="space-y-3">
              {question.options?.map((option, index) => (
                <ChoiceItem
                  key={option.id}
                  id={option.id}
                  index={index}
                  label={option.label}
                  selected={isOptionSelected(answers, question, option.id)}
                  onClick={() => dispatch(selectOption(option.id))}
                />
              ))}
            </div>
          ) : question?.type === "fields" ? (
            <div className="space-y-4">
              {question.fields?.map((field, index) => (
                <label key={index} className="block space-y-2 text-sm text-[var(--ui-text)]">
                  <span>{field.label || `Ответ ${index + 1}`}</span>
                  <input
                    value={Array.isArray(answers[question.id]) ? answers[question.id][index] ?? "" : ""}
                    placeholder={field.placeholder || "Введите ответ"}
                    onChange={(event) => dispatch(setFieldAnswer(index, event.target.value))}
                    className="w-full rounded-xl border-2 border-[var(--ui-border)] bg-[var(--ui-background)] p-4 outline-none focus:border-[var(--ui-primary)]"
                  />
                </label>
              ))}
            </div>
          ) : (
            <label className="block space-y-2 text-sm text-[var(--ui-text)]">
              {question?.answerLabel && <span>{question.answerLabel}</span>}
              <AnswerField
                isNavigate={quiz?.settings.isNavigate || false}
                value={getTextAnswer(answers, question?.id || "0")}
                placeholder={question?.answerPlaceholder}
                onSubmit={handleSubmit}
                onChange={(event) => dispatch(setTextAnswer(event.target.value))}
              />
            </label>
          )}

          <QuestionFooter
            currentIndex={currentIndex}
            isNavigate={quiz?.settings.isNavigate || false}
            total={total || 0}
          />
        </div>
      </motion.div>
    </TimerProvider>
  );
};
