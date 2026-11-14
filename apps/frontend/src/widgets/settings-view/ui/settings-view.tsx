import { LogoutButton } from "@/features/auth";
import { Title } from "@/shared/ui/kit";
import { SettingsPlaceholderList } from "./settings-placeholder-list";
import { ThemeSettings } from "./theme-settings";

export const SettingsView: React.FC = () => {
  return (
    <div className="w-full space-y-6">
      <header className="space-y-2">
        <Title size="2xl">Настройки</Title>
        <p className="text-[var(--ui-text-secondary)]">
          Настройте внешний вид и параметры приложения.
        </p>
      </header>
      <ThemeSettings />
      <LogoutButton />
      <SettingsPlaceholderList />
    </div>
  );
};
