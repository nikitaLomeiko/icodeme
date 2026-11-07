import React from "react";
import { ILevel } from "../model";
import { FaPuzzlePiece, FaLock, FaCheck } from "react-icons/fa";

interface IProps extends ILevel {
  index: number;
  children: React.ReactNode;
  maxY: number;
}

export const Level: React.FC<IProps> = (props) => {
  const {
    description,
    title,
    id,
    index,
    children,
    maxY,
    isCompleted,
    isCurrent,
    steps,
  } = props;

  const isLocked = !isCompleted && !isCurrent;

  return (
    <div
      key={id}
      data-level-index={index - 1}
      className="relative mb-20 last:mb-0"
    >
      <div
        className={`
          relative mb-10 rounded-2xl
          transition-all duration-300
          ${isCurrent ? "ring-2 ring-[var(--ui-primary)]" : ""}
          ${
            isCurrent
              ? "bg-[color-mix(in_srgb,var(--ui-primary)_4%,transparent)]"
              : isCompleted
                ? "bg-[color-mix(in_srgb,var(--ui-primary)_4%,transparent)]"
                : ""
          }
          ${isLocked ? "opacity-70 grayscale-[35%]" : ""}
        `}
      >
        <div className="relative flex items-center gap-4 rounded-2xl px-6 py-4">
          <div className="relative shrink-0">
            {isCurrent && (
              <span
                aria-hidden
                className="
                  absolute -inset-1 rounded-xl
                  bg-[linear-gradient(135deg,var(--ui-primary),var(--ui-secondary))]
                  opacity-30 blur-[8px]
                "
              />
            )}

            <span
              className={`
                relative w-11 h-11 rounded-xl flex items-center justify-center
                text-white font-bold text-lg shadow-lg overflow-hidden
                bg-[linear-gradient(135deg,var(--ui-primary),var(--ui-secondary))]
                shadow-[var(--ui-brand-shadow)]
                ${isCurrent ? "ring-2 ring-white/40" : ""}
              `}
            >
              {isCompleted ? (
                <FaCheck className="text-base" />
              ) : isLocked ? (
                <FaLock className="text-base" />
              ) : (
                index
              )}
            </span>
          </div>

          <div className="min-w-0">
            <h3
              className={`
                text-2xl font-bold leading-tight
                transition-colors duration-300
                ${
                  isCurrent
                    ? "text-[var(--ui-primary)]"
                    : "text-[var(--ui-text)]"
                }
              `}
            >
              {title}
            </h3>
            <p
              className="
                text-sm mt-0.5
                text-[var(--ui-text-muted)]
              "
            >
              {description}
            </p>
          </div>

          <div className="flex-1" />

          <div className="flex items-center gap-2">
            {isCurrent && (
              <span
                className="
                  text-[10px] font-bold uppercase tracking-wider
                  px-2.5 py-1 rounded-full text-white
                  bg-[linear-gradient(135deg,var(--ui-primary),var(--ui-secondary))]
                  shadow-[0_4px_12px_-2px_rgba(0,0,0,0.25)]
                "
              >
                Сейчас
              </span>
            )}
            {isLocked && (
              <span
                className="
                  text-[10px] font-bold uppercase tracking-wider
                  px-2.5 py-1 rounded-full
                  text-[var(--ui-text-muted)]
                  bg-[color-mix(in_srgb,var(--ui-background-tertiary)_60%,transparent)]
                  border border-[var(--ui-border)]
                "
              >
                Закрыто
              </span>
            )}

            <span
              className={`
                text-xs px-3 py-1.5 rounded-full border font-medium
                flex shrink-0 items-center gap-1.5 whitespace-nowrap
                transition-colors duration-300
                ${
                  isCurrent
                    ? "text-[var(--ui-primary)] border-[color-mix(in_srgb,var(--ui-primary)_40%,transparent)]"
                    : "text-[var(--ui-text-muted)] border-[var(--ui-border)]"
                }
                bg-[color-mix(in_srgb,var(--ui-background-secondary)_70%,transparent)]
              `}
            >
              {isLocked ? (
                <FaLock className="text-[10px]" />
              ) : (
                <FaPuzzlePiece className="text-[10px]" />
              )}
              {steps.length} шагов
            </span>
          </div>
        </div>
      </div>

      <div
        className="relative w-full rounded-[2rem] transition-all duration-500"
        style={{ minHeight: maxY }}
      >
        {children}
      </div>
    </div>
  );
};
