import { useState } from "react";

interface UseFocusedProps {
  onFocus?: (e: any) => void;
  onBlur?: (e: any) => void;
}

interface UseFocusedReturn {
  isFocused: boolean;
  handleFocus: (e: any, func?: () => void) => void;
  handleBlur: (e: any, func?: () => void) => void;
  setIsFocused: React.Dispatch<React.SetStateAction<boolean>>;
}

export const useFocused = ({
  onFocus,
  onBlur,
}: UseFocusedProps): UseFocusedReturn => {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = (
    e: React.FocusEvent<HTMLInputElement>,
    func?: () => void,
  ) => {
    setIsFocused(true);
    onFocus?.(e);
    func?.();
  };

  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement>,
    func?: () => void,
  ) => {
    setIsFocused(false);
    onBlur?.(e);
    func?.();
  };

  return { isFocused, handleFocus, handleBlur, setIsFocused };
};
