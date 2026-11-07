"use client";

import { createContext, useContext } from "react";
import { CarouselApi } from "../types";

type CarouselContextType = {
  api: CarouselApi | null;
  slidesCount: number;
  slidesToShow: number;
  gap: number;
};

export const CarouselContext = createContext<CarouselContextType | null>(null);

export const useCarouselContext = () => {
  const context = useContext(CarouselContext);
  if (!context) {
    throw new Error("Carousel components must be used within Carousel");
  }
  return context;
};
