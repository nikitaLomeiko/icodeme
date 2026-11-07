import { ProgressBar } from "@/shared/ui/kit";
import { FiTrendingUp } from "react-icons/fi";

interface IProps {
  experience: number;
}

export const LevelBar: React.FC<IProps> = ({ experience }) => {
  const expForNextLevel = 100;
  const currentLevelExp = experience % 100;
  const levelProgress = (currentLevelExp / expForNextLevel) * 100;

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-3 sm:mb-4">
        <FiTrendingUp className="text-[var(--ui-primary)] text-sm sm:text-base" />
        <span className="text-sm sm:text-base font-bold text-[var(--ui-text)]">
          Прогресс до следующего уровня
        </span>
      </div>
      <ProgressBar
        size="md"
        value={levelProgress}
        labelPosition="inside-left"
        showValue={true}
        className="[&>div>div]:bg-gradient-to-r [&>div>div]:from-[var(--ui-primary)] [&>div>div]:to-[var(--ui-primary-hover)]"
      />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mt-2 sm:mt-1 pt-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-[var(--ui-primary)] rounded-full" />
          <div className="text-sm font-medium text-[var(--ui-text-secondary)]">
            Всего опыта:{" "}
            <span className="font-semibold text-[var(--ui-text)]">
              {experience} XP
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-[var(--ui-primary-hover)] rounded-full" />
          <div className="text-sm font-medium text-[var(--ui-text-secondary)]">
            До следующего уровня:{" "}
            <span className="font-semibold text-[var(--ui-primary)]">
              {expForNextLevel - currentLevelExp} XP
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
