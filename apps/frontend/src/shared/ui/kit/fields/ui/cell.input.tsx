"use client";

import React, { forwardRef } from "react";
import { motion } from "framer-motion";
import { InputSize, InputVariant } from "../types";
import {
  baseStyles,
  disabledStyles,
  errorStyles,
  variantStyles,
} from "../styles/field.styles";

interface CodeCellProps {
  index: number;
  value: string;
  onChange: (index: number, value: string) => void;
  onKeyDown: (index: number, e: React.KeyboardEvent<HTMLInputElement>) => void;
  onPaste: (e: React.ClipboardEvent) => void;
  disabled?: boolean;
  error?: boolean;
  autoFocus?: boolean;
  variant?: InputVariant;
  size?: InputSize;
}

const CELL_SIZE: Record<InputSize, string> = {
  sm: "!w-12 !h-8 text-sm",
  md: "!w-12 !h-12 text-lg",
  lg: "!w-12 !h-16 text-xl",
};

export const CellInput = forwardRef<HTMLInputElement, CodeCellProps>(
  (props, ref) => {
    const {
      index,
      value,
      onChange,
      onKeyDown,
      onPaste,
      disabled = false,
      error = false,
      autoFocus = false,
      variant = "rounded",
      size = "md",
    } = props;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      if (inputValue.length > 1) return;
      onChange(index, inputValue);
    };

    const handleKeyDownEvent = (e: React.KeyboardEvent<HTMLInputElement>) => {
      onKeyDown(index, e);
    };

    const cellStyles = `
      ${baseStyles}
      text-center font-semibold border-2
      focus:ring-2 focus:border-transparent
      ${CELL_SIZE[size]}
      ${variantStyles[variant]}
      ${error ? errorStyles : ""}
      ${disabled ? disabledStyles : ""}
    `;

    return (
      <motion.div
        initial={false}
        animate={{
          scale: value ? [1, 1.05, 1] : 1,
        }}
        transition={{ duration: 0.2 }}
      >
        <input
          ref={ref}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDownEvent}
          onPaste={onPaste}
          disabled={disabled}
          autoFocus={autoFocus}
          className={cellStyles}
        />
      </motion.div>
    );
  },
);

CellInput.displayName = "CodeCell";
