export const stylesVariant = {
  square: "border border-[var(--ui-border)] rounded-none",
  rounded: "border border-[var(--ui-border)] rounded-md",
  pill: "border border-[var(--ui-border)] rounded-full",
  underline: "border-0 border-b-2 border-[var(--ui-border)] rounded-none",
  clean: "border-0 bg-transparent rounded-none",
};

const styleSizeSmall = {
  button: "px-5 py-2 text-xs",
  icon: "w-3.5 h-3.5",
};

const styleSizeMedium = {
  button: "px-5 py-3 text-sm",
  icon: "w-4 h-4",
};

const styleSizeLarge = {
  button: "px-5 py-4 text-[18px]",
  icon: "w-5 h-5",
};

export const styleSize = {
  sm: styleSizeSmall,
  md: styleSizeMedium,
  lg: styleSizeLarge,
};

export const getDropdownPosition = (position: string) => {
  if (position === "top") return "bottom-full mb-2";
  return "top-full mt-2";
};
