"use client";

import { withAccount, withAuth } from "@/app/providers/auth";
import { Document } from "@/entities/document";
import { Dropdown } from "@/shared/ui/kit";
import { Layout } from "@/widgets/layout";
import {
  FiMail,
  FiSettings,
  FiUser,
  FiStar,
  FiHeart,
  FiBookmark,
  FiBell,
  FiHome,
  FiSearch,
} from "react-icons/fi";

function DropdownPage() {
  const testOptions = [
    { value: "1", label: "Опция 1" },
    { value: "2", label: "Опция 2" },
    { value: "3", label: "Опция 3" },
    { value: "4", label: "Опция 4" },
    { value: "5", label: "Опция 5" },
  ];

  const iconOptions = [
    { value: "user", label: "Пользователь", icon: FiUser },
    { value: "mail", label: "Почта", icon: FiMail },
    { value: "settings", label: "Настройки", icon: FiSettings },
    { value: "star", label: "Звезда", icon: FiStar },
    { value: "heart", label: "Сердце", icon: FiHeart },
    { value: "bookmark", label: "Закладка", icon: FiBookmark },
  ];

  const descriptionOptions = [
    {
      value: "basic",
      label: "Базовый",
      description: "Стандартная настройка для обычных пользователей",
    },
    {
      value: "advanced",
      label: "Расширенный",
      description: "Дополнительные функции для опытных пользователей",
    },
    {
      value: "pro",
      label: "Профессиональный",
      description: "Максимальные возможности и настройки",
    },
  ];

  const manyOptions = Array.from({ length: 20 }, (_, i) => ({
    value: String(i + 1),
    label: `Опция ${i + 1}`,
    description: i % 2 === 0 ? `Описание для опции ${i + 1}` : undefined,
  }));

  return (
    <Layout>
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Заголовок страницы */}
        <Document
          title="Тестирование Dropdown компонента"
          content={`
# Dropdown компонент

На этой странице собраны все варианты использования dropdown компонента в разных конфигурациях.
          `}
        />

        {/* Простой dropdown */}
        <div className="bg-[var(--ui-background-secondary)] rounded-xl p-6 border border-[var(--ui-border)]">
          <h2 className="text-xl font-semibold mb-4 text-[var(--ui-text)]">
            Базовый dropdown
          </h2>
          <p className="text-sm text-[var(--ui-text-muted)] mb-4">
            Стандартный выбор из списка
          </p>
          <Dropdown
            id="simple"
            label="Простой выбор"
            options={testOptions}
            onChange={(value, option) => console.log("Выбрано:", value, option)}
          />
        </div>

        {/* Dropdown с иконками */}
        <div className="bg-[var(--ui-background-secondary)] rounded-xl p-6 border border-[var(--ui-border)]">
          <h2 className="text-xl font-semibold mb-4 text-[var(--ui-text)]">
            С иконками
          </h2>
          <p className="text-sm text-[var(--ui-text-muted)] mb-4">
            Опции с иконками слева
          </p>
          <Dropdown
            id="with-icons"
            label="С иконками"
            icon={FiUser}
            options={iconOptions}
            onChange={(value, option) =>
              console.log("Выбрано:", value, option?.label)
            }
          />
        </div>

        {/* Dropdown с поиском */}
        <div className="bg-[var(--ui-background-secondary)] rounded-xl p-6 border border-[var(--ui-border)]">
          <h2 className="text-xl font-semibold mb-4 text-[var(--ui-text)]">
            С поиском
          </h2>
          <p className="text-sm text-[var(--ui-text-muted)] mb-4">
            Можно искать опции по тексту
          </p>
          <Dropdown
            id="searchable"
            label="С поиском"
            searchable
            options={manyOptions}
            onSearch={(term) => console.log("Поиск:", term)}
            onChange={(value, option) => console.log("Выбрано:", value, option)}
          />
        </div>

        {/* Множественный выбор */}
        <div className="bg-[var(--ui-background-secondary)] rounded-xl p-6 border border-[var(--ui-border)]">
          <h2 className="text-xl font-semibold mb-4 text-[var(--ui-text)]">
            Множественный выбор
          </h2>
          <p className="text-sm text-[var(--ui-text-muted)] mb-4">
            Можно выбрать несколько опций, есть кнопка очистки
          </p>
          <Dropdown
            id="multiple"
            label="Множественный выбор"
            multiple
            clearable
            options={iconOptions}
            onChange={(value, option) => console.log("Выбрано:", value, option)}
          />
        </div>

        {/* С описаниями */}
        <div className="bg-[var(--ui-background-secondary)] rounded-xl p-6 border border-[var(--ui-border)]">
          <h2 className="text-xl font-semibold mb-4 text-[var(--ui-text)]">
            С описаниями
          </h2>
          <p className="text-sm text-[var(--ui-text-muted)] mb-4">
            Каждая опция может иметь дополнительное описание
          </p>
          <Dropdown
            id="with-description"
            label="С описаниями"
            options={descriptionOptions}
            onChange={(value, option) => console.log("Выбрано:", value, option)}
          />
        </div>

        {/* Разные варианты стилей */}
        <div className="bg-[var(--ui-background-secondary)] rounded-xl p-6 border border-[var(--ui-border)]">
          <h2 className="text-xl font-semibold mb-4 text-[var(--ui-text)]">
            Разные стили
          </h2>
          <p className="text-sm text-[var(--ui-text-muted)] mb-4">
            Различные варианты оформления
          </p>
          <div className="space-y-4">
            <Dropdown
              id="pill"
              label="Pill стиль (полностью скругленный)"
              variant="pill"
              options={testOptions}
            />
            <Dropdown
              id="rounded"
              label="Rounded стиль (стандартный)"
              variant="rounded"
              options={testOptions}
            />
            <Dropdown
              id="square"
              label="Square стиль (без скругления)"
              variant="square"
              options={testOptions}
            />
            <Dropdown
              id="underline"
              label="Underline стиль (подчеркивание)"
              variant="underline"
              options={testOptions}
            />
            <Dropdown
              id="clean"
              label="Clean стиль (без рамки)"
              variant="clean"
              options={testOptions}
            />
          </div>
        </div>

        {/* Dropdown с разными размерами */}
        <div className="bg-[var(--ui-background-secondary)] rounded-xl p-6 border border-[var(--ui-border)]">
          <h2 className="text-xl font-semibold mb-4 text-[var(--ui-text)]">
            Разные размеры
          </h2>
          <p className="text-sm text-[var(--ui-text-muted)] mb-4">
            Small, Medium и Large размеры
          </p>
          <div className="space-y-4">
            <Dropdown
              id="size-sm"
              label="Small размер"
              size="sm"
              options={testOptions}
            />
            <Dropdown
              id="size-md"
              label="Medium размер"
              size="md"
              options={testOptions}
            />
            <Dropdown
              id="size-lg"
              label="Large размер"
              size="lg"
              options={testOptions}
            />
          </div>
        </div>

        {/* Dropdown с ошибкой */}
        <div className="bg-[var(--ui-background-secondary)] rounded-xl p-6 border border-[var(--ui-border)]">
          <h2 className="text-xl font-semibold mb-4 text-[var(--ui-text)]">
            Состояние ошибки
          </h2>
          <p className="text-sm text-[var(--ui-text-muted)] mb-4">
            Отображение поля с ошибкой
          </p>
          <Dropdown
            id="with-error"
            label="Поле с ошибкой"
            error="Обязательное поле для заполнения"
            options={testOptions}
          />
        </div>

        {/* Dropdown disabled */}
        <div className="bg-[var(--ui-background-secondary)] rounded-xl p-6 border border-[var(--ui-border)]">
          <h2 className="text-xl font-semibold mb-4 text-[var(--ui-text)]">
            Отключенное состояние
          </h2>
          <p className="text-sm text-[var(--ui-text-muted)] mb-4">
            Поле недоступно для взаимодействия
          </p>
          <Dropdown
            id="disabled"
            label="Отключенный dropdown"
            disabled
            options={testOptions}
          />
        </div>

        {/* Полная ширина */}
        <div className="bg-[var(--ui-background-secondary)] rounded-xl p-6 border border-[var(--ui-border)]">
          <h2 className="text-xl font-semibold mb-4 text-[var(--ui-text)]">
            Полная ширина
          </h2>
          <p className="text-sm text-[var(--ui-text-muted)] mb-4">
            Растягивается на всю доступную ширину
          </p>
          <Dropdown
            id="full-width"
            label="На всю ширину"
            fullWidth
            options={testOptions}
          />
        </div>
      </div>
    </Layout>
  );
}

export default withAuth(withAccount(DropdownPage));
