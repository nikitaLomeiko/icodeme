import { useMemo } from "react";
import { stateColors } from "../styles/progress-bar.styles";
import { ProgressBarState } from "../types";

interface IProps {
  segments?: number;
  percentage: number;
  segmentGap: number;
  state: ProgressBarState;
  indicatorColor?: string;
  isSegmentedCapsule: boolean;
}

export const Segment: React.FC<IProps> = (props) => {
  const {
    segments,
    percentage,
    segmentGap,
    state,
    indicatorColor,
    isSegmentedCapsule,
  } = props;

  const segmentCount = segments || 10;

  const filledSegments = useMemo(
    () => Math.floor((percentage / 100) * segmentCount),
    [percentage, segmentCount],
  );

  return (
    <div
      className="flex items-center h-full w-full"
      style={{ gap: `${segmentGap}px`, padding: `${segmentGap}px` }}
    >
      {Array.from({ length: segmentCount }).map((_, i) => (
        <div
          key={i}
          className={`flex-1 h-full transition-colors duration-300 ${
            i < filledSegments
              ? stateColors[state]
              : "bg-white/20 dark:bg-white/10"
          } ${isSegmentedCapsule ? "rounded-full" : ""}`}
          style={
            i < filledSegments && indicatorColor
              ? { backgroundColor: indicatorColor }
              : undefined
          }
        />
      ))}
    </div>
  );
};
