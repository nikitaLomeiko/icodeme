import { AchievementCard, IAchievementUI } from "@/entities/profile";
import { Button, Card, Carousel, CarouselApi } from "@/shared/ui/kit";
import { useRef, useEffect, useState } from "react";

interface IProps {
  achievements: IAchievementUI[];
  onAllAchievementsLink: () => void;
}

export const AchievementCarousel: React.FC<IProps> = (props) => {
  const { achievements, onAllAchievementsLink } = props;
  const carouselRef = useRef<CarouselApi>(null);
  const [slidesToShow, setSlidesToShow] = useState(4);

  useEffect(() => {
    const updateSlidesToShow = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setSlidesToShow(2);
      } else if (width < 1024) {
        setSlidesToShow(2);
      } else {
        setSlidesToShow(3);
      }
    };

    updateSlidesToShow();
    window.addEventListener("resize", updateSlidesToShow);
    return () => window.removeEventListener("resize", updateSlidesToShow);
  }, []);

  return (
    <Card
      title="Достижения"
      headerAction={
        <Button
          variant="outline"
          size="sm"
          className="mt-2"
          onClick={onAllAchievementsLink}
        >
          Все достижения
        </Button>
      }
    >
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2">
          <button
            onClick={() => carouselRef.current?.scrollPrev()}
            className="bg-[var(--ui-background)] text-[var(--ui-text)] hover:bg-[var(--ui-primary)] hover:text-white w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center transition-all text-sm"
          >
            ←
          </button>
          <button
            onClick={() => carouselRef.current?.scrollNext()}
            className="bg-[var(--ui-background)] text-[var(--ui-text)] hover:bg-[var(--ui-primary)] hover:text-white w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center transition-all text-sm"
          >
            →
          </button>
        </div>
      </div>

      <Carousel
        ref={carouselRef}
        options={{
          slidesToShow: slidesToShow,
          slidesToScroll: slidesToShow,
          gap: 4,
          speed: 0.4,
        }}
      >
        {achievements.map((achievement) => (
          <AchievementCard key={achievement.id} achievement={achievement} />
        ))}
      </Carousel>
    </Card>
  );
};
