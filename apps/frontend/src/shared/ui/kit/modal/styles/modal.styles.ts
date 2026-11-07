import { ModalPosition, ModalSize, ModalVariant } from "../types";

export const sizeStyles: Record<ModalSize, string> = {
  xs: "max-w-sm",
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
  full: "max-w-[90vw] w-full",
};

export const positionStyles: Record<ModalPosition, string> = {
  center: "items-center justify-center",
  top: "items-start justify-center pt-8",
  "top-left": "items-start justify-start pt-8 pl-8",
  "top-right": "items-start justify-end pt-8 pr-8",
  bottom: "items-end justify-center pb-8",
  "bottom-left": "items-end justify-start pb-8 pl-8",
  "bottom-right": "items-end justify-end pb-8 pr-8",
  left: "items-center justify-start pl-8",
  right: "items-center justify-end pr-8",
};

export const overlayVariantStyles: Record<ModalVariant, string> = {
  dark: "bg-black/60",
  blur: "bg-black/30 backdrop-blur-md",
  transparent: "bg-transparent",
  none: "bg-transparent",
};

export const contentVariantStyles: Record<ModalVariant, string> = {
  dark: "bg-[var(--ui-background)] border border-[var(--ui-border)]",
  blur: "bg-white/10 dark:bg-black/30 backdrop-blur-xl border border-white/20",
  transparent: "bg-transparent shadow-none",
  none: "bg-[var(--ui-background)]",
};

export const animationOverlay = "transition-all duration-300 ease-out";
export const animationOverlayHidden = "opacity-0 pointer-events-none";
export const animationOverlayVisible = "opacity-100";

export const animationContent = "transition-all duration-300 ease-out";
export const animationContentHidden = "opacity-0 scale-95";
export const animationContentVisible = "opacity-100 scale-100";
