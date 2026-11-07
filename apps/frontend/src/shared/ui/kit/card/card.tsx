"use client";

import React from "react";
import { CardProps } from "./types/card.types";
import {
  hoverStyles,
  paddingStyles,
  radiusStyles,
  variantStyles,
} from "./styles";
import { CardSkeleton } from "./components/card.skeleton";
import { CardFooter, CardHeader } from "./components";

export const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  variant = "default",
  padding = "md",
  radius = "md",
  withHeader = true,
  withFooter = false,
  headerAction,
  footer,
  hoverable = false,
  clickable = false,
  onClick,
  className = "",
  headerClassName = "",
  bodyClassName = "",
  footerClassName = "",
  loading = false,
  disabled = false,
}) => {
  const isClickable = clickable && onClick;
  const showHeader = withHeader && (title || subtitle || headerAction);
  const showFooter = withFooter && footer;

  const cardClasses = `
    ${variantStyles[variant]}
    ${radiusStyles[radius]}
    ${hoverable ? hoverStyles[variant] : ""}
    ${isClickable ? "cursor-pointer active:scale-[0.99]" : ""}
    ${disabled ? "opacity-50 pointer-events-none" : ""}
    w-full
    ${className}
  `;

  const handleClick = () => {
    if (!disabled && isClickable && onClick) {
      onClick();
    }
  };

  if (loading) {
    return (
      <div className={cardClasses}>
        <CardSkeleton padding={padding} />
      </div>
    );
  }

  return (
    <div className={cardClasses} onClick={handleClick}>
      {showHeader && (
        <CardHeader
          title={title}
          subtitle={subtitle}
          action={headerAction}
          className={headerClassName}
        />
      )}
      <div className={`${paddingStyles[padding]} ${bodyClassName}`}>
        {children}
      </div>
      {showFooter && (
        <CardFooter className={footerClassName}>{footer}</CardFooter>
      )}
    </div>
  );
};
