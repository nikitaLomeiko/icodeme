export interface AvatarProps {
  src?: string;
  alt?: string;
  bgColor?: string;
  initials?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";
  shape?: "circle" | "square" | "rounded";
  showDefaultIcon?: boolean;
  icon?: React.ReactNode;
  className?: string;
  onClick?: () => void;
}
