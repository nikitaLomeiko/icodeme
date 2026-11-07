export const baseStyles =
  "inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";

export const sizeStyles = {
  sm: "px-3 py-1.5 text-xs gap-1.5",
  md: "px-4 py-2 text-sm gap-2",
  lg: "px-6 py-3 text-base gap-2",
};

export const variantStyles = {
  primary: `
    !bg-[var(--ui-primary)] 
    text-white 
    hover:bg-[var(--ui-primary-hover)] 
    active:bg-[var(--ui-primary-active)]
    shadow-sm
    hover:shadow-md
    hover:scale-[1.02] 
    active:scale-[0.98]
  `,
  outline: `
    border-2 
    border-[var(--ui-primary)] 
    bg-transparent 
    text-[var(--ui-primary)] 
    hover:border-[var(--ui-primary)] 
    hover:text-[var(--ui-text-inverse)]
    hover:bg-[var(--ui-primary)]
    hover:scale-[1.02] 
    active:scale-[0.98]
  `,
  ghost: `
    bg-transparent 
    text-[var(--ui-primary)] 
    hover:bg-[var(--ui-background-secondary)] 
    hover:text-[var(--ui-primary-hover)]
    active:scale-[0.98]
  `,
  danger: `
    bg-[var(--ui-error)] 
    text-white 
    hover:opacity-90 
    active:opacity-80
    hover:scale-[1.02] 
    active:scale-[0.98]
  `,
};
