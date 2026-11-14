import { useState } from "react";

interface UseFocusedProps<TElement extends HTMLElement> {
  onFocus?: React.FocusEventHandler<TElement>;
  onBlur?: React.FocusEventHandler<TElement>;
}

interface UseFocusedReturn<TElement extends HTMLElement> {
  isFocused: boolean;
  handleFocus: (e: React.FocusEvent<TElement>, func?: () => void) => void;
  handleBlur: (e: React.FocusEvent<TElement>, func?: () => void) => void;
  setIsFocused: React.Dispatch<React.SetStateAction<boolean>>;
}

export const useFocused = <TElement extends HTMLElement = HTMLInputElement>({
  onFocus,
  onBlur,
}: UseFocusedProps<TElement>): UseFocusedReturn<TElement> => {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = (e: React.FocusEvent<TElement>, func?: () => void) => {
    setIsFocused(true);
    onFocus?.(e);
    func?.();
  };

  const handleBlur = (e: React.FocusEvent<TElement>, func?: () => void) => {
    setIsFocused(false);
    onBlur?.(e);
    func?.();
  };

  return { isFocused, handleFocus, handleBlur, setIsFocused };
};
