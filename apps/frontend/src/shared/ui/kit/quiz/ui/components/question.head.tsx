import { FaList, FaPencilAlt, FaStar } from "react-icons/fa";
import { TimerRing } from "./timer.ring";
import { pointsLabel } from "../../libs/utils";
import { QuestionType } from "../../types";

interface IProps {
  points?: number;
  type: QuestionType;
  currentIndex: number;
  total: number;
  isMultiple: boolean;
  timeLimit: number;
  timeLeft: number;
}

export const QuestionHead: React.FC<IProps> = (props) => {
  const { currentIndex, points, total, type, isMultiple, timeLeft, timeLimit } =
    props;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 bg-[var(--ui-primary)]/10 text-[var(--ui-primary)]">
          Вопрос {currentIndex + 1} / {total}
        </span>
        {points !== undefined && (
          <span className="px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 bg-[var(--ui-warning)]/10 text-[var(--ui-warning)]">
            <FaStar size={10} />
            {points} {pointsLabel(points)}
          </span>
        )}
        {(type === "text" || type === "fields") && (
          <span className="px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 bg-[var(--ui-info)]/10 text-[var(--ui-info)]">
            <FaPencilAlt size={10} />
            Открытый ответ
          </span>
        )}
        {isMultiple && (
          <span className="px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 bg-[var(--ui-secondary)]/15 text-[var(--ui-secondary)]">
            <FaList size={10} />
            Несколько ответов
          </span>
        )}
      </div>

      {timeLimit && timeLeft !== null && (
        <TimerRing timeLeft={timeLeft} total={timeLimit} />
      )}
    </div>
  );
};
