import type { IStep, IStudy } from "@/entities/study";
import { useTerminalSession } from "../model/use-terminal-session";
import { InteractiveTerminal } from "./interactive-terminal";

interface IProps {
  sessionKey: string;
  step: IStep;
  study: IStudy;
}

export const TerminalSession: React.FC<IProps> = ({
  sessionKey,
  step,
  study,
}) => {
  const { containerId, isStarting, terminalError, terminalTicket, retry } =
    useTerminalSession({ step, study });

  return (
    <div className="w-full min-w-0 overflow-hidden rounded-xl border border-[var(--ui-border)]">
      {terminalTicket ? (
        <InteractiveTerminal key={sessionKey} ticket={terminalTicket} />
      ) : (
        <div
          className={`flex h-[65vh] min-h-[560px] max-h-[780px] items-center justify-center bg-[#111827] px-6 font-mono text-sm ${terminalError ? "text-red-300" : "text-gray-300"}`}
        >
          {terminalError ? (
            <div className="flex flex-col items-center gap-4">
              <span>{terminalError}</span>
              <button
                type="button"
                onClick={retry}
                className="rounded border border-current px-4 py-2"
              >
                Повторить запуск
              </button>
            </div>
          ) : isStarting || containerId ? (
            "Подключение к Linux-контейнеру..."
          ) : (
            "Подготовка Linux-терминала..."
          )}
        </div>
      )}
    </div>
  );
};
