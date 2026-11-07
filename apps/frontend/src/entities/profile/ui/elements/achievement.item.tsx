import { FiLock } from "react-icons/fi";
import { ProgressBar } from "@/shared/ui/kit";
import { getRarityColor } from "../../model/helper";
import { IAchievementUI } from "../../model";

interface IProps {
  achievement: IAchievementUI;
}

export const AchievementItem: React.FC<IProps> = ({ achievement }) => {
  const getProgressPercent = () => {
    return ((achievement.progress || 0) / (achievement.maxProgress || 0)) * 100;
  };

  const isCompleted = !achievement.isLocked && getProgressPercent() >= 100;

  return (
    <div
      className={`w-full bg-gradient-to-r ${getRarityColor(
        achievement.rarity,
        achievement.isLocked,
      )} rounded-xl p-4 border shadow-md transition-all duration-200 hover:shadow-lg`}
    >
      <div className="flex items-center gap-4">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center text-3xl bg-white/10 backdrop-blur-sm shadow-md flex-shrink-0"
          style={{ color: achievement.iconColor }}
        >
          {achievement.icon}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <h3 className="font-bold text-white text-base truncate">
              {achievement.title}
            </h3>
            {achievement.isLocked && (
              <FiLock className="text-gray-400 text-sm flex-shrink-0" />
            )}
            {isCompleted && !achievement.isLocked && (
              <div className="text-yellow-400 text-xs font-semibold bg-white/10 px-2 py-0.5 rounded-full flex-shrink-0">
                Выполнено!
              </div>
            )}
          </div>

          <p className="text-xs text-white/70 mb-3 line-clamp-2">
            {achievement.description}
          </p>

          {achievement.isLocked ? (
            <div className="space-y-1">
              <ProgressBar
                value={achievement.progress || 0}
                max={achievement.maxProgress || 0}
                size="sm"
                showValue={true}
                labelPosition="top-right"
                state={isCompleted ? "success" : "default"}
              />
              <div className="text-[10px] text-white/50 text-right">
                {achievement.progress || 0} / {achievement.maxProgress || 0}
              </div>
            </div>
          ) : (
            <div className="text-xs text-white/40 italic">Получено</div>
          )}
        </div>
      </div>
    </div>
  );
};
