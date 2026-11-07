import { ReactNode } from "react";

export type ModalVariant = "dark" | "blur" | "transparent" | "none";
export type ModalSize = "xs" | "sm" | "md" | "lg" | "xl" | "full";
export type ModalPosition =
  | "center"
  | "top"
  | "top-left"
  | "top-right"
  | "bottom"
  | "bottom-left"
  | "bottom-right"
  | "left"
  | "right";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  variant?: ModalVariant;
  size?: ModalSize;
  position?: ModalPosition;
  closeOnOverlayClick?: boolean;
  closeOnEsc?: boolean;
  showCloseButton?: boolean;
  className?: string;
  overlayClassName?: string;
  contentClassName?: string;
  withAnimation?: boolean;
  blurBackground?: boolean;
  zIndex?: number;
}
