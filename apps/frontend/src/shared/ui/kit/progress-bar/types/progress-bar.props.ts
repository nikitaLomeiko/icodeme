import { HTMLAttributes } from "react";

export type ProgressBarVariant =
  | "default"
  | "square"
  | "capsule"
  | "segmented"
  | "segmented-capsule";

export type ProgressBarSize = "xs" | "sm" | "md" | "lg" | "xl";

export type ProgressBarAnimation =
  | "none"
  | "slide"
  | "fade"
  | "bounce"
  | "pulse"
  | "shimmer";

export type ProgressBarState =
  | "default"
  | "info"
  | "success"
  | "warning"
  | "error";

export type ProgressBarTrackVariant = "solid" | "none";

export type ProgressBarLabelPosition =
  | "inside-left"
  | "inside-right"
  | "inside-center"
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right";

export interface ProgressBarProps extends HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  variant?: ProgressBarVariant;
  state?: ProgressBarState;
  size?: ProgressBarSize;
  trackVariant?: ProgressBarTrackVariant;
  showValue?: boolean;
  label?: string;
  labelPosition?: ProgressBarLabelPosition;
  duration?: number;
  delay?: number;
  indicatorColor?: string;
  trackColor?: string;
  minWidth?: number;
  segments?: number;
  segmentGap?: number;
}
