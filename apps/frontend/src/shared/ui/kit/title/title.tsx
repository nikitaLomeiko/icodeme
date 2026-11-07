"use client";

import React from "react";
import { TitleProps } from "./types/title.props";
import {
  sizeStyles,
  weightStyles,
  colorStyles,
  alignStyles,
} from "./styles/title.styles";

export const Title: React.FC<TitleProps> = ({
  children,
  size = "base",
  weight = "bold",
  color = "default",
  as = "h1",
  className = "",
  align = "left",
  lineClamp,
  isError,
}) => {
  const Component = as;

  const lineClampStyles = lineClamp
    ? `line-clamp-${lineClamp} overflow-hidden text-ellipsis`
    : "";

  const finalColor = isError ? "error" : color;

  const combinedClassName = `
    ${sizeStyles[size]}
    ${weightStyles[weight]}
    ${colorStyles[finalColor]}
    ${alignStyles[align]}
    ${lineClampStyles}
    ${className}
  `.trim();

  return <Component className={combinedClassName}>{children}</Component>;
};

Title.displayName = "Title";
