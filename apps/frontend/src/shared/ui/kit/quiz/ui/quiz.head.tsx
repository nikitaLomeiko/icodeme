import { useCallback } from "react";
import { processedCount, progressPercent } from "../libs/utils/progress";
import { finishQuiz, useQuiz } from "../store";

interface IProps {
  title: string;
  count: number;
}

export const QuizHead: React.FC<IProps> = (props) => {
  const { count, title } = props;

  const { state, dispatch } = useQuiz();

  const finish = useCallback(() => {
    dispatch(finishQuiz());
  }, [dispatch]);

  return (
    <div className="mb-4 sm:mb-6">
      <div className="flex items-center justify-between gap-4 mb-3">
        <p className="text-sm font-semibold text-[var(--ui-text-secondary)] truncate">
          {title}
        </p>
        {state.quiz?.settings.isNavigate && (
          <button
            type="button"
            onClick={finish}
            className="
                              shrink-0 text-xs font-semibold text-[var(--ui-error)]
                              hover:text-[var(--ui-error-hover)] hover:bg-[var(--ui-error)]/10
                              px-3 py-1.5 rounded-lg transition-colors cursor-pointer
                            "
          >
            Завершить тест
          </button>
        )}
      </div>
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 rounded-full bg-[var(--ui-fill)] overflow-hidden">
          <div
            className="h-full rounded-full bg-[var(--ui-primary)] transition-all duration-500"
            style={{
              width: `${progressPercent(state, state.quiz || undefined)}%`,
            }}
          />
        </div>
        <span className="text-xs font-semibold text-[var(--ui-text-muted)] whitespace-nowrap">
          {processedCount(state)} из {count}
        </span>
      </div>
    </div>
  );
};
