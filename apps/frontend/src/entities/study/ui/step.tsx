"use client";

import { useRef, useState } from "react";
import { FaLock } from "react-icons/fa";
import { getStepPosition, IStep } from "../model";
import {
  getCardStyle,
  getStepLabel,
  getStepPalette,
  stepIcons,
} from "./style/step.style";

interface IProps extends IStep {
  stepNumber: number;
  isSelected?: boolean;
  onSelect?: () => void;
}

export const Step: React.FC<IProps> = (props) => {
  const {
    description,
    title,
    id,
    position,
    type,
    stepNumber,
    isCompleted = false,
    isCurrent = false,
    isSelected = false,
    onSelect,
  } = props;

  const pos = getStepPosition(position, stepNumber - 1);
  const Icon = stepIcons[type];
  const label = getStepLabel(type);
  const palette = getStepPalette(type);
  const isLocked = !isCompleted && !isCurrent;
  const stepRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [tooltipSide, setTooltipSide] = useState<"left" | "right">("right");

  const updateTooltipSide = () => {
    const step = stepRef.current;
    if (!step) return;

    const sidebar = document.querySelector<HTMLElement>("[data-study-sidebar]");
    const rightBoundary = sidebar?.getClientRects().length
      ? sidebar.getBoundingClientRect().left
      : window.innerWidth;
    const rect = step.getBoundingClientRect();
    const tooltipWidth = tooltipRef.current?.offsetWidth ?? 200;
    const spaceRight = rightBoundary - rect.right - 8;
    const spaceLeft = rect.left - 8;

    setTooltipSide(
      spaceRight < tooltipWidth + 16 && spaceLeft > spaceRight
        ? "left"
        : "right",
    );
  };

  const containerStyle: React.CSSProperties = {
    left: `${pos.x}%`,
    top: pos.y,
    zIndex: isCurrent ? 4 : 2,
  };

  const cardStyle = getCardStyle(isCompleted, isCurrent, palette);

  const glowColor = isCompleted ? "rgba(16,185,129,0.75)" : palette.dot;
  const glowSoft = isCompleted ? "rgba(16,185,129,0.35)" : palette.bg;

  return (
    <div
      ref={stepRef}
      key={id}
      data-step=""
      data-step-index={stepNumber - 1}
      data-current-step={isCurrent ? "" : undefined}
      tabIndex={-1}
      onPointerEnter={updateTooltipSide}
      onFocusCapture={updateTooltipSide}
      className={`
        absolute group h-[100px] w-[100px] transition-transform duration-300 2xl:h-[150px] 2xl:w-[150px]
        ${
          isLocked
            ? "pointer-events-none cursor-default opacity-55 grayscale"
            : "cursor-pointer"
        }
      `}
      style={containerStyle}
    >
      {isCurrent && (
        <>
          <span
            aria-hidden
            className="
              pointer-events-none absolute inset-0 rounded-[1.6rem]
              animate-ping
            "
            style={{
              background: `radial-gradient(circle, ${glowSoft} 40%, transparent 70%)`,
            }}
          />
          <span
            aria-hidden
            className="
              pointer-events-none absolute -inset-1 rounded-[1.8rem]
              blur-[10px] opacity-70
            "
            style={{
              background: `radial-gradient(circle, ${glowColor} 30%, transparent 75%)`,
            }}
          />
        </>
      )}

      <div
        className={`
          relative w-full h-full rounded-[1.6rem] border
          flex flex-col items-center justify-center gap-1.5
          transition-all duration-300 ease-out will-change-transform
          ${
            isLocked
              ? ""
              : "group-hover:-translate-y-3 group-hover:scale-110 group-hover:rotate-3"
          }
          ${isSelected ? "ring-2 ring-[var(--ui-primary)] ring-offset-2 ring-offset-[var(--ui-background)]" : ""}
        `}
        style={cardStyle}
      >
        {onSelect && (
          <button
            type="button"
            onClick={onSelect}
            disabled={isLocked}
            aria-label={`Выбрать шаг «${title}»`}
            aria-pressed={isSelected}
            className="absolute inset-0 z-10 rounded-[1.6rem] cursor-pointer focus-visible:outline-2 focus-visible:outline-[var(--ui-primary)] disabled:cursor-default"
          />
        )}
        {!isLocked && (
          <div
            aria-hidden
            className="
              pointer-events-none absolute inset-0 rounded-[1.6rem]
              opacity-0 blur-[6px]
              transition-opacity duration-300 ease-out
              group-hover:opacity-100
            "
            style={{
              boxShadow: `0 0 24px 6px ${glowSoft}, 0 0 48px 12px ${glowColor}`,
            }}
          />
        )}

        {!isCompleted && (
          <>
            {isLocked ? (
              <div
                className="
                  w-8 h-8 2xl:w-16 2xl:h-16 rounded-2xl flex items-center justify-center
                  bg-[color-mix(in_srgb,var(--ui-background-tertiary)_60%,transparent)]
                "
              >
                <FaLock className="text-2xl text-[var(--ui-text-muted)]" />
              </div>
            ) : (
              <div
                className="
                  w-8 h-8 2xl:w-16 2xl:h-16 rounded-2xl flex items-center justify-center
                  transition-all duration-300
                  group-hover:scale-110 group-hover:rotate-6
                "
                style={{ background: palette.bg }}
              >
                <Icon
                  className="text-2xl transition-transform duration-300"
                  style={{ color: palette.dot }}
                />
              </div>
            )}

            <span
              className="
                mt-2 text-[12px] font-bold uppercase tracking-wider
                px-2 py-0.5 rounded-full
              "
              style={{
                color: isLocked ? "var(--ui-text-muted)" : palette.dot,
                background: isLocked
                  ? "color-mix(in srgb, var(--ui-background-tertiary) 40%, transparent)"
                  : palette.chip,
              }}
            >
              {isLocked ? "Закрыто" : label}
            </span>
          </>
        )}

        {isCompleted && (
          <div className="flex flex-col items-center gap-1">
            <span
              className="
                w-8 h-8 2xl:w-16 2xl:h-16 rounded-full flex items-center justify-center
                text-white text-[14px] 2xl:text-2xl
                bg-white/20
                shadow-[inset_0_2px_8px_rgba(255,255,255,0.25)]
                backdrop-blur-[4px]
              "
            >
              ✓
            </span>
            <span className="mt-2 text-[10px] 2xl:text-[12px] font-bold uppercase tracking-wider text-white/90">
              Пройдено
            </span>
          </div>
        )}

        <span
          className="
            absolute -top-2 -right-2 w-7 h-7 rounded-full
            flex items-center justify-center
            text-xs font-bold text-white border-2 shadow-md
          "
          style={{
            background: isCompleted ? "#047857" : palette.dot,
            borderColor: "var(--ui-background)",
          }}
        >
          {stepNumber}
        </span>
      </div>

      <div
        ref={tooltipRef}
        className={`
          absolute top-1/2 w-[200px] pointer-events-none
          ${tooltipSide === "left" ? "right-full mr-4 translate-x-[6px]" : "left-full ml-4 translate-x-[-6px]"}
          -translate-y-1/2 opacity-0
          transition-all duration-300 ease-out
          group-hover:translate-x-0 group-hover:opacity-100
          group-focus-within:translate-x-0 group-focus-within:opacity-100
        `}
      >
        <div className="text-left py-1 text-[var(--ui-text)]">
          <div className="text-[12px] font-bold leading-tight line-clamp-1">
            {title}
          </div>
          <div className="text-[10px] leading-tight mt-0.5 text-[var(--ui-text-muted)]">
            {description}
          </div>
        </div>
      </div>
    </div>
  );
};
