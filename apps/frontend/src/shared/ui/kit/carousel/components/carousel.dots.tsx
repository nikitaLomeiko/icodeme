import React from "react";
import { useCarouselContext } from "../hooks";

interface CarouselDotsProps {
  className?: string;
  dotClassName?: string;
  activeDotClassName?: string;
}

export const CarouselDots: React.FC<CarouselDotsProps> = ({
  className = "",
  dotClassName = "w-2 h-2 rounded-full bg-white/50",
  activeDotClassName = "bg-white w-4",
}) => {
  const { api, slidesToShow, slidesCount } = useCarouselContext();
  const totalDots = Math.max(1, slidesCount - slidesToShow + 1);
  const selectedIndex = api?.selectedIndex || 0;

  return (
    <div className={`flex justify-center gap-2 ${className}`}>
      {Array.from({ length: totalDots }).map((_, idx) => (
        <button
          key={idx}
          onClick={() => api?.scrollTo(idx)}
          className={`transition-all ${
            idx === selectedIndex ? activeDotClassName : dotClassName
          }`}
        />
      ))}
    </div>
  );
};

CarouselDots.displayName = "CarouselDots";
