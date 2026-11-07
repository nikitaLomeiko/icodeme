import { ReactNode } from "react";

export type CarouselOptions = {
  loop?: boolean;
  dragFree?: boolean;
  slidesToScroll?: number;
  slidesToShow?: number;
  startIndex?: number;
  speed?: number;
  gap?: number;
};

export type CarouselApi = {
  scrollPrev: () => void;
  scrollNext: () => void;
  scrollTo: (index: number) => void;
  canScrollPrev: boolean;
  canScrollNext: boolean;
  selectedIndex: number;
  reInit: () => void;
};

export type CarouselProps = {
  children: ReactNode;
  options?: CarouselOptions;
  className?: string;
  onApiInit?: (api: CarouselApi) => void;
  renderArrows?: (props: {
    prevDisabled: boolean;
    nextDisabled: boolean;
    onPrev: () => void;
    onNext: () => void;
  }) => ReactNode;
  renderDots?: (props: {
    total: number;
    selectedIndex: number;
    onSelect: (index: number) => void;
  }) => ReactNode;
  containerClassName?: string;
  viewportClassName?: string;
  slideClassName?: string;
  showArrows?: boolean;
  showDots?: boolean;
  wheelSensitivity?: number;
  enableWheelScroll?: boolean;
};
