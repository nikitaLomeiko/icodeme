"use client";

import { ITerminalLine, TerminalLineKind } from "../../types";

const terminalLineStyles: Record<TerminalLineKind, string> = {
  input: "text-[#f3f4f6]",
  output: "text-[#d4d4d4]",
  success: "text-[#4ade80]",
  error: "text-[#f87171]",
  system: "text-[#c084fc]",
};

export const TerminalLine: React.FC<{ line: ITerminalLine }> = ({ line }) => {
  return (
    <div
      className={`min-h-[1.3em] break-words whitespace-pre-wrap ${terminalLineStyles[line.kind]}`}
    >
      {line.content || "\u00A0"}
    </div>
  );
};