import { ReactNode } from "react";

interface IProps {
  children: ReactNode;
  className?: string;
}

export const ModalBody: React.FC<IProps> = ({ children, className }) => (
  <div className={`px-6 py-4 ${className || ""}`}>{children}</div>
);
