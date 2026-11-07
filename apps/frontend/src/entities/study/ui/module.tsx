import Link from "next/link";
import { FaArrowRight, FaBook, FaCheck, FaLock } from "react-icons/fa";
import { IModule } from "../model";

interface IProps extends Omit<IModule, "levels"> {
  levelsCount: number;
  index: number;
  variant?: "card" | "header";
  href?: string;
}

export const Module: React.FC<IProps> = (props) => {
  const {
    description,
    title,
    isCompleted,
    isCurrent,
    levelsCount,
    index,
    variant = "card",
    href = "/",
  } = props;

  if (variant === "header") {
    return (
      <div className="mb-8">
        <div className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-[var(--ui-primary)]">
          Модуль {String(index).padStart(2, "0")}
        </div>
        <h2 className="mb-2 text-2xl font-bold">{title}</h2>
        <p className="text-sm text-[var(--ui-text-muted)]">{description}</p>
      </div>
    );
  }

  const isLocked = !isCurrent && !isCompleted;

  return (
    <div
      className={`group flex items-start gap-5 rounded-2xl border p-5 shadow-sm transition-all duration-200 ${isCurrent ? "border-[var(--ui-primary)] bg-[var(--ui-background-secondary)] shadow-md" : "border-[var(--ui-border)] bg-[var(--ui-background-secondary)]"} ${isCompleted ? "border-[var(--ui-primary)]/30" : ""} ${isLocked ? "opacity-60" : "hover:-translate-y-0.5 hover:shadow-lg"}`}
    >
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border text-sm font-black transition-colors ${isCompleted ? "border-[var(--ui-primary)] bg-[var(--ui-primary)] text-white" : isCurrent ? "border-[var(--ui-primary)] bg-[var(--ui-primary)]/10 text-[var(--ui-primary)]" : "border-[var(--ui-border)] bg-[var(--ui-background)] text-[var(--ui-accent)]"}`}
      >
        {isCompleted ? <FaCheck size={16} /> : String(index).padStart(2, "0")}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-base font-bold">{title}</h2>

          {isCurrent && (
            <span className="rounded-full bg-[var(--ui-primary)]/10 px-2 py-0.5 text-xs font-medium text-[var(--ui-primary)]">
              Сейчас
            </span>
          )}

          {isCompleted && (
            <span className="rounded-full bg-[var(--ui-primary)]/10 px-2 py-0.5 text-xs font-medium text-[var(--ui-primary)]">
              Завершён
            </span>
          )}

          {isLocked && (
            <span className="rounded-full bg-[var(--ui-background)] px-2 py-0.5 text-xs font-medium text-[var(--ui-text-muted)]">
              Заблокирован
            </span>
          )}
        </div>

        <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-[var(--ui-text-muted)]">
          {description}
        </p>

        <div className="mt-3 flex items-center gap-2 text-xs text-[var(--ui-text-muted)]">
          <FaBook size={12} />
          <span>
            {levelsCount}{" "}
            {levelsCount === 1
              ? "уровень"
              : levelsCount < 5
                ? "уровня"
                : "уровней"}
          </span>
        </div>
      </div>

      {isLocked ? (
        <button
          type="button"
          disabled
          className="flex h-10 shrink-0 cursor-not-allowed items-center gap-2 rounded-xl border border-[var(--ui-border)] bg-[var(--ui-background)] px-4 text-sm font-medium text-[var(--ui-text-muted)]"
        >
          <FaLock size={12} />
          Закрыт
        </button>
      ) : (
        <Link
          href={href}
          className="flex h-10 shrink-0 items-center gap-2 rounded-xl border border-[var(--ui-border)] bg-[var(--ui-background)] px-4 text-sm font-medium text-[var(--ui-text)] transition-all hover:border-[var(--ui-primary)] hover:bg-[var(--ui-primary)] hover:text-white"
        >
          Открыть
          <FaArrowRight size={12} />
        </Link>
      )}
    </div>
  );
};
