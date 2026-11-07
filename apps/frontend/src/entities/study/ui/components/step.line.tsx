import { useEffect, useRef, useState } from "react";
import { getStepPosition, IStep } from "../../model";

interface IProps {
  steps: IStep[];
}

export const StepLine: React.FC<IProps> = ({ steps }) => {
  const containerRef = useRef<SVGSVGElement | null>(null);
  const [width, setWidth] = useState(0);
  const [lineColor, setLineColor] = useState("rgba(100,116,139,0.35)");

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const parent = el.parentElement;
    if (!parent) return;

    const update = () => setWidth(parent.clientWidth);

    update();

    const ro = new ResizeObserver(update);
    ro.observe(parent);
    if (typeof window !== "undefined") {
      window.addEventListener("resize", update);
    }

    if (typeof document !== "undefined") {
      const isDark =
        document.documentElement.getAttribute("data-theme") === "dark";
      setLineColor(
        isDark ? "rgba(148,163,184,0.35)" : "rgba(100,116,139,0.35)",
      );
    }

    return () => {
      ro.disconnect();
      if (typeof window !== "undefined") {
        window.removeEventListener("resize", update);
      }
    };
  }, []);

  if (steps.length < 2) return null;

  const points = steps.map((step, index) => {
    const pos = getStepPosition(step.position, index);
    const xPx = (pos.x / 100) * width;
    return {
      x: xPx + 60,
      y: pos.y + 60,
    };
  });

  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const midX = (prev.x + curr.x) / 2;
    const waveOffset = 30 + (i % 2) * 20;
    const cp1x = midX - 15 + (i % 2) * 30;
    const cp1y = prev.y - waveOffset + (i % 2) * (waveOffset * 2);
    const cp2x = midX + 15 - (i % 2) * 30;
    const cp2y = curr.y - waveOffset + (i % 2) * (waveOffset * 2);
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`;
  }

  return (
    <svg
      ref={containerRef}
      className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-visible"
      style={{ zIndex: 1 }}
    >
      <defs>
        <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={lineColor} />
          <stop offset="50%" stopColor={lineColor} stopOpacity="0.45" />
          <stop offset="100%" stopColor={lineColor} />
        </linearGradient>
      </defs>
      <path
        d={d}
        stroke="url(#lineGrad)"
        strokeWidth="2.5"
        strokeDasharray="6 7"
        strokeLinecap="round"
        fill="none"
      />
      {points.map(
        (point, idx) =>
          idx > 0 &&
          idx < points.length - 1 && (
            <circle
              key={idx}
              cx={point.x}
              cy={point.y}
              r="4"
              fill={lineColor}
              opacity="0.5"
            />
          ),
      )}
    </svg>
  );
};
