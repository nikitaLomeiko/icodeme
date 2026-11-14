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
  const { containerId, isStarting, terminalError, terminalTicket } =
    useTerminalSession({ step, study });

  return (
    <div className="w-full min-w-0 overflow-hidden rounded-xl border border-[var(--ui-border)]">
      {terminalTicket ? (
        <InteractiveTerminal key={sessionKey} ticket={terminalTicket} />
      ) : (
        <div
          className={`flex h-[65vh] min-h-[560px] max-h-[780px] items-center justify-center bg-[#111827] px-6 font-mono text-sm ${terminalError ? "text-red-300" : "text-gray-300"}`}
        >
          {terminalError ||
            (isStarting || containerId
              ? "Подключение к Linux-контейнеру..."
              : "Подготовка Linux-терминала...")}
        </div>
      )}
    </div>
  );
};
