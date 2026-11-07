"use client";

import React from "react";
import { FaUser } from "react-icons/fa";
import { AvatarProps } from "./types/avatar.props";
import { shapeClasses, sizeClasses } from "./styles/avatar.styles";
import { getColorFromInitials, getContrastColor } from "./utils/color.manage";

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = "Avatar",
  bgColor,
  initials,
  size = "md",
  shape = "circle",
  showDefaultIcon = true,
  icon,
  className = "",
  onClick,
}) => {
  const sizeClass = sizeClasses[size];
  const shapeClass = shapeClasses[shape];

  if (src) {
    return (
      <div
        className={`overflow-hidden ${sizeClass} ${shapeClass} ${className}`}
        onClick={onClick}
        style={{ cursor: onClick ? "pointer" : "default" }}
      >
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      </div>
    );
  }

  const backgroundColor =
    bgColor || (initials ? getColorFromInitials(initials) : undefined);

  const textColor = backgroundColor
    ? getContrastColor(backgroundColor)
    : "currentColor";

  return (
    <div
      className={`
        ${sizeClass}
        ${shapeClass}
        flex items-center justify-center
        font-medium
        ${className}
      `}
      style={{
        backgroundColor,
        color: textColor,
        cursor: onClick ? "pointer" : "default",
      }}
      onClick={onClick}
    >
      {initials ? (
        <span style={{ color: textColor, fontSize: "1.9em", lineHeight: "1" }}>
          {initials}
        </span>
      ) : showDefaultIcon ? (
        icon || <FaUser />
      ) : null}
    </div>
  );
};
