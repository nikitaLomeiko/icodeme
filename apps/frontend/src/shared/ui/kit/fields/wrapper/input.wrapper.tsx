"use client";

import React from "react";
import { motion } from "framer-motion";
import { InputMode } from "../types";

interface InputWrapperProps {
  id: string;
  label?: string;
  children: React.ReactNode;
  isFocused: boolean;
  hasValue: boolean;
  error?: string;
  required?: boolean;
  mode?: InputMode;
  labelPosition?: "center" | "top";
  isIcon?: boolean;
  labelSize?: "xs" | "sm" | "md" | "lg";
  fullWidh?: boolean;
}

export const InputWrapper: React.FC<InputWrapperProps> = ({
  id,
  label,
  children,
  isFocused,
  hasValue,
  error,
  required,
  mode = "floating",
  labelPosition = "center",
  isIcon = false,
  labelSize = "sm",
  fullWidh = false,
}) => {
  if (mode === "placeholder") {
    return (
      <div className="relative">
        {children}
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[10px] text-[var(--ui-error)] mt-1 ml-3"
          >
            {error}
          </motion.p>
        )}
      </div>
    );
  }

  if (mode === "static") {
    return (
      <div className="relative">
        <label
          htmlFor={id}
          className={`
            block text-[12px] mb-1 text-[var(--ui-text-secondary)]
            ${error ? "text-[var(--ui-error)]" : ""}
            ${required ? "after:content-['*'] after:ml-0.5 after:text-[var(--ui-error)]" : ""}
          `}
        >
          {label}
        </label>
        {children}
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[10px] text-[var(--ui-error)] mt-1 ml-3"
          >
            {error}
          </motion.p>
        )}
      </div>
    );
  }

  const labelSizeStyles = {
    xs: "text-[10px]",
    sm: "text-[12px]",
    md: "text-sm",
    lg: "text-base",
  };

  return (
    <div className={`${fullWidh ? "w-full" : ""}`}>
      <div className="relative">
        {children}
        <label
          htmlFor={id}
          className={`
          absolute transition-all pointer-events-none
          ${isIcon ? "left-10" : "left-5"}
          ${
            isFocused || hasValue
              ? `${labelSizeStyles.xs} -top-[15px] text-[var(--ui-text-muted)]`
              : labelPosition === "top"
                ? `${labelSizeStyles[labelSize]} text-[var(--ui-text-muted)] top-3`
                : `${labelSizeStyles[labelSize]} text-[var(--ui-text-muted)] top-1/2 -translate-y-1/2`
          }
          ${error ? "!text-[var(--ui-error)]" : ""}
          ${required ? "after:content-['*'] after:ml-0.5 after:text-[var(--ui-error)]" : ""}
        `}
        >
          {label}
        </label>
      </div>
      <div>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[10px] text-[var(--ui-error)] mt-3 ml-1"
          >
            {error}
          </motion.p>
        )}
      </div>
    </div>
  );
};
