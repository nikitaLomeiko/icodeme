import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useInternal } from "./use.internal";

interface UseSuggestionsProps {
  internalValue: string | number | readonly string[];
  setInternalValue: (value: string | number | readonly string[]) => void;
  suggestions: string[];
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectSuggestion?: (value: string) => void;
  maxSuggestions?: number;
}

interface UseSuggestionsReturn {
  internalValue: string | number | readonly string[];
  showSuggestions: boolean;
  highlightedIndex: number;
  wrapperRef: React.RefObject<HTMLDivElement | null>;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  selectSuggestion: (suggestion: string) => void;
  setShowSuggestions: (show: boolean) => void;
  filteredSuggestions: string[];
}

export const useSuggestions = ({
  internalValue,
  setInternalValue,
  suggestions,
  onChange,
  onSelectSuggestion,
  maxSuggestions = 5,
}: UseSuggestionsProps): UseSuggestionsReturn => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredSuggestions = useMemo(() => {
    const inputValue = String(internalValue).toLowerCase();
    return suggestions
      .filter((s) => String(s).toLowerCase().includes(inputValue))
      .slice(0, maxSuggestions);
  }, [suggestions, internalValue, maxSuggestions]);

  const selectSuggestion = useCallback(
    (suggestion: string) => {
      setInternalValue(suggestion);
      setShowSuggestions(false);
      onSelectSuggestion?.(suggestion);

      const event = {
        target: { value: suggestion },
      } as React.ChangeEvent<HTMLInputElement>;
      onChange?.(event);
    },
    [onChange, onSelectSuggestion, setInternalValue],
  );

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setShowSuggestions(true);
    setHighlightedIndex(-1);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filteredSuggestions.length - 1 ? prev + 1 : prev,
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (highlightedIndex >= 0 && filteredSuggestions[highlightedIndex]) {
          selectSuggestion(filteredSuggestions[highlightedIndex]);
        }
      } else if (e.key === "Escape") {
        setShowSuggestions(false);
      }
    },
    [filteredSuggestions, highlightedIndex, selectSuggestion],
  );

  return {
    internalValue,
    showSuggestions,
    highlightedIndex,
    wrapperRef,
    handleChange,
    handleKeyDown,
    selectSuggestion,
    setShowSuggestions,
    filteredSuggestions,
  };
};
