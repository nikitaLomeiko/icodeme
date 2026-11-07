import { motion, AnimatePresence } from "framer-motion";

interface IProps {
  suggestions: string[];
  showSuggestions: boolean;
  highlightedIndex: number;
  selectSuggestion: (suggestion: string) => void;
  internalValue: string | number | readonly string[];
}

export const Suggestions: React.FC<IProps> = (props) => {
  const {
    suggestions,
    showSuggestions,
    highlightedIndex,
    selectSuggestion,
    internalValue,
  } = props;

  return (
    <AnimatePresence>
      {showSuggestions && suggestions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute z-50 w-full mt-1 bg-[var(--ui-background)] border border-[var(--ui-border)] rounded-lg shadow-lg max-h-48 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => selectSuggestion(suggestion)}
              className={`
                    w-full px-4 py-2 text-left text-sm transition-colors
                    ${
                      index === highlightedIndex
                        ? "bg-[var(--ui-primary)]/10 text-[var(--ui-primary)]"
                        : "text-[var(--ui-text)] hover:bg-[var(--ui-background-secondary)]"
                    }
                  `}
            >
              {suggestion}
            </button>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
