interface IProps {
  option: string;
  index: number;
  onSelectOption: (option: string) => void;
}

export const MessageAnswer: React.FC<IProps> = (props) => {
  const { index, option, onSelectOption } = props;

  return (
    <button
      key={option}
      type="button"
      onClick={() => onSelectOption(option)}
      className="w-full flex items-center gap-2.5 text-left rounded-xl border border-[var(--ui-border)] px-3 py-2 text-sm text-[var(--ui-text)] leading-snug transition-colors duration-200 hover:border-[var(--ui-primary-hover)] bg-[var(--ui-primary)]/10 hover:bg-[var(--ui-primary)] cursor-pointer shrink-0"
    >
      <span className="w-6 h-6 shrink-0 rounded-md bg-white border border-[var(--ui-border)] flex items-center justify-center text-xs font-bold text-black">
        {index + 1}
      </span>
      <span className="flex-1">{option}</span>
    </button>
  );
};
