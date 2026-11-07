"use client";

import { FormEvent, KeyboardEvent, RefObject, useState } from "react";
import { Loader } from "../../../loader";
import { buildPrompt } from "../../libs/utils";

interface IProps {
  inputRef: RefObject<HTMLInputElement | null>;
  user: string;
  host: string;
  history: string[];
  busy: boolean;
  onChange?: (draft: string) => void;
  onSubmit: (command: string) => void | Promise<void>;
}

export const TerminalInput: React.FC<IProps> = (props) => {
  const {
    inputRef,
    user,
    host,
    history,
    busy,
    onChange,
    onSubmit,
  } = props;

  const [draft, setDraft] = useState("");
  const [historyIndex, setHistoryIndex] = useState<number | null>(null);

  const setDraftValue = (value: string) => {
    setDraft(value);
    onChange?.(value);
  };

  const moveHistory = (index: number) => {
    setHistoryIndex(index);
    setDraftValue(history[index] ?? "");
  };

  const navigateHistory = (direction: 1 | -1) => {
    if (history.length === 0) return;

    if (direction === -1) {
      const next =
        historyIndex === null
          ? history.length - 1
          : Math.max(0, historyIndex - 1);
      moveHistory(next);
      return;
    }

    if (historyIndex === null) return;

    const next = historyIndex + 1;
    if (next >= history.length) {
      setHistoryIndex(null);
      setDraftValue("");
    } else {
      moveHistory(next);
    }
  };

  const submit = () => {
    const value = draft;
    setDraftValue("");
    setHistoryIndex(null);
    void onSubmit(value);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (busy) {
      event.preventDefault();
      return;
    }

    switch (event.key) {
      case "Enter":
        event.preventDefault();
        submit();
        break;
      case "ArrowUp":
        event.preventDefault();
        navigateHistory(-1);
        break;
      case "ArrowDown":
        event.preventDefault();
        navigateHistory(1);
        break;
      default:
        break;
    }
  };

  const handleChange = (event: FormEvent<HTMLInputElement>) => {
    setDraftValue(event.currentTarget.value);
    setHistoryIndex(null);
  };

  return (
    <div className="flex items-center">
      <span className="whitespace-pre text-[#4ade80]">{buildPrompt(user, host)}</span>

      <div className="relative ml-2 flex-1">
        <span className="whitespace-pre text-[#f3f4f6]">{draft}</span>

        {busy ? (
          <span className="ml-1 inline-flex align-middle">
            <Loader size="sm" className="h-3.5 w-3.5 border-[3px]" />
          </span>
        ) : (
          <span className="ml-px inline-block h-[1.1em] w-[8px] align-middle bg-[#4ade80] animate-terminal-blink" />
        )}

        <input
          ref={inputRef}
          value={draft}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          className={[
            "absolute",
            "inset-0",
            "h-full",
            "w-full",
            "bg-transparent",
            "text-transparent",
            "caret-transparent",
            "outline-none",
            "opacity-0",
          ].join(" ")}
          aria-label="Ввод команды"
          autoFocus
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
        />
      </div>
    </div>
  );
};