import { FiCode } from "react-icons/fi";

export const EmptyMessage = () => {
  return (
    <div className="flex-1 flex items-center justify-center bg-[var(--ui-background-tertiary)] h-full">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[var(--ui-primary)]/20 to-[var(--ui-primary)]/10 flex items-center justify-center border border-[var(--ui-border)]">
          <FiCode className="w-7 h-7 text-[var(--ui-text-muted)]" />
        </div>
        <p className="text-sm text-[var(--ui-text-muted)]">
          Select a file to start editing
        </p>
        <p className="text-xs text-[var(--ui-text-muted)]/50 mt-1">
          or create a new one in the explorer
        </p>
      </div>
    </div>
  );
};
