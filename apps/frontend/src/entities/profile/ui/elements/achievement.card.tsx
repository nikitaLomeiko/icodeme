import { FiLock } from "react-icons/fi";
import { IAchievementUI } from "../../model";
import { getRarityColor } from "../../model/helper";

interface IProps {
  achievement: IAchievementUI;
}

export const AchievementCard: React.FC<IProps> = ({ achievement }) => {
  return (
    <div
      className={`relative bg-gradient-to-br ${getRarityColor(
        achievement.rarity,
        achievement.isLocked,
      )} h-40 sm:h-56 rounded-xl p-2 sm:p-5 border shadow-lg transition-all duration-200 hover:shadow-xl mx-1 sm:mx-2`}
    >
      {achievement.isLocked && (
        <div className="absolute top-1 right-1 sm:top-3 sm:right-3 z-10">
          <FiLock className="text-gray-400 text-[10px] sm:text-sm" />
        </div>
      )}
      <div className="flex flex-col items-center text-center gap-1 sm:gap-3 h-full justify-center">
        <div
          className="w-12 h-12 sm:w-24 sm:h-24 rounded-full flex items-center justify-center text-2xl sm:text-5xl bg-white/10 backdrop-blur-sm shadow-md flex-shrink-0"
          style={{ color: achievement.iconColor }}
        >
          {achievement.icon}
        </div>
        <div className="w-full">
          <div className="font-bold text-white text-xs sm:text-base leading-tight px-1">
            {achievement.title}
          </div>
          <div className="text-[10px] sm:text-xs text-white/70 mt-0.5 sm:mt-1 leading-relaxed hidden sm:block">
            {achievement.description}
          </div>
          <div className="text-[8px] text-white/60 mt-0.5 leading-tight block sm:hidden line-clamp-1">
            {achievement.description}
          </div>
        </div>
      </div>
    </div>
  );
};
