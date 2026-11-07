import { ReactNode } from "react";

export const CardFooter: React.FC<{
  children: ReactNode;
  className?: string;
}> = ({ children, className }) => {
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
