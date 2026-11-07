"use client";

import React, { forwardRef, useState, useEffect } from "react";
import { FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { InputWrapper } from "./wrapper/input.wrapper";
import { BaseInputProps } from "./types/field.props";
import {
  baseStyles,
  sizeStyles,
  variantStyles,
  disabledStyles,
  errorStyles,
} from "./styles/field.styles";
import { useInternal } from "./hooks/use.internal";
import { useFocused } from "./hooks/use.focused";
import { FieldIcon } from "./ui/field.icon";

export const PasswordField = forwardRef<HTMLInputElement, BaseInputProps>(
  (props, forwardedRef) => {
    const {
      id,
      label,
      value,
      onChange,
      onFocus,
      onBlur,
      icon: Icon = FaLock,
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

    const [showPassword, setShowPassword] = useState(false);

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
      pl-10 pr-10
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
        isIcon={true}
        labelSize={size}
      >
        <div className="relative">
          <FieldIcon icon={Icon} position="left" />
          <input
            ref={forwardedRef}
            id={id}
            type={showPassword ? "text" : "password"}
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
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            disabled={disabled}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50 z-10"
          >
            {showPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
          </button>
        </div>
      </InputWrapper>
    );
  },
);

PasswordField.displayName = "PasswordField";
