import { FaTrophy } from "react-icons/fa";
import { FiGlobe } from "react-icons/fi";

interface IProps {
  totalUser: number;
  globalRank: number;
}

export const Rating: React.FC<IProps> = (props) => {
  const { totalUser, globalRank } = props;

  return (
    <div className="relative overflow-hidden p-3 sm:p-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-lg border border-yellow-500/20 min-w-[180px] sm:min-w-[200px]">
      <div className="absolute top-0 right-0 text-3xl sm:text-4xl opacity-10">
        <FaTrophy />
      </div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <FiGlobe className="text-yellow-500 text-sm sm:text-base" />
          <span className="text-sm font-semibold text-[var(--ui-text-secondary)]">
            Мировой рейтинг
          </span>
        </div>
        <div className="text-xl sm:text-2xl font-bold text-yellow-500">
          #{globalRank}
        </div>
      </div>
        <div className="text-sm font-medium text-[var(--ui-text-secondary)]">
        из {totalUser.toLocaleString()} пользователей
      </div>
    </div>
  );
};
