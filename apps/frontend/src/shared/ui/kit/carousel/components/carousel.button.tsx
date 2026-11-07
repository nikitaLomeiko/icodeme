import React from "react";
import { useCarouselContext } from "../hooks";

interface CarouselButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  direction: "prev" | "next";
  children?: React.ReactNode;
}

export const CarouselButton: React.FC<CarouselButtonProps> = ({
  direction,
  children,
  className = "",
  ...props
}) => {
  const { api } = useCarouselContext();

  const isPrevDisabled = direction === "prev" && !api?.canScrollPrev;
  const isNextDisabled = direction === "next" && !api?.canScrollNext;

  const handleClick = () => {
    if (direction === "prev") {
      api?.scrollPrev();
    } else {
      api?.scrollNext();
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isPrevDisabled || isNextDisabled}
      className={`p-2 rounded-full bg-white/80 hover:bg-white shadow-lg disabled:opacity-30 transition-all ${className}`}
      {...props}
    >
      {children || (direction === "prev" ? "←" : "→")}
    </button>
  );
};

CarouselButton.displayName = "CarouselButton";
