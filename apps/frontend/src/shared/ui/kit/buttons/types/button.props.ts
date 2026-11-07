import { ButtonSize, ButtonVariant } from "./button.types";

export interface BaseButtonProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "children"
> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  fullWidth?: boolean;
  icon?: React.ElementType;
  iconPosition?: "left" | "right";
  children?: React.ReactNode;
  sizeIcon?: number;
  /** Отключить анимацию масштабирования при наведении */
  disableHoverScale?: boolean;
}
