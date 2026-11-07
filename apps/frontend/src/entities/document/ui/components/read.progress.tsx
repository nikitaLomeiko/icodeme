import { useEffect, useState } from "react";
import { documentOptionStore } from "../../model";
import { ProgressBar } from "@/shared/ui/kit";

export const ReadProgrss = () => {
  const [scrollProgress, setScrollProgress] = useState(0);

  const { contentRef, content } = documentOptionStore;

  useEffect(() => {
    const updateScrollProgress = () => {
      if (!contentRef.current) return;

      const contentElement = contentRef.current;

      const contentRect = contentElement.getBoundingClientRect();
      const contentTop = contentRect.top + window.scrollY;
      const contentBottom = contentTop + contentElement.scrollHeight;
      const currentScroll = window.scrollY;
      const viewportHeight = window.innerHeight;
      const startPoint = contentTop - 80;
      const endPoint = contentBottom - viewportHeight;

      let progress = 0;

      if (currentScroll <= startPoint) {
        progress = 0;
      } else if (currentScroll >= endPoint) {
        progress = 100;
      } else {
        progress =
          ((currentScroll - startPoint) / (endPoint - startPoint)) * 100;
      }

      setScrollProgress(Math.min(Math.max(progress, 0), 100));
    };

    window.addEventListener("scroll", updateScrollProgress, { passive: true });
    window.addEventListener("resize", updateScrollProgress);
    setTimeout(updateScrollProgress, 100);

    return () => {
      window.removeEventListener("scroll", updateScrollProgress);
      window.removeEventListener("resize", updateScrollProgress);
    };
  }, [content]);

  return (
    <div className="sticky top-0 z-10 bg-[var(--ui-background-secondary)] border-b border-[var(--ui-border)] backdrop-blur-sm -mt-6 -mx-4 px-6 pt-6 pb-4">
      <div className="flex items-center justify-between gap-4 mb-3">
        <span className="text-sm text-[var(--ui-text)]">Прогресс чтения</span>
        <span className="text-sm font-medium">
          {Math.round(scrollProgress)}%
        </span>
      </div>
      <ProgressBar
        value={scrollProgress}
        max={100}
        size="xs"
        variant="default"
        state="default"
        showValue={false}
        trackVariant="solid"
        className="w-full"
      />
    </div>
  );
};
