"use client";

import { forwardRef } from "react";
import { InputWrapper } from "./wrapper/input.wrapper";
import { BaseInputProps } from "./types/field.props";
import {
  baseStyles,
  sizeStyles,
  variantStyles,
  disabledStyles,
  errorStyles,
} from "./styles/field.styles";
import { useFocused } from "./hooks/use.focused";
import { useInternal } from "./hooks/use.internal";
import { FieldIcon } from "./ui/field.icon";

export const TextField = forwardRef<HTMLInputElement, BaseInputProps>(
  (props, forwardedRef) => {
    const {
      id,
      label,
      type = "text",
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
      ...restProps
    } = props;

    const Icon = icon || iconLeft;
    const hasLeftIcon = !!Icon;
    const hasRightIcon = !!iconRight;

    const { handleChange, hasValue, internalValue } = useInternal({
      value,
      onChange,
    });
    const { handleBlur, handleFocus, isFocused } = useFocused({
      onFocus,
      onBlur,
    });

    const inputStyles = `
      ${baseStyles}
      ${sizeStyles[size]}
      ${variantStyles[variant]}
      ${error ? errorStyles : ""}
      ${disabled ? disabledStyles : ""}
      ${fullWidth ? "w-full" : ""}
      ${hasLeftIcon ? "pl-10" : "pl-2"}
      ${hasRightIcon ? "pr-10" : "pr-2"}
      ${className}
    `;

    return (
      <InputWrapper
        id={id}
        label={label}
        isFocused={isFocused}
        hasValue={hasValue}
        error={error}
        required={required}
        mode={inputMode}
        isIcon={!!Icon || !!iconRight}
        labelSize={size}
        fullWidh={fullWidth}
      >
        <div className="relative">
          {hasLeftIcon && <FieldIcon icon={Icon} position="left" />}
          {hasRightIcon && <FieldIcon icon={iconRight} position="right" />}
          <input
            ref={forwardedRef}
            id={id}
            type={type}
            value={internalValue}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            required={required}
            disabled={disabled}
            className={inputStyles}
            placeholder={placeholder}
            {...restProps}
          />
        </div>
      </InputWrapper>
    );
  },
);

TextField.displayName = "TextField";
