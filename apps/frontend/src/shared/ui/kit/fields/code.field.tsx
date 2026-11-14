"use client";

import React, { useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { InputSize, InputVariant } from "./types";
import { CellInput } from "./ui/cell.input";

interface IProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
  className?: string;
  autoFocus?: boolean;
  variant?: InputVariant;
  size?: InputSize;
}

export const CodeField: React.FC<IProps> = (props) => {
  const {
    length = 6,
    value,
    onChange,
    disabled = false,
    error,
    className = "",
    autoFocus = true,
    variant = "rounded",
    size = "md",
  } = props;
  const code = useMemo(() => {
    const nextCode = Array<string>(length).fill("");
    value
      .split("")
      .slice(0, length)
      .forEach((char, index) => {
        nextCode[index] = char;
      });
    return nextCode;
  }, [length, value]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleCellChange = (index: number, inputValue: string) => {
    const newCode = [...code];
    newCode[index] = inputValue;
    onChange(newCode.join(""));

    if (inputValue && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowRight" && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, length);
    const pastedArray = pastedData.split("");
    const newCode = [...code];

    pastedArray.forEach((char, idx) => {
      if (idx < length) {
        newCode[idx] = char;
      }
    });

    onChange(newCode.join(""));

    const lastFilledIndex = Math.min(pastedArray.length, length - 1);
    inputRefs.current[lastFilledIndex]?.focus();
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex justify-between gap-2">
        {code.map((digit, index) => (
          <CellInput
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            index={index}
            value={digit}
            onChange={handleCellChange}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            disabled={disabled}
            error={!!error}
            autoFocus={autoFocus && index === 0}
            variant={variant}
            size={size}
          />
        ))}
      </div>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[10px] text-red-500 text-center"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
};

CodeField.displayName = "CodeField";
