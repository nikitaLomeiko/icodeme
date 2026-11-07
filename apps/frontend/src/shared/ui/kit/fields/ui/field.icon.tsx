import React from "react";

interface FieldIconProps {
  icon: React.ElementType;
  position?: "left" | "right";
  size?: number;
  className?: string;
  isTextarea?: boolean;
}

export const FieldIcon: React.FC<FieldIconProps> = ({
  icon: Icon,
  position = "left",
  size = 16,
  className = "",
  isTextarea = false,
}) => {
  const positionClasses = {
    left: "left-3",
    right: "right-3",
  };

  const verticalPosition = isTextarea ? "top-4" : "top-1/2 -translate-y-1/2";

  return (
    <div
      className={`absolute ${positionClasses[position]} ${verticalPosition} text-gray-400 z-10 ${className}`}
    >
      <Icon size={size} />
    </div>
  );
};
