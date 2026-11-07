import {
  ProgressBarLabelPosition,
  ProgressBarSize,
  ProgressBarState,
  ProgressBarTrackVariant,
} from "../types/progress-bar.props";

/** Базовые стили для контейнера прогрессбара */
export const baseContainerStyles = `
  relative
  overflow-hidden
  w-full
`;

/** Стили размеров для контейнера */
export const sizeStyles: Record<ProgressBarSize, string> = {
  xs: "h-1",
  sm: "h-2",
  md: "h-3",
  lg: "h-4",
  xl: "h-6",
};

/** Базовые стили для индикатора прогресса */
export const baseIndicatorStyles = `
  h-full
  flex
  items-center
  justify-center
  overflow-hidden
  relative
`;

/** Стили вариантов фона трека */
export const trackVariantStyles: Record<ProgressBarTrackVariant, string> = {
  solid: "bg-[var(--ui-fill)]",
  none: "bg-transparent",
};

/** Цветовые состояния */
export const stateColors: Record<ProgressBarState, string> = {
  default: "bg-[var(--ui-primary)]",
  info: "bg-[var(--ui-info)]",
  success: "bg-[var(--ui-success)]",
  warning: "bg-[var(--ui-warning)]",
  error: "bg-[var(--ui-error)]",
};

/** Стили для текста */
export const textStyles = {
  inside:
    "text-[var(--ui-text-inverse)] text-xs font-medium px-2 drop-shadow-sm",
  outside: "text-sm font-medium mt-1 text-[var(--ui-text-secondary)]",
  top: "text-sm font-medium mb-1 text-[var(--ui-text-secondary)]",
  bottom: "text-sm font-medium mt-2 text-[var(--ui-text-secondary)]",
};

/** Позиции для текста */
export const labelPositionStyles: Record<ProgressBarLabelPosition, string> = {
  "inside-left": "justify-start pl-2",
  "inside-right": "justify-end pr-2",
  "inside-center": "justify-center",
  "top-left": "justify-start",
  "top-right": "justify-end",
  "bottom-left": "justify-start",
  "bottom-right": "justify-end",
};

/** Стили для иконки завершения */
export const completionIconStyles = `
  absolute
  right-2
  top-1/2
  -translate-y-1/2
  text-white
  drop-shadow-md
  animate-in
  zoom-in
  duration-300
`;
