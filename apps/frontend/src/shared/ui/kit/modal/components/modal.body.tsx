import { ReactNode } from "react";

export const ModalBody: React.FC<{
  children: ReactNode;
  className?: string;
}> = ({ children, className }) => (
  <div className={`px-6 py-4 ${className || ""}`}>{children}</div>
);
