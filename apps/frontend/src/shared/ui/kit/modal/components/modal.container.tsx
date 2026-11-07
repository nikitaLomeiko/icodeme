import { ReactNode } from "react";
import {
  animationContent,
  animationContentHidden,
  animationContentVisible,
  positionStyles,
} from "../styles";
import { ModalPosition } from "../types";

const getPositionAnimation = (isVisible: boolean, position: ModalPosition) => {
  if (!isVisible) {
    switch (position) {
      case "top":
      case "top-left":
      case "top-right":
        return "-translate-y-8 opacity-0";
      case "bottom":
      case "bottom-left":
      case "bottom-right":
        return "translate-y-8 opacity-0";
      case "left":
        return "-translate-x-8 opacity-0";
      case "right":
        return "translate-x-8 opacity-0";
      default:
        return "scale-95 opacity-0";
    }
  }
  return "translate-y-0 translate-x-0 scale-100 opacity-100";
};

export const ModalContainer: React.FC<{
  position: ModalPosition;
  isVisible: boolean;
  children: ReactNode;
  className?: string;
  zIndex?: number;
}> = ({ position, isVisible, children, className, zIndex = 50 }) => (
  <div
    className={`
      fixed inset-0 z-90
      flex ${positionStyles[position]}
      pointer-events-none
      ${className || ""}
    `}
  >
    <div
      className={`
        w-full
        pointer-events-auto
        transition-all duration-300 ease-out
        ${getPositionAnimation(isVisible, position)}
    `}
    >
      {children}
    </div>
  </div>
);
