"use client";

import { forwardRef, useImperativeHandle } from "react";
import { useTerminal } from "./libs/hooks/use.terminal";
import { ITerminalHandle, ITerminalProps } from "./types";
import { TerminalHeader, TerminalInput, TerminalLine } from "./ui";

export const Terminal = forwardRef<ITerminalHandle, ITerminalProps>(
  (props, ref) => {
    const {
      user,
      host,
      initialLines,
      onCommand,
      onInput,
      onChange,
      readonly = false,
      bodyClassName = "",
    } = props;

    const terminal = useTerminal({
      user,
      host,
      initialLines,
      onCommand,
      onInput,
    });

    useImperativeHandle(
      ref,
      () => ({
        push: terminal.push,
        clear: terminal.clear,
        execute: terminal.execute,
        getLines: terminal.getLines,
        getHistory: terminal.getHistory,
        focus: terminal.focus,
      }),
      [
        terminal.push,
        terminal.clear,
        terminal.execute,
        terminal.getLines,
        terminal.getHistory,
        terminal.focus,
      ],
    );

    return (
      <div className="overflow-hidden rounded-2xl bg-[var(--ui-background-tertiary)] shadow-2xl w-full">
        <TerminalHeader />

        <div
          ref={terminal.bodyRef}
          onClick={terminal.focus}
          className={`h-[420px] cursor-text overflow-y-auto px-5 py-4 font-mono text-[13px] leading-relaxed ${bodyClassName}`}
        >
          {terminal.lines.map((line) => (
            <TerminalLine key={line.id} line={line} />
          ))}

          {!readonly && (
            <TerminalInput
              inputRef={terminal.inputRef}
              busy={terminal.busy}
              user={terminal.user}
              host={terminal.host}
              history={terminal.history}
              onChange={onChange}
              onSubmit={terminal.execute}
            />
          )}
        </div>
      </div>
    );
  },
);

Terminal.displayName = "Terminal";
