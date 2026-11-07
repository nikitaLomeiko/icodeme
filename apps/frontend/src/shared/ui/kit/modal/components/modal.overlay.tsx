import { MouseEvent } from "react";
import {
  animationOverlay,
  animationOverlayHidden,
  animationOverlayVisible,
  overlayVariantStyles,
} from "../styles";
import { ModalVariant } from "../types";

export const ModalOverlay: React.FC<{
  variant: ModalVariant;
  isVisible: boolean;
  onClose: () => void;
  closeOnOverlayClick: boolean;
  blurBackground?: boolean;
  className?: string;
  zIndex?: number;
}> = ({
  variant,
  isVisible,
  onClose,
  closeOnOverlayClick,
  blurBackground = false,
  className,
  zIndex = 50,
}) => {
  const handleClick = (e: MouseEvent<HTMLDivElement>) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`
        fixed inset-0 z-${zIndex}
        ${overlayVariantStyles[variant]}
        ${blurBackground ? "backdrop-blur-md" : ""}
        transition-all duration-300 ease-out
        ${isVisible ? "opacity-100" : "opacity-0 pointer-events-none"}
        ${className || ""}
    `}
    />
  );
};
