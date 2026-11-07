import { ReactNode } from "react";

export type DropdownVariant =
  | "rounded"
  | "pill"
  | "underline"
  | "clean"
  | "square";
export type DropdownSize = "sm" | "md" | "lg";
export type DropdownMode = "floating" | "static";
export type DropdownPosition = "bottom" | "top" | "auto";

export interface DropdownOption {
  value: string;
  label: string;
  icon?: React.ElementType;
  disabled?: boolean;
  description?: string;
}

export interface BaseDropdownProps {
  id: string;
  label?: string;
  options: DropdownOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string | string[], option: DropdownOption | null) => void;
  icon?: React.ElementType;
  iconLeft?: React.ElementType;
  iconRight?: React.ElementType;
  error?: string;
  variant?: DropdownVariant;
  size?: DropdownSize;
  fullWidth?: boolean;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
  inputMode?: DropdownMode;
  position?: DropdownPosition;
  searchable?: boolean;
  clearable?: boolean;
  multiple?: boolean;
  maxHeight?: number;
  className?: string;
  renderOption?: (option: DropdownOption, isSelected: boolean) => ReactNode;
  renderValue?: (
    selected: DropdownOption | DropdownOption[] | null,
  ) => ReactNode;
  onSearch?: (searchTerm: string) => void;
  noOptionsMessage?: string;
}
