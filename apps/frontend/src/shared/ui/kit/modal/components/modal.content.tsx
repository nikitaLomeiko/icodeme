import { ReactNode } from "react";
import { contentVariantStyles, sizeStyles } from "../styles";
import { ModalSize, ModalVariant } from "../types";

export const ModalContent: React.FC<{
  size: ModalSize;
  variant: ModalVariant;
  children: ReactNode;
  className?: string;
}> = ({ size, variant, children, className }) => (
  <div
    className={`
      relative
      mx-auto my-0
      w-full ${sizeStyles[size]}
      rounded-xl
      shadow-2xl
      ${contentVariantStyles[variant]}
      ${className || ""}
    `}
  >
    {children}
  </div>
);
