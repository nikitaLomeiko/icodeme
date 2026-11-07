"use client";

import React, { forwardRef } from "react";
import { InputWrapper } from "./wrapper/input.wrapper";
import { BaseInputProps } from "./types/field.props";
import {
  baseStyles,
  sizeStyles,
  variantStyles,
  disabledStyles,
  errorStyles,
} from "./styles/field.styles";
import { Suggestions } from "./ui/suggestions";
import { useSuggestions } from "./hooks/use.suggestions";
import { useFocused } from "./hooks/use.focused";
import { useInternal } from "./hooks/use.internal";
import { FieldIcon } from "./ui/field.icon";

export interface InputWithSuggestionsProps extends Omit<
  BaseInputProps,
  "type"
> {
  suggestions: string[];
  onSelectSuggestion?: (value: string) => void;
  maxSuggestions?: number;
}

export const InputWithSuggestions = forwardRef<
  HTMLInputElement,
  InputWithSuggestionsProps
>((props, forwardedRef) => {
  const {
    id,
    label,
    value,
    onChange,
    onFocus,
    onBlur,
    icon,
    iconLeft,
    iconRight,
    required = false,
    disabled = false,
    error,
    variant = "rounded",
    size = "md",
    fullWidth = false,
    className = "",
    inputMode = "floating",
    placeholder,
    suggestions = [],
    onSelectSuggestion,
    maxSuggestions = 5,
    ...restProps
  } = props;

  const Icon = icon || iconLeft;
  const hasLeftIcon = !!Icon;
  const hasRightIcon = !!iconRight;

  const { handleBlur, handleFocus, isFocused } = useFocused({
    onFocus,
    onBlur,
  });

  const {
    internalValue,
    hasValue,
    handleChange: handleBaseChange,
    setInternalValue,
  } = useInternal({
    value,
    onChange,
  });

  const {
    handleChange,
    handleKeyDown,
    selectSuggestion,
    highlightedIndex,
    setShowSuggestions,
    showSuggestions,
    wrapperRef,
    filteredSuggestions,
  } = useSuggestions({
    internalValue,
    setInternalValue,
    suggestions,
    onChange,
    onSelectSuggestion,
    maxSuggestions,
  });

  const inputStyles = `
      ${baseStyles}
      ${sizeStyles[size]}
      ${variantStyles[variant]}
      ${error ? errorStyles : ""}
      ${disabled ? disabledStyles : ""}
      ${fullWidth ? "w-full" : ""}
      ${hasLeftIcon ? "pl-10" : "pl-0"}
      ${hasRightIcon ? "pr-10" : "pr-0"}
      ${className}
    `;

  return (
    <div ref={wrapperRef} className="relative">
      <InputWrapper
        id={id}
        label={label}
        isFocused={isFocused || showSuggestions}
        hasValue={hasValue}
        error={error}
        required={required}
        mode={inputMode}
        isIcon={hasLeftIcon || hasRightIcon}
        labelSize={size}
      >
        <div className="relative">
          {hasLeftIcon && <FieldIcon icon={Icon} position="left" />}
          {hasRightIcon && <FieldIcon icon={iconRight} position="right" />}
          <input
            ref={forwardedRef}
            id={id}
            type="text"
            value={internalValue}
            onChange={(e) => handleBaseChange(e, () => handleChange(e))}
            onFocus={(e) => handleFocus(e, () => setShowSuggestions(true))}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            required={required}
            disabled={disabled}
            className={inputStyles}
            placeholder={placeholder}
            autoComplete="off"
            {...restProps}
          />
        </div>
      </InputWrapper>

      <Suggestions
        suggestions={filteredSuggestions}
        showSuggestions={showSuggestions}
        highlightedIndex={highlightedIndex}
        selectSuggestion={selectSuggestion}
        internalValue={internalValue}
      />
    </div>
  );
});

InputWithSuggestions.displayName = "InputWithSuggestions";
