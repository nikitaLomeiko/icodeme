import { FaArrowLeft, FaHourglass } from "react-icons/fa";
import {
  goNextQuestion,
  goPrevQuestion,
  skipQuestion,
  useQuiz,
} from "../../store";
import { useCallback } from "react";

interface IProps {
  isNavigate: boolean;
  currentIndex: number;
  total: number;
}

export const QuestionFooter: React.FC<IProps> = (props) => {
  const { currentIndex, isNavigate, total } = props;

  const isLast = currentIndex === total - 1;

  const { dispatch } = useQuiz();

  const handleSubmit = () => {
    dispatch(goNextQuestion());
  };

  const skip = useCallback(() => {
    dispatch(skipQuestion());
  }, [dispatch]);

  const goPrev = useCallback(() => {
    dispatch(goPrevQuestion());
  }, [dispatch]);

  return (
    <div className="mt-6 pt-5 border-t border-[var(--ui-border)] flex items-center justify-between gap-3 flex-wrap">
      <div className="flex items-center gap-2 mt-6">
        {isNavigate && (
          <button
            type="button"
            onClick={goPrev}
            disabled={currentIndex === 0}
            className="
                          inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg
                          border-2 border-[var(--ui-primary)] text-[var(--ui-primary)]
                          hover:bg-[var(--ui-primary)] hover:text-[var(--ui-text-inverse)]
                          transition-all duration-200 cursor-pointer
                          disabled:opacity-40 disabled:pointer-events-none
                        "
          >
            <FaArrowLeft size={13} />
            Назад
          </button>
        )}
        <button
          type="button"
          onClick={skip}
          className="
                        inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg
                        bg-transparent text-[var(--ui-text-muted)]
                        hover:bg-[var(--ui-background-secondary)] hover:text-[var(--ui-text)]
                        transition-colors duration-200 cursor-pointer
                      "
        >
          <FaHourglass size={13} />
          Пропустить
        </button>
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        className="
                      inline-flex items-center gap-2 px-6 py-2.5 text-sm font-bold rounded-xl
                      bg-[var(--ui-primary)] text-[var(--ui-text-inverse)]
                      hover:bg-[var(--ui-primary-hover)] shadow-md hover:shadow-lg
                      transition-all duration-200 cursor-pointer active:scale-[0.98]
                    "
      >
        {isLast ? "Завершить тест" : "Далее"}
      </button>
    </div>
  );
};
