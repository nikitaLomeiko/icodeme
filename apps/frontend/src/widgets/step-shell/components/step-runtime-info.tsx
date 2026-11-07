import type { ISettings } from "@/entities/study";

interface IProps {
  settings?: ISettings;
}

interface RuntimeDetail {
  label: string;
  value: string;
  code?: string;
}

const languageNames: Record<string, string> = {
  bash: "Bash",
  c: "C",
  cpp: "C++",
  go: "Go",
  java: "Java",
  javascript: "JavaScript",
  python: "Python",
  rust: "Rust",
  typescript: "TypeScript",
};

const formatNumber = (value: number) =>
  new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 2 }).format(value);

const formatTimeLimit = (milliseconds: number) => {
  const millisecondsLabel = `${formatNumber(milliseconds)} мс`;
  if (milliseconds < 1000) return millisecondsLabel;

  return `${millisecondsLabel} (${formatNumber(milliseconds / 1000)} с)`;
};

export const StepRuntimeInfo: React.FC<IProps> = ({ settings }) => {
  const details: RuntimeDetail[] = [
    settings?.language
      ? {
          label: "Язык",
          value: languageNames[settings.language.toLowerCase()] ?? settings.language,
          code: settings.language,
        }
      : null,
    settings?.entryFile
      ? {
          label: "Главный исполняемый файл",
          value: settings.entryFile,
          code: settings.entryFile,
        }
      : null,
    typeof settings?.timeLimitMs === "number"
      ? {
          label: "Лимит времени выполнения",
          value: formatTimeLimit(settings.timeLimitMs),
        }
      : null,
    typeof settings?.memoryLimitMb === "number"
      ? {
          label: "Лимит оперативной памяти",
          value: `${formatNumber(settings.memoryLimitMb)} МБ`,
        }
      : null,
  ].filter((detail): detail is RuntimeDetail => detail !== null);

  if (details.length === 0) return null;

  return (
    <section className="mt-5 rounded-2xl border border-[var(--ui-border)] bg-[var(--ui-background-secondary)] p-5 shadow-sm">
      <h2 className="text-sm font-semibold text-[var(--ui-text)]">
        Параметры запуска
      </h2>
      <dl className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {details.map((detail) => (
          <div
            key={detail.label}
            className="rounded-xl bg-[var(--ui-background-tertiary)] px-4 py-3"
          >
            <dt className="text-xs text-[var(--ui-text-muted)]">
              {detail.label}
            </dt>
            <dd className="mt-1 break-words text-sm font-semibold text-[var(--ui-text)]">
              {detail.code ? (
                <code>
                  {detail.value}
                  {detail.label === "Язык" && detail.value !== detail.code
                    ? ` (${detail.code})`
                    : ""}
                </code>
              ) : (
                detail.value
              )}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
};
