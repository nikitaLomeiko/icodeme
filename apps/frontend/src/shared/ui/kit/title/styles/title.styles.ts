import { TitleSize, TitleWeight, TitleColor } from "../types/title.props";

export const sizeStyles: Record<TitleSize, string> = {
  xs: "text-xs",
  sm: "text-sm",
  base: "text-base",
  lg: "text-lg",
  xl: "text-xl",
  "2xl": "text-2xl",
  "3xl": "text-3xl",
  "4xl": "text-4xl",
};

export const weightStyles: Record<TitleWeight, string> = {
  normal: "font-normal",
  medium: "font-medium",
  semibold: "font-semibold",
  bold: "font-bold",
  extrabold: "font-extrabold",
};

export const colorStyles: Record<TitleColor, string> = {
  default: "text-current",
  "emerald-800": "text-emerald-800",
  "emerald-700": "text-emerald-700",
  "gray-800": "text-gray-800",
  "gray-700": "text-gray-700",
  "gray-600": "text-gray-600",
  "gray-500": "text-gray-500",
  gradient:
    "bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 bg-clip-text text-transparent",
  error: "text-red-500",
};

export const alignStyles: Record<"left" | "center" | "right", string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};
