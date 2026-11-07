import { letterOf } from "../../consts";
import { motion } from "framer-motion";

interface IProps {
  id: string;
  selected: boolean;
  index: number;
  label: string;
  onClick: () => void;
}

export const ChoiceItem: React.FC<IProps> = (props) => {
  const { id, index, label, selected, onClick } = props;

  return (
    <motion.button
      key={id}
      type="button"
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className={`
                    w-full flex items-center gap-3 p-3.5 sm:p-4 rounded-xl border-2 text-left
                    transition-colors duration-200 cursor-pointer
                    ${
                      selected
                        ? "border-[var(--ui-primary)] bg-[var(--ui-primary)]/10"
                        : "border-[var(--ui-border)] bg-[var(--ui-background)] hover:border-[var(--ui-primary-hover)]"
                    }
                  `}
    >
      <span
        className={`
                      w-9 h-9 shrink-0 rounded-lg flex items-center justify-center
                      text-sm font-bold transition-colors duration-200
                      ${
                        selected
                          ? "bg-[var(--ui-primary)] text-[var(--ui-text-inverse)]"
                          : "bg-[var(--ui-background-secondary)] text-[var(--ui-text-muted)] border border-[var(--ui-border)]"
                      }
                    `}
      >
        {letterOf(index)}
      </span>
      <span className="flex-1 text-sm sm:text-[15px] text-[var(--ui-text)]">
        {label}
      </span>
      <span
        className={`
                        w-5 h-5 shrink-0 rounded-full border-2 flex items-center justify-center
                        transition-colors duration-200
                        ${
                          selected
                            ? "border-[var(--ui-primary)]"
                            : "border-[var(--ui-border)]"
                        }
                      `}
      >
        {selected && (
          <span className="w-2.5 h-2.5 rounded-full bg-[var(--ui-primary)]" />
        )}
      </span>
    </motion.button>
  );
};
