import { CardPadding, CardRadius, CardVariant } from "../types";

export const paddingStyles: Record<CardPadding, string> = {
  none: "p-0",
  sm: "p-3 sm:p-4",
  md: "p-4 sm:p-5",
  lg: "p-5 sm:p-6",
};

export const radiusStyles: Record<CardRadius, string> = {
  none: "rounded-none",
  sm: "rounded-lg",
  md: "rounded-xl",
  lg: "rounded-2xl",
  xl: "rounded-3xl",
  full: "rounded-full",
};

export const variantStyles: Record<CardVariant, string> = {
  default: `
    bg-[var(--ui-background-secondary)] 
    border border-[var(--ui-border)]
  `,
  elevated: `
    bg-[var(--ui-background-secondary)] 
    border border-[var(--ui-border)]
    shadow-lg 
    hover:shadow-xl 
    transition-shadow 
    duration-300
  `,
  bordered: `
    bg-transparent 
    border-2 border-[var(--ui-primary)]
  `,
  ghost: `
    bg-transparent 
    border-none 
    shadow-none
  `,
  gradient: `
    bg-gradient-to-br 
    from-[var(--ui-background)] 
    to-[var(--ui-background-secondary)]
    border border-[var(--ui-border)]
  `,
};

export const hoverStyles = {
  default: "hover:shadow-md transition-all duration-300",
  elevated: "hover:shadow-xl transition-all duration-300",
  bordered:
    "hover:border-[var(--ui-primary-hover)] transition-all duration-300",
  ghost:
    "hover:bg-[var(--ui-background-secondary)]/50 transition-all duration-300",
  gradient: "hover:shadow-lg transition-all duration-300",
};
