"use client";

import { FaClock } from "react-icons/fa";
import { formatTime } from "../../libs/utils/formatdate";

interface TimerRingProps {
  timeLeft: number;
  total: number;
}

export const TimerRing: React.FC<TimerRingProps> = ({ timeLeft, total }) => {
  const ratio = total > 0 ? Math.min(Math.max(timeLeft / total, 0), 1) : 0;
  const isLow = timeLeft <= 10 && total > 10;
  const color = isLow ? "var(--ui-error)" : "var(--ui-primary)";
  const radius = 18;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="flex items-center gap-2.5">
      <div className="relative w-12 h-12 shrink-0">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 48 48">
          <circle
            cx="24"
            cy="24"
            r={radius}
            fill="none"
            stroke="var(--ui-border)"
            strokeWidth="4"
          />
          <circle
            cx="24"
            cy="24"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - ratio)}
            className="transition-[stroke-dashoffset,stroke] duration-300 ease-linear"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <FaClock
            size={14}
            style={{ color }}
            className={isLow ? "animate-pulse-slow" : undefined}
          />
        </div>
      </div>
      <div>
        <p className="text-sm font-bold leading-none" style={{ color }}>
          {formatTime(timeLeft)}
        </p>
        <p className="text-[10px] text-[var(--ui-text-muted)] mt-1">
          до конца вопроса
        </p>
      </div>
    </div>
  );
};
