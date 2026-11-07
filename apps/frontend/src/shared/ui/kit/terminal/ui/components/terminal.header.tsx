"use client";

interface IProps {
  title?: string;
}

export const TerminalHeader: React.FC<IProps> = ({
  title = "ICODEME — terminal",
}) => {
  return (
    <div className="flex items-center gap-2 border-b border-[#ffffff14] bg-[var(--ui-background-secondary)] px-4 py-2.5">
      <div className="flex items-center gap-2">
        <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
        <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
        <span className="h-3 w-3 rounded-full bg-[#28c840]" />
      </div>

      <span className="flex-1 select-none text-center text-xs font-medium tracking-wide text-[#9ca3af]">
        {title}
      </span>

      <span className="w-12 select-none" />
    </div>
  );
};
