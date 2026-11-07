interface IProps {
  languages: string[];
}

export const LanguageList: React.FC<IProps> = ({ languages }) => {
  return (
    <div className="flex flex-wrap justify-center gap-1.5">
      {languages.map((lang, idx) => (
        <span
          key={idx}
          className="inline-flex items-center gap-2 rounded-md border border-[var(--ui-border)] bg-[var(--ui-background-secondary)] px-3 py-2 font-mono text-sm font-semibold text-[var(--ui-text)]"
        >
          <span aria-hidden="true" className="text-xs font-bold text-[var(--ui-primary)]">&lt;/&gt;</span>
          {lang}
        </span>
      ))}
    </div>
  );
};
