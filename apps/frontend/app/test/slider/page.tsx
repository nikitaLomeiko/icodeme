"use client";

import { Carousel, CarouselApi } from "@/shared/ui/kit/carousel";
import { useRef, useState, useEffect } from "react";

export default function SliderTestPage() {
  const carouselRef = useRef<CarouselApi>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  // Обновляем состояние через интервал
  useEffect(() => {
    const interval = setInterval(() => {
      if (carouselRef.current) {
        setSelectedIndex(carouselRef.current.selectedIndex);
        setCanScrollPrev(carouselRef.current.canScrollPrev);
        setCanScrollNext(carouselRef.current.canScrollNext);
      }
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="flex gap-3 mb-4">
        <button
          onClick={() => carouselRef.current?.scrollPrev()}
          disabled={!canScrollPrev}
          className="bg-black text-white px-4 py-2 rounded disabled:opacity-30"
        >
          Назад
        </button>
        <button
          onClick={() => carouselRef.current?.scrollNext()}
          disabled={!canScrollNext}
          className="bg-black text-white px-4 py-2 rounded disabled:opacity-30"
        >
          Вперед
        </button>
        <button
          onClick={() => carouselRef.current?.scrollTo(2)}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          На 3 слайд
        </button>
      </div>

      <Carousel
        ref={carouselRef}
        options={{ startIndex: 1, slidesToScroll: 1, loop: true, speed: 0.3 }}
      >
        <div className="h-64 bg-orange-500 flex items-center justify-center text-white text-2xl rounded-lg">
          Слайд 1
        </div>
        <div className="h-64 bg-orange-600 flex items-center justify-center text-white text-2xl rounded-lg">
          Слайд 2
        </div>
        <div className="h-64 bg-orange-700 flex items-center justify-center text-white text-2xl rounded-lg">
          Слайд 3
        </div>
        <div className="h-64 bg-orange-800 flex items-center justify-center text-white text-2xl rounded-lg">
          Слайд 4
        </div>
      </Carousel>

      <p className="mt-4">Текущий индекс: {selectedIndex + 1}</p>
    </div>
  );
}
