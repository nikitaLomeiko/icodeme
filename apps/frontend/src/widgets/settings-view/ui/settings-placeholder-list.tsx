import { Title } from "@/shared/ui/kit";
import { createElement } from "react";
import { settingSections } from "../model/settings.data";

export const SettingsPlaceholderList: React.FC = () => {
  return (
    <section className="space-y-3">
      <Title size="lg" as="h2">
        Другие настройки
      </Title>
      <div className="grid gap-3 sm:grid-cols-2">
        {settingSections.map(({ title, description, icon }) => (
          <div
            key={title}
            className="flex items-start gap-4 rounded-2xl border border-[var(--ui-border)] bg-[var(--ui-background-secondary)] p-5 opacity-80"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--ui-primary)]/10 text-[var(--ui-primary)]">
              {createElement(icon)}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-[var(--ui-text)]">{title}</h3>
                <span className="rounded-full border border-[var(--ui-border)] px-2 py-0.5 text-[10px] text-[var(--ui-text-muted)]">
                  Скоро
                </span>
              </div>
              <p className="mt-1 text-sm text-[var(--ui-text-secondary)]">
                {description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
