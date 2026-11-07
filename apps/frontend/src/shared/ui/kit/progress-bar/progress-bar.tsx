"use client";

import React, { useEffect, useRef } from "react";
import { motion, useAnimation } from "framer-motion";
import { ProgressBarProps } from "./types";
import {
  baseContainerStyles,
  baseIndicatorStyles,
  sizeStyles,
  stateColors,
  textStyles,
  trackVariantStyles,
  labelPositionStyles,
} from "./styles/progress-bar.styles";
import { Segment } from "./components/segment";

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  variant = "default",
  state = "default",
  size = "md",
  trackVariant = "solid",
  showValue = false,
  label,
  labelPosition = "inside-center",
  duration = 500,
  delay = 0,
  indicatorColor,
  trackColor,
  minWidth = 0,
  segments,
  segmentGap = 2,
  className = "",
  ...props
}) => {
  const controls = useAnimation();
  const ref = useRef<HTMLDivElement>(null);

  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const displayValue = label || `${Math.round(percentage)}%`;

  const isSquare = variant === "square";
  const isSegmented = variant === "segmented";
  const isSegmentedCapsule = variant === "segmented-capsule";
  const isAnySegmented = isSegmented || isSegmentedCapsule;

  useEffect(() => {
    if (isAnySegmented) {
      controls.start({
        width: "100%",
        transition: { duration: 0 },
      });
      return;
    }

    controls.start({
      width: `${Math.max(percentage, (minWidth / (ref.current?.offsetWidth || 1)) * 100)}%`,
      transition: {
        duration: duration / 1000,
        delay: delay / 1000,
      },
    });
  }, [percentage, duration, delay, minWidth, controls, isAnySegmented]);

  const containerRounded =
    isSquare || isSegmented ? "rounded-none" : "rounded-full";
  const indicatorRounded =
    isSquare || isSegmentedCapsule ? "rounded-none" : "rounded-full";

  const indicatorStyle = indicatorColor
    ? { backgroundColor: indicatorColor }
    : undefined;

  return (
    <div className={`w-full ${className}`} {...props}>
      {labelPosition?.includes("top") && (
        <div
          className={`${textStyles.top} flex ${labelPositionStyles[labelPosition]}`}
        >
          {showValue && <span>{displayValue}</span>}
        </div>
      )}

      <div
        ref={ref}
        className={`
          ${baseContainerStyles}
          ${sizeStyles[size]}
          ${containerRounded}
          ${trackColor ? "" : trackVariantStyles[trackVariant]}
        `}
        style={trackColor ? { backgroundColor: trackColor } : undefined}
      >
        {isSegmented || isSegmentedCapsule ? (
          <motion.div
            className={`
              ${baseIndicatorStyles}
              ${indicatorRounded}
             
            `}
            initial={{ width: 0 }}
            animate={controls}
          >
            <Segment
              state={state}
              indicatorColor={indicatorColor}
              segments={segments}
              percentage={percentage}
              segmentGap={segmentGap}
              isSegmentedCapsule={isSegmentedCapsule}
            />
          </motion.div>
        ) : (
          <motion.div
            className={`
              ${baseIndicatorStyles}
              ${stateColors[state]}
              ${indicatorRounded}
              ${labelPositionStyles[labelPosition] || ""}
             
             
            `}
            style={indicatorStyle}
            initial={{ width: 0 }}
            animate={controls}
          >
            {showValue && labelPosition?.includes("inside") && (
              <span className={textStyles.inside}>{displayValue}</span>
            )}
          </motion.div>
        )}
      </div>

      {labelPosition?.includes("bottom") && (
        <div
          className={`${textStyles.bottom} flex ${labelPositionStyles[labelPosition]}`}
        >
          {showValue && <span>{displayValue}</span>}
        </div>
      )}
    </div>
  );
};

ProgressBar.displayName = "ProgressBar";
