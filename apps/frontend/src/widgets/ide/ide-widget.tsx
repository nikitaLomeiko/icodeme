"use client";

import { useEffect, useRef } from "react";
import { Button, type FileNode } from "@/shared/ui/kit";
import { IDE, useIde, type IProjectMeta } from "@/features/ide";
import { InteractiveTerminal } from "@/features/terminal-session";

interface IProps {
  meta: IProjectMeta;
  userId: string;
  stepId: string;
  initialFiles?: FileNode[];
  className?: string;
}

export const IdeWidget: React.FC<IProps> = ({
  meta,
  userId,
  stepId,
  initialFiles,
  className,
}) => {
  const terminalSectionRef = useRef<HTMLElement>(null);
  const {
    isTerminalVisible,
    isStarting,
    terminalTicket,
    terminalError,
    terminalOutput,
    handleRun,
    closeTerminal,
  } = useIde({ meta, userId, stepId });

  useEffect(() => {
    if (!isTerminalVisible || !isStarting) return;

    requestAnimationFrame(() => {
      terminalSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }, [isStarting, isTerminalVisible]);

  return (
    <>
      <IDE
        initialFiles={initialFiles}
        className={className}
        onRun={handleRun}
      />
      {isTerminalVisible && (
        <section
          ref={terminalSectionRef}
          className="mt-4 scroll-mt-6 overflow-hidden rounded-xl border border-[var(--ui-border)] bg-[var(--ui-background-secondary)]"
        >
          <div className="flex justify-end border-b border-[var(--ui-border)] p-2">
            <Button size="sm" variant="ghost" onClick={closeTerminal}>
              Закрыть терминал
            </Button>
          </div>
          {isStarting ? (
            <div className="flex h-[65vh] min-h-[420px] items-center justify-center bg-[#111827] font-mono text-sm text-gray-300">
              Подключение к контейнеру…
            </div>
          ) : terminalError ? (
            <div
              role="alert"
              className="bg-[#111827] p-6 font-mono text-sm text-red-300"
            >
              {terminalError}
            </div>
          ) : (
            <InteractiveTerminal
              key={terminalTicket ?? terminalOutput}
              ticket={terminalTicket}
              initialOutput={terminalOutput}
            />
          )}
        </section>
      )}
    </>
  );
};
