"use client";

import { RefObject, useCallback, useEffect, useRef, useState } from "react";
import { buildLine, buildLines, buildResultLines } from "../utils";
import { buildPrompt, parseCommand } from "../utils";
import {
  IInitialLine,
  ITerminalContext,
  ITerminalLine,
  TerminalLineKind,
  TerminalResult,
} from "../../types";

export interface UseTerminalOptions {
  user?: string;
  host?: string;
  initialLines?: IInitialLine[] | string[];
  onCommand?: (input: string, context: ITerminalContext) => TerminalResult;
  onInput?: (input: string) => void;
}

export interface UseTerminalReturn {
  lines: ITerminalLine[];
  busy: boolean;
  user: string;
  host: string;
  history: string[];
  inputRef: RefObject<HTMLInputElement | null>;
  bodyRef: RefObject<HTMLDivElement | null>;
  push: (content: string | string[], kind?: TerminalLineKind) => void;
  clear: () => void;
  execute: (command: string) => Promise<void>;
  getLines: () => ITerminalLine[];
  getHistory: () => string[];
  focus: () => void;
}

export const useTerminal = (options: UseTerminalOptions): UseTerminalReturn => {
  const {
    user = "guest",
    host = "icodeme",
    initialLines,
    onCommand,
    onInput,
  } = options;

  const [lines, setLines] = useState<ITerminalLine[]>(() =>
    initialLines ? buildLines(initialLines) : [],
  );
  const [busy, setBusy] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const linesRef = useRef(lines);
  const historyRef = useRef<string[]>([]);

  useEffect(() => {
    linesRef.current = lines;
  }, [lines]);

  useEffect(() => {
    const node = bodyRef.current;
    if (!node) return;
    node.scrollTop = node.scrollHeight;
  }, [lines.length, busy]);

  const appendLines = useCallback((next: ITerminalLine[]) => {
    setLines((prev) => [...prev, ...next]);
  }, []);

  const execute = useCallback(
    async (rawInput: string) => {
      const { name, raw } = parseCommand(rawInput);

      appendLines([
        buildLine(`${buildPrompt(user, host)} ${rawInput}`, "input"),
      ]);
      onInput?.(rawInput);

      if (!name) return;

      historyRef.current = [...historyRef.current, raw];

      if (name === "clear") {
        setLines([]);
        return;
      }

      setBusy(true);

      try {
        if (onCommand) {
          const resolved = await onCommand(raw, { user, host });
          if (resolved !== undefined && resolved !== null) {
            appendLines(buildResultLines(resolved, "output"));
          }
          return;
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        appendLines(buildResultLines(`Ошибка: ${message}`, "error"));
      } finally {
        setBusy(false);
      }
    },
    [appendLines, onCommand, onInput, user, host],
  );

  const push = useCallback(
    (content: string | string[], kind: TerminalLineKind = "output") =>
      appendLines(buildResultLines(content, kind)),
    [appendLines],
  );

  const clear = useCallback(() => setLines([]), []);

  const getLines = useCallback(() => linesRef.current, []);

  const getHistory = useCallback(() => historyRef.current, []);

  const focus = useCallback(() => inputRef.current?.focus(), []);

  return {
    lines,
    busy,
    user,
    host,
    history: historyRef.current,
    inputRef,
    bodyRef,
    push,
    clear,
    execute,
    getLines,
    getHistory,
    focus,
  };
};
