import type { ComponentPropsWithoutRef, ForwardedRef } from "react";
import { forwardRef } from "react";
import { sizeMap } from "./styles/loader.style";

export interface LoaderProps extends ComponentPropsWithoutRef<"div"> {
  size?: "sm" | "md" | "lg";
  color?: string;
}

const LoaderComponent = (
  { size = "md", color, className = "", style, ...rest }: LoaderProps,
  ref: ForwardedRef<HTMLDivElement>,
) => {
  const sizeClasses = sizeMap[size];
  const borderColor = color ?? "var(--ui-primary)";

  return (
    <div
      ref={ref}
      className={`flex items-center justify-center ${sizeClasses} rounded-full border-solid border-[var(--ui-border)] border-t-[${borderColor}] animate-spin ${className}`}
      style={{
        borderTopColor: borderColor,
        ...style,
      }}
      role="status"
      aria-label="loading"
      {...rest}
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export const Loader = forwardRef(LoaderComponent);
