"use client";

import { useCallback, useRef, useState, useEffect } from "react";
import { CarouselApi, CarouselOptions } from "../types";

export const useCarousel = (options: CarouselOptions = {}) => {
  const {
    loop = false,
    dragFree = false,
    slidesToScroll = 1,
    slidesToShow = 1,
    startIndex = 0,
    speed = 0.5,
    gap = 0,
  } = options;

  const containerRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const currentScrollRef = useRef<number>(0);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const startScrollRef = useRef(0);
  const velocityRef = useRef(0);
  const lastTimeRef = useRef(0);
  const isAnimatingRef = useRef(false);

  const [slides, setSlides] = useState<HTMLElement[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(startIndex);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [slideWidth, setSlideWidth] = useState(0);

  const getMaxScroll = useCallback(() => {
    if (!containerRef.current || !viewportRef.current) return 0;
    return Math.max(
      0,
      containerRef.current.clientWidth - viewportRef.current.clientWidth,
    );
  }, []);

  const updateButtonsState = useCallback(() => {
    if (!containerRef.current || !viewportRef.current) return;
    const maxScroll = getMaxScroll();
    const currentScroll = currentScrollRef.current;

    const newCanScrollPrev = loop ? true : currentScroll < -0.1;
    const newCanScrollNext = loop
      ? true
      : Math.abs(currentScroll) < maxScroll - 0.1;

    setCanScrollPrev(newCanScrollPrev);
    setCanScrollNext(newCanScrollNext);
  }, [loop, getMaxScroll]);

  const updateSlides = useCallback(() => {
    if (containerRef.current) {
      const slideElements = Array.from(
        containerRef.current.children,
      ) as HTMLElement[];
      setSlides(slideElements);
      return slideElements;
    }
    return [];
  }, []);

  const reInit = useCallback(() => {
    if (!containerRef.current || !viewportRef.current) return;

    const container = containerRef.current;
    const viewport = viewportRef.current;
    const slideElements = updateSlides();

    if (slideElements.length === 0) return;

    const viewportWidth = viewport.clientWidth;
    const totalGapWidth = gap * (slidesToShow - 1);
    const newSlideWidth = (viewportWidth - totalGapWidth) / slidesToShow;
    setSlideWidth(newSlideWidth);

    console.log(viewportWidth);

    slideElements.forEach((slide, idx) => {
      slide.style.flex = `0 0 ${newSlideWidth}px`;
      slide.style.minWidth = "0";
      slide.style.boxSizing = "border-box";
      if (gap > 0 && idx < slideElements.length - 1) {
        slide.style.marginRight = `${gap}px`;
      } else if (gap > 0) {
        slide.style.marginRight = "0";
      }
    });

    const totalWidth =
      slideElements.length * newSlideWidth + (slideElements.length - 1) * gap;
    container.style.width = `${totalWidth}px`;

    updateButtonsState();
  }, [updateSlides, slidesToShow, gap, updateButtonsState]);

  // Re-initialize carousel when responsive options change
  useEffect(() => {
    reInit();
  }, [slidesToShow, gap, reInit]);

  const animateTo = useCallback(
    (targetX: number, callback?: () => void) => {
      if (isAnimatingRef.current) return;
      if (animationRef.current) cancelAnimationFrame(animationRef.current);

      isAnimatingRef.current = true;
      const startX = currentScrollRef.current;
      const startTime = performance.now();
      const duration = speed * 1000;

      const animate = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(1, elapsed / duration);
        const ease = 1 - Math.pow(1 - progress, 3);

        const newX = startX + (targetX - startX) * ease;
        if (containerRef.current) {
          containerRef.current.style.transform = `translateX(${newX}px)`;
          currentScrollRef.current = newX;
        }

        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animate);
        } else {
          if (containerRef.current) {
            containerRef.current.style.transform = `translateX(${targetX}px)`;
            currentScrollRef.current = targetX;
          }
          animationRef.current = null;
          isAnimatingRef.current = false;
          updateButtonsState();
          callback?.();
        }
      };

      animationRef.current = requestAnimationFrame(animate);
    },
    [speed, updateButtonsState],
  );

  const getIndexFromScroll = useCallback(
    (scrollX: number) => {
      if (slides.length === 0 || slideWidth === 0) return 0;
      const slideTotalWidth = slideWidth + gap;
      const rawIndex = Math.round(-scrollX / slideTotalWidth);
      const maxIndex = Math.max(0, slides.length - slidesToShow);
      let index = Math.max(0, Math.min(rawIndex, maxIndex));

      if (loop && slides.length > 0) {
        if (index < 0) index = maxIndex;
        if (index > maxIndex) index = 0;
      }
      return index;
    },
    [slides.length, slidesToShow, slideWidth, gap, loop],
  );

  const scrollTo = useCallback(
    (index: number) => {
      if (slides.length === 0 || slideWidth === 0) return;
      if (isAnimatingRef.current) return;

      let targetIndex = index;
      const maxIndex = Math.max(0, slides.length - slidesToShow);

      if (loop) {
        if (targetIndex < 0) targetIndex = maxIndex;
        if (targetIndex > maxIndex) targetIndex = 0;
      } else {
        targetIndex = Math.max(0, Math.min(targetIndex, maxIndex));
      }

      const slideTotalWidth = slideWidth + gap;
      const targetX = -targetIndex * slideTotalWidth;

      animateTo(targetX, () => {
        setSelectedIndex(targetIndex);
        updateButtonsState();
      });
    },
    [
      slides.length,
      slidesToShow,
      slideWidth,
      gap,
      loop,
      animateTo,
      updateButtonsState,
    ],
  );

  const scrollPrev = useCallback(() => {
    if ((!canScrollPrev && !loop) || isAnimatingRef.current) return;
    const newIndex = selectedIndex - slidesToScroll;
    scrollTo(newIndex);
  }, [canScrollPrev, loop, selectedIndex, slidesToScroll, scrollTo]);

  const scrollNext = useCallback(() => {
    if ((!canScrollNext && !loop) || isAnimatingRef.current) return;
    const newIndex = selectedIndex + slidesToScroll;
    scrollTo(newIndex);
  }, [canScrollNext, loop, selectedIndex, slidesToScroll, scrollTo]);

  const onDragStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (isAnimatingRef.current) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      isAnimatingRef.current = false;
    }

    isDraggingRef.current = true;
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    startXRef.current = clientX;
    startScrollRef.current = currentScrollRef.current;
    velocityRef.current = 0;
    lastTimeRef.current = Date.now();

    document.body.style.userSelect = "none";
  }, []);

  const onDragMove = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (!isDraggingRef.current) return;

      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const deltaX = clientX - startXRef.current;
      let newScroll = startScrollRef.current + deltaX;

      if (!dragFree && !loop && containerRef.current && viewportRef.current) {
        const maxScroll = getMaxScroll();
        newScroll = Math.min(0, Math.max(newScroll, -maxScroll));
      }

      if (containerRef.current) {
        containerRef.current.style.transform = `translateX(${newScroll}px)`;
        currentScrollRef.current = newScroll;

        const now = Date.now();
        const timeDelta = now - lastTimeRef.current;
        if (timeDelta > 0) {
          velocityRef.current = deltaX / timeDelta;
        }
        lastTimeRef.current = now;
      }
    },
    [dragFree, loop, getMaxScroll],
  );

  const onDragEnd = useCallback(() => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    document.body.style.userSelect = "";

    if (!dragFree && viewportRef.current && containerRef.current) {
      const currentIndex = getIndexFromScroll(currentScrollRef.current);
      let targetIndex = currentIndex;

      if (Math.abs(velocityRef.current) > 0.5) {
        const deltaSlides = Math.round(velocityRef.current * 0.3);
        targetIndex = currentIndex - deltaSlides;
      }

      if (Math.abs(targetIndex - selectedIndex) > 0) {
        const direction =
          targetIndex > selectedIndex ? slidesToScroll : -slidesToScroll;
        targetIndex = selectedIndex + direction;
      }

      scrollTo(targetIndex);
    } else {
      reInit();
      updateButtonsState();
    }
  }, [
    dragFree,
    getIndexFromScroll,
    scrollTo,
    reInit,
    selectedIndex,
    slidesToScroll,
    updateButtonsState,
  ]);

  const api: CarouselApi = {
    scrollPrev,
    scrollNext,
    scrollTo,
    canScrollPrev,
    canScrollNext,
    selectedIndex,
    reInit,
  };

  return {
    containerRef,
    viewportRef,
    slides,
    selectedIndex,
    canScrollPrev,
    canScrollNext,
    slideWidth,
    onDragStart,
    onDragMove,
    onDragEnd,
    reInit,
    scrollTo,
    api,
    isAnimating: isAnimatingRef.current,
  };
};
