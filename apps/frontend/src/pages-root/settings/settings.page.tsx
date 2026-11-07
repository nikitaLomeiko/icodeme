"use client";

import { Button, ThemeEnum, ThemeSwitcher, Title } from "@/shared/ui/kit";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLogoutMutation } from "@/entities/auth";
import { useTheme } from "@/shared/ui/kit/theme";
import { FaBell, FaCode, FaLock, FaUser } from "react-icons/fa";

const settingSections = [
  {
    title: "Аккаунт",
    description: "Данные профиля и параметры учётной записи",
    icon: FaUser,
  },
  {
    title: "Уведомления",
    description: "Настройки уведомлений и напоминаний",
    icon: FaBell,
  },
  {
    title: "Приватность",
    description: "Видимость профиля и управление данными",
    icon: FaLock,
  },
  {
    title: "Редактор",
    description: "Параметры редактора кода и рабочего пространства",
    icon: FaCode,
  },
];

export const SettingsPage = () => {
  const [logout, { isLoading }] = useLogoutMutation();
  const [logoutError, setLogoutError] = useState(false);
  const router = useRouter();
  const handleLogout = async () => {
    setLogoutError(false);
    const result = await logout();
    if (result.error) {
      setLogoutError(true);
      return;
    }
    router.replace("/auth");
  };
  const { theme } = useTheme();
  const themeLabel = theme === ThemeEnum.DARK ? "Тёмная" : "Светлая";

  return (
    <div className="w-full space-y-6">
      <header className="space-y-2">
        <Title size="2xl">Настройки</Title>
        <p className="text-[var(--ui-text-secondary)]">
          Настройте внешний вид и параметры приложения.
        </p>
      </header>

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
            availableThemes={[ThemeEnum.LIGHT, ThemeEnum.DARK]}
            showLabel
            className="self-start sm:self-auto"
          />
        </div>
        <div
          className="mt-5 grid grid-cols-2 gap-3"
          aria-label="Доступные темы"
        >
          {[ThemeEnum.LIGHT, ThemeEnum.DARK].map((themeOption) => {
            const isSelected = theme === themeOption;
            const label =
              themeOption === ThemeEnum.LIGHT ? "Светлая" : "Тёмная";

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

      <section className="rounded-2xl border border-[var(--ui-border)] bg-[var(--ui-background-secondary)] p-5">
        <Button
          variant="outline"
          onClick={handleLogout}
          isLoading={isLoading}
          disabled={isLoading}
        >
          Выйти из аккаунта
        </Button>
        {logoutError && (
          <p role="alert" className="mt-2">
            Не удалось завершить сессию на сервере. Повторите попытку.
          </p>
        )}
      </section>

      <section className="space-y-3">
        <Title size="lg" as="h2">
          Другие настройки
        </Title>
        <div className="grid gap-3 sm:grid-cols-2">
          {settingSections.map(({ title, description, icon: Icon }) => (
            <div
              key={title}
              className="flex items-start gap-4 rounded-2xl border border-[var(--ui-border)] bg-[var(--ui-background-secondary)] p-5 opacity-80"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--ui-primary)]/10 text-[var(--ui-primary)]">
                <Icon />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-[var(--ui-text)]">
                    {title}
                  </h3>
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
    </div>
  );
};
