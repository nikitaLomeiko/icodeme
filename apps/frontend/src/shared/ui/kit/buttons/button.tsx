"use client";

import React from "react";
import { motion } from "framer-motion";
import { BaseButtonProps } from "./types/button.props";
import { baseStyles, sizeStyles, variantStyles } from "./styles/button.styles";
import { Loader } from "../loader";

export const Button: React.FC<BaseButtonProps> = ({
  variant = "primary",
  size = "md",
  isLoading = false,
  fullWidth = false,
  icon: Icon,
  iconPosition = "left",
  children,
  className = "",
  onClick,
  type = "button",
  sizeIcon,
  disabled,
  disableHoverScale = false,
}) => {
  const widthStyle = fullWidth ? "w-full" : "";

  const buttonStyles = `
    ${className}
    ${baseStyles}
    ${sizeStyles[size]}
    ${variantStyles[variant]}
    ${widthStyle}
    cursor-pointer
  `;

  const isDisabled = disabled || isLoading;
  const hoverScale = disableHoverScale ? 1 : 1.02;
  const tapScale = disableHoverScale ? 1 : 0.98;

  return (
    <motion.button
      type={type}
      className={buttonStyles}
      disabled={isDisabled}
      onClick={onClick}
      whileHover={{ scale: hoverScale }}
      whileTap={{ scale: tapScale }}
    >
      {isLoading ? (
        <div className="flex items-center justify-center gap-2">
          <Loader size="sm" />
          <span>{children || "Загрузка..."}</span>
        </div>
      ) : (
        <>
          {Icon && iconPosition === "left" && (
            <Icon
              size={
                size === "sm"
                  ? (sizeIcon ?? 14)
                  : size === "md"
                    ? (sizeIcon ?? 16)
                    : (sizeIcon ?? 18)
              }
            />
          )}
          {children}
          {Icon && iconPosition === "right" && (
            <Icon
              size={
                size === "sm"
                  ? (sizeIcon ?? 14)
                  : size === "md"
                    ? (sizeIcon ?? 16)
                    : (sizeIcon ?? 18)
              }
            />
          )}
        </>
      )}
    </motion.button>
  );
};

Button.displayName = "Button";
