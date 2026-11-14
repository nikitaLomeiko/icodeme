"use client";

import type { ComponentPropsWithoutRef } from "react";
import { useRouter } from "next/navigation";
import { FaArrowLeft } from "react-icons/fa";

interface IProps extends ComponentPropsWithoutRef<"button"> {}

export const BackButton: React.FC<IProps> = (props) => {
  const {
    className = "",
    onClick,
    children,
    type = "button",
    "aria-label": ariaLabel = "Назад",
    ...buttonProps
  } = props;
  const router = useRouter();

  return (
    <button
      {...buttonProps}
      type={type}
      aria-label={ariaLabel}
      onClick={onClick ?? (() => router.back())}
      className={`inline-flex items-center gap-2 rounded-lg p-2 text-[var(--ui-text-muted)] transition-colors hover:bg-[var(--ui-background-tertiary)] hover:text-[var(--ui-text)] ${className}`}
    >
      <FaArrowLeft aria-hidden="true" />
      {children}
    </button>
  );
};
