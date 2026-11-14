"use client";

import { ThemeEnum, ThemeSwitcher, Title, useTheme } from "@/shared/ui/kit";

const themes = [ThemeEnum.LIGHT, ThemeEnum.DARK];

export const ThemeSettings: React.FC = () => {
  const { theme } = useTheme();
  const themeLabel = theme === ThemeEnum.DARK ? "Тёмная" : "Светлая";

  return (
    <section className="rounded-2xl border border-[var(--ui-border)] bg-[var(--ui-background-secondary)] p-5 shadow-xl sm:p-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Title size="lg" as="h2">
            Тема оформления
          </Title>
          <p className="mt-1 text-sm text-[var(--ui-text-secondary)]">
            Сейчас выбрана {themeLabel.toLowerCase()} тема.
          </p>
        </div>
        <ThemeSwitcher
          availableThemes={themes}
          showLabel
          className="self-start sm:self-auto"
        />
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3" aria-label="Доступные темы">
        {themes.map((themeOption) => {
          const isSelected = theme === themeOption;
          const label = themeOption === ThemeEnum.LIGHT ? "Светлая" : "Тёмная";

          return (
            <div
              key={themeOption}
              className={`rounded-xl border px-4 py-3 text-sm transition-colors ${
                isSelected
                  ? "border-[var(--ui-primary)] bg-[var(--ui-primary)]/10 text-[var(--ui-primary)]"
                  : "border-[var(--ui-border)] text-[var(--ui-text-secondary)]"
              }`}
            >
              <span className="font-medium">{label}</span>
              {isSelected && <span className="ml-2 text-xs">· выбрана</span>}
            </div>
          );
        })}
      </div>
    </section>
  );
};
