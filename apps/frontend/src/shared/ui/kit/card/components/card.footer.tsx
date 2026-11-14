import { ReactNode } from "react";

interface IProps {
  children: ReactNode;
  className?: string;
}

export const CardFooter: React.FC<IProps> = ({ children, className }) => {
  if (!children) return null;

  return (
    <div
      className={`
        border-t border-[var(--ui-border)]
        pt-4 mt-4
        ${className || ""}
      `}
    >
      {children}
    </div>
  );
};
