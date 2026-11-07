import { InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import { InputMode, InputSize, InputVariant } from "./field.types";

export interface BaseInputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "size" | "inputMode"
> {
  id: string;
  label?: string;
  icon?: React.ElementType;
  iconLeft?: React.ElementType;
  iconRight?: React.ElementType;
  error?: string;
  variant?: InputVariant;
  size?: InputSize;
  fullWidth?: boolean;
  disabled?: boolean;
  inputMode?: InputMode;
}

export interface BaseTextareaProps extends Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  "size" | "inputMode"
> {
  id: string;
  label?: string;
  iconLeft?: React.ElementType;
  error?: string;
  variant?: InputVariant;
  size?: InputSize;
  fullWidth?: boolean;
  disabled?: boolean;
  inputMode?: InputMode;
  rows?: number;
  maxLength?: number;
  autoExpand?: boolean;
  maxRows?: number;
}
