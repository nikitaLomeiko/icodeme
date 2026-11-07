"use client";

import { forwardRef, useEffect, Children, useCallback, useRef } from "react";
import { useCarousel, CarouselContext } from "./hooks";
import { CarouselProps, CarouselApi } from "./types";

export const Carousel = forwardRef<CarouselApi, CarouselProps>(
  (
    {
      children,
      options = {},
      className = "",
      onApiInit,
      renderArrows,
      renderDots,
      containerClassName = "",
      viewportClassName = "",
      slideClassName = "",
      showArrows = false,
      showDots = false,
      enableWheelScroll = true,
    },
    ref,
  ) => {
    const {
      containerRef,
      viewportRef,
      selectedIndex,
      canScrollPrev,
      canScrollNext,
      onDragStart,
      onDragMove,
      onDragEnd,
      reInit,
      scrollTo,
      api,
      isAnimating,
    } = useCarousel(options);

    // ref sync (без лишнего if внутри render)
    useEffect(() => {
      if (!ref) return;

      if (typeof ref === "function") {
        ref(api);
      } else {
        ref.current = api;
      }
    }, [api, ref]);

    useEffect(() => {
      onApiInit?.(api);
    }, [onApiInit, api]);

    /**
     * 🔥 FIXED INIT (главное исправление)
     * - убрали setTimeout
     * - ждём реальный layout через 2 rAF
     */
    useEffect(() => {
      if (!viewportRef.current || !containerRef.current) return;

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const width = viewportRef.current?.getBoundingClientRect().width;

          // защита от мусорного layout (типа 27px)
          if (!width || width < 50) return;

          reInit();
          scrollTo(options.startIndex || 0);
        });
      });
    }, [reInit, scrollTo, options.startIndex]);

    /**
     * resize
     */
    useEffect(() => {
      const handleResize = () => reInit();

      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }, [reInit]);

    /**
     * children change
     */
    useEffect(() => {
      if (!containerRef.current) return;
      reInit();
    }, [children, reInit]);

    const handleWheel = useCallback(
      (e: WheelEvent) => {
        if (!enableWheelScroll) return;
        if (isAnimating) return;

        const target = e.target as HTMLElement;
        if (!viewportRef.current?.contains(target)) return;

        e.preventDefault();

        const delta =
          Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;

        if (delta > 0) {
          if (canScrollNext) api.scrollNext();
        } else {
          if (canScrollPrev) api.scrollPrev();
        }
      },
      [
        enableWheelScroll,
        isAnimating,
        viewportRef,
        canScrollNext,
        canScrollPrev,
        api,
      ],
    );

    useEffect(() => {
      const viewport = viewportRef.current;
      if (!viewport || !enableWheelScroll) return;

      viewport.addEventListener("wheel", handleWheel, { passive: false });

      return () => {
        viewport.removeEventListener("wheel", handleWheel);
      };
    }, [enableWheelScroll, handleWheel]);

    const totalSlides = Children.count(children);
    const { loop = false } = options;

    return (
      <CarouselContext.Provider
        value={{
          api,
          slidesCount: totalSlides,
          slidesToShow: options.slidesToShow || 1,
          gap: options.gap || 0,
        }}
      >
        <div className={`relative ${className}`}>
          {/* VIEWPORT */}
          <div
            ref={viewportRef}
            className={`overflow-hidden min-w-0 w-full cursor-grab active:cursor-grabbing ${viewportClassName}`}
            onMouseDown={onDragStart}
            onMouseMove={onDragMove}
            onMouseUp={onDragEnd}
            onMouseLeave={onDragEnd}
            onTouchStart={onDragStart}
            onTouchMove={onDragMove}
            onTouchEnd={onDragEnd}
          >
            <div
              ref={containerRef}
              className={`flex will-change-transform ${containerClassName}`}
              style={{
                transition: "none",
                boxSizing: "border-box",
              }}
            >
              {Children.map(children, (child, index) => (
                <div key={index} className={`shrink-0 ${slideClassName}`}>
                  {child}
                </div>
              ))}
            </div>
          </div>

          {/* ARROWS */}
          {showArrows && (
            <div className="absolute inset-0 pointer-events-none">
              {renderArrows ? (
                renderArrows({
                  prevDisabled: !canScrollPrev && !loop,
                  nextDisabled: !canScrollNext && !loop,
                  onPrev: api.scrollPrev,
                  onNext: api.scrollNext,
                })
              ) : (
                <div className="absolute inset-0 pointer-events-none">
                  <button
                    onClick={api.scrollPrev}
                    disabled={!canScrollPrev && !loop}
                    className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-auto bg-white/80 hover:bg-white rounded-full p-2 shadow-lg disabled:opacity-30"
                  >
                    ←
                  </button>
                  <button
                    onClick={api.scrollNext}
                    disabled={!canScrollNext && !loop}
                    className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-auto bg-white/80 hover:bg-white rounded-full p-2 shadow-lg disabled:opacity-30"
                  >
                    →
                  </button>
                </div>
              )}
            </div>
          )}

          {/* DOTS */}
          {showDots && (
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
              {renderDots ? (
                renderDots({
                  total: totalSlides,
                  selectedIndex,
                  onSelect: scrollTo,
                })
              ) : (
                <div className="flex gap-2 bg-black/50 px-3 py-2 rounded-full">
                  {Array.from({
                    length: Math.max(
                      1,
                      totalSlides - (options.slidesToShow || 1) + 1,
                    ),
                  }).map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => scrollTo(idx)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        idx === selectedIndex ? "bg-white w-4" : "bg-white/50"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </CarouselContext.Provider>
    );
  },
);

Carousel.displayName = "Carousel";
