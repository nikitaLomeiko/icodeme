"use client";

import { useEffect, useRef, useState } from "react";
import { Chat, type IChatMessage } from "@/shared/ui/kit";
import {
  chatIntroMessage,
  chatOutroMessage,
  chatQuestions,
} from "../../model/data/chat.data";
import { MessageAnswer } from "../components/message.answer";

interface ChatStepProps {
  onChange: (value: string) => void;
  error?: string;
}

const TYPING_DURATION_MS = 700;

export const ChatStep: React.FC<ChatStepProps> = ({ onChange }) => {
  const [messages, setMessages] = useState<IChatMessage[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const [isFinished, setIsFinished] = useState(false);

  const messageIdRef = useRef(0);
  const timersRef = useRef<NodeJS.Timeout[]>([]);
  const answersRef = useRef<Record<string, string>>({});

  const currentQuestion = chatQuestions[currentQuestionIndex];
  const totalQuestions = chatQuestions.length;

  const pushBotMessage = (text: string) => {
    setMessages((prev) => [
      ...prev,
      { id: `bot-${messageIdRef.current++}`, sender: "user", text },
    ]);
  };

  useEffect(() => {
    const timers = timersRef.current;

    const introTimer = setTimeout(() => {
      pushBotMessage(chatIntroMessage);

      const questionTimer = setTimeout(() => {
        pushBotMessage(chatQuestions[0].text);
        setIsTyping(false);
      }, TYPING_DURATION_MS);

      timers.push(questionTimer);
    }, TYPING_DURATION_MS);

    timers.push(introTimer);

    return () => {
      timers.forEach(clearTimeout);
      timers.length = 0;
    };
  }, []);

  const handleSelectOption = (option: string) => {
    if (isTyping || isFinished) return;

    answersRef.current[currentQuestion.id] = option;

    setMessages((prev) => [
      ...prev,
      {
        id: `user-${messageIdRef.current++}`,
        sender: "me",
        text: option,
      },
    ]);
    setIsTyping(true);

    const nextIndex = currentQuestionIndex + 1;

    const timer = setTimeout(() => {
      if (nextIndex < totalQuestions) {
        pushBotMessage(chatQuestions[nextIndex].text);
        setCurrentQuestionIndex(nextIndex);
        setIsTyping(false);
      } else {
        pushBotMessage(chatOutroMessage);
        setIsFinished(true);
        setIsTyping(false);
        onChange(JSON.stringify(answersRef.current));
      }
    }, TYPING_DURATION_MS);

    timersRef.current.push(timer);
  };

  return (
    <Chat
      logoSrc="/logo/logo.gif"
      logoAlt="Octo"
      username="Octo"
      messages={messages}
      isTyping={isTyping}
      isFinished={isFinished}
    >
      <div className="space-y-2 border-t border-[var(--ui-border)] px-4 py-3">
        {isFinished ? (
          <p className="py-1 text-center text-sm text-[var(--ui-success)]">
            Готово! Нажми «Далее», чтобы продолжить ✅
          </p>
        ) : (
          <>
            <p className="text-xs font-medium text-[var(--ui-text-muted)]">
              {isTyping ? "Octo печатает..." : "Выбери ответ:"}
            </p>
            {!isTyping && currentQuestion && (
              <div className="max-h-[150px] overflow-y-auto chat-scroll flex flex-col gap-2 pr-1">
                {currentQuestion.options.map((option, index) => (
                  <MessageAnswer
                    index={index}
                    onSelectOption={handleSelectOption}
                    option={option}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </Chat>
  );
};
