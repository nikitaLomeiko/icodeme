import { ReactNode } from "react";

export type CardVariant =
  | "default"
  | "elevated"
  | "bordered"
  | "ghost"
  | "gradient";
export type CardPadding = "none" | "sm" | "md" | "lg";
export type CardRadius = "none" | "sm" | "md" | "lg" | "xl" | "full";

export interface CardProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  variant?: CardVariant;
  padding?: CardPadding;
  radius?: CardRadius;
  withHeader?: boolean;
  withFooter?: boolean;
  headerAction?: ReactNode;
  footer?: ReactNode;
  hoverable?: boolean;
  clickable?: boolean;
  onClick?: () => void;
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
  footerClassName?: string;
  loading?: boolean;
  disabled?: boolean;
}
