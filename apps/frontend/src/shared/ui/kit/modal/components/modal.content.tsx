import { ReactNode } from "react";
import { contentVariantStyles, sizeStyles } from "../styles";
import { ModalSize, ModalVariant } from "../types";

interface IProps {
  size: ModalSize;
  variant: ModalVariant;
  children: ReactNode;
  className?: string;
}

export const ModalContent: React.FC<IProps> = (props) => {
  const { size, variant, children, className } = props;

  return (
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
};
