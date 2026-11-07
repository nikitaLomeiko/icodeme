"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent, KeyboardEvent, ReactNode } from "react";
import { AnimatePresence } from "framer-motion";
import { FaPaperPlane } from "react-icons/fa";
import { Message } from "./ui/message";
import { ChatHeader } from "./ui/chat.header";
import { TypingEffect } from "./ui/typing.effect";
import { IChatMessage } from "./types/chat.types";
import { generateId } from "@/shared/lib/utils/generate-id";

interface IProps {
  logoSrc: string;
  logoAlt?: string;
  username: string;
  messages: IChatMessage[];
  isTyping?: boolean;
  isFinished?: boolean;
  children?: ReactNode;
  onSendMessage?: (message: string) => void;
  inputPlaceholder?: string;
}

export const Chat: React.FC<IProps> = (props) => {
  const {
    username,
    logoSrc,
    logoAlt,
    messages,
    isTyping = false,
    isFinished = false,
    children,
    onSendMessage,
    inputPlaceholder = "Напишите сообщение...",
  } = props;

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [messageDraft, setMessageDraft] = useState("");
  const [localMessages, setLocalMessages] = useState<IChatMessage[]>([]);
  const visibleMessages = onSendMessage
    ? messages
    : [...messages, ...localMessages];

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [visibleMessages.length, isTyping]);

  const sendMessage = () => {
    const text = messageDraft.trim();
    if (!text || isFinished) return;

    if (onSendMessage) {
      onSendMessage(text);
    } else {
      setLocalMessages((currentMessages) => [
        ...currentMessages,
        { id: generateId(), sender: "me", text },
      ]);
    }

    setMessageDraft("");
    inputRef.current?.focus();
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    sendMessage();
  };

  const handleInputKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-[460px] rounded-2xl border border-[var(--ui-border)] shadow-sm overflow-hidden">
      <ChatHeader logoSrc={logoSrc} username={username} logoAlt={logoAlt} />

      <div
        ref={scrollRef}
        className="flex-1 min-h-0 overflow-y-auto chat-scroll px-4 py-4 space-y-3"
      >
        <AnimatePresence initial={false}>
          {visibleMessages.map((message) => (
            <Message
              key={message.id}
              logoSrc="/logo/logo.gif"
              logoAlt="Octo"
              messageId={message.id}
              sender={message.sender}
              text={message.text}
            />
          ))}
        </AnimatePresence>

        {isTyping && <TypingEffect logoAlt={logoAlt} logoSrc={logoSrc} />}
      </div>

      {children ?? (
        <div className="border-t border-[var(--ui-border)] px-4 py-3">
          {isFinished ? (
            <p className="py-2 text-center text-sm text-[var(--ui-text-muted)]">
              Диалог завершён
            </p>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="flex items-end gap-2 rounded-xl border border-[var(--ui-border)] bg-[var(--ui-background)] p-2 focus-within:border-[var(--ui-primary)]"
            >
              <textarea
                ref={inputRef}
                value={messageDraft}
                onChange={(event) => setMessageDraft(event.target.value)}
                onKeyDown={handleInputKeyDown}
                placeholder={inputPlaceholder}
                aria-label={inputPlaceholder}
                rows={1}
                className="max-h-28 min-h-9 flex-1 resize-none bg-transparent px-2 py-2 text-sm text-[var(--ui-text)] outline-none placeholder:text-[var(--ui-text-muted)]"
              />
              <button
                type="submit"
                disabled={!messageDraft.trim()}
                aria-label="Отправить сообщение"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--ui-primary)] text-white transition-colors hover:bg-[var(--ui-primary-hover)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <FaPaperPlane size={14} />
              </button>
            </form>
          )}
          {isTyping && !isFinished && (
            <p className="mt-2 text-center text-xs text-[var(--ui-text-muted)]">
              {username} печатает...
            </p>
          )}
        </div>
      )}
    </div>
  );
};
