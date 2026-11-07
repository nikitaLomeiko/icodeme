import { ReactNode } from "react";
import { ModalVariant } from "../types";

export const ModalFooter: React.FC<{
  children: ReactNode;
  className?: string;
  variant?: ModalVariant;
}> = ({ children, className, variant }) => {
  const isTransparent = variant === "transparent";
  const isNone = variant === "none";
  const showFooterBorder = !isTransparent && !isNone;

  return (
    <div
      className={`
        flex items-center justify-end gap-3
        px-6 py-4
        ${showFooterBorder ? "border-t border-[var(--ui-border)]" : ""}
        ${className || ""}
      `}
    >
      {children}
    </div>
  );
};
