interface IProps {
  title?: string;
  description?: string;
  content?: string;
}

export const StepAssignment: React.FC<IProps> = (props) => {
  const { title, description, content } = props;

  return (
    <section className="rounded-2xl border border-[var(--ui-border)] bg-[var(--ui-background-secondary)] p-5 shadow-sm">
      <span className="text-xs font-semibold uppercase tracking-wider text-[var(--ui-primary)]">
        Задание
      </span>
      {title && (
        <h1 className="mt-2 text-xl font-bold text-[var(--ui-text)]">
          {title}
        </h1>
      )}
      {description && (
        <p className="mt-3 whitespace-pre-wrap text-sm text-[var(--ui-text-muted)]">
          {description}
        </p>
      )}
      {content && (
        <div className="mt-5 whitespace-pre-wrap border-t border-[var(--ui-border)] pt-5 text-sm leading-7 text-[var(--ui-text)]">
          {content}
        </div>
      )}
    </section>
  );
};
