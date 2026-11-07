"use client";

import { useState } from "react";
import { Button, Checkbox, useNotification } from "@/shared/ui/kit";

export default function Test() {
  const notification = useNotification();
  const [checkboxStates, setCheckboxStates] = useState({
    default: false,
    checked: true,
    error: false,
    disabled: false,
    required: false,
    withLabel: false,
  });

  const handleCheckboxChange = (key: string) => (checked: boolean) => {
    setCheckboxStates({ ...checkboxStates, [key]: checked });
  };

  return (
    <div className="min-h-screen bg-[var(--ui-background)] p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-[var(--ui-text)] mb-8">
          UI Kit Demo
        </h1>

        {/* Кнопки */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-[var(--ui-text-secondary)] mb-4 border-b border-[var(--ui-border)] pb-2">
            Кнопки
          </h2>

          {/* Размеры */}
          <div className="mb-8">
            <h3 className="text-md font-medium text-[var(--ui-text-muted)] mb-3">
              Размеры
            </h3>
            <div className="flex gap-4 flex-wrap items-center">
              <Button size="sm">Маленькая</Button>
              <Button size="md">Средняя</Button>
              <Button size="lg">Большая</Button>
            </div>
          </div>

          {/* Варианты */}
          <div className="mb-8">
            <h3 className="text-md font-medium text-[var(--ui-text-muted)] mb-3">
              Варианты
            </h3>
            <div className="flex gap-4 flex-wrap">
              <Button variant="primary">Primary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="danger">Danger</Button>
            </div>
          </div>

          {/* С иконками */}
          <div className="mb-8">
            <h3 className="text-md font-medium text-[var(--ui-text-muted)] mb-3">
              С иконками
            </h3>
            <div className="flex gap-4 flex-wrap">
              <Button
                icon={() => (
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                )}
              >
                Слева
              </Button>
              <Button
                icon={() => (
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                )}
                iconPosition="right"
              >
                Справа
              </Button>
              <Button
                icon={() => (
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                    />
                  </svg>
                )}
                variant="outline"
              >
                Только иконка
              </Button>
            </div>
          </div>

          {/* Состояния */}
          <div className="mb-8">
            <h3 className="text-md font-medium text-[var(--ui-text-muted)] mb-3">
              Состояния
            </h3>
            <div className="flex gap-4 flex-wrap">
              <Button isLoading>Загрузка</Button>
              <Button disabled>Отключена</Button>
              <Button isLoading variant="outline">
                Загрузка
              </Button>
            </div>
          </div>

          {/* Full width */}
          <div className="mb-8">
            <h3 className="text-md font-medium text-[var(--ui-text-muted)] mb-3">
              Full width
            </h3>
            <div className="space-y-2">
              <Button fullWidth>На всю ширину</Button>
              <Button fullWidth variant="outline">
                Outline на всю ширину
              </Button>
            </div>
          </div>

          {/* Комбинации */}
          <div className="mb-8">
            <h3 className="text-md font-medium text-[var(--ui-text-muted)] mb-3">
              Комбинации
            </h3>
            <div className="flex gap-4 flex-wrap">
              <Button size="lg" variant="primary" icon={() => <span>👍</span>}>
                Большая с иконкой
              </Button>
              <Button size="sm" variant="danger" isLoading>
                Маленькая загрузка
              </Button>
              <Button size="lg" variant="outline" fullWidth>
                Большая на всю ширину
              </Button>
            </div>
          </div>

          {/* Уведомления */}
          <div className="mb-8">
            <h3 className="text-md font-medium text-[var(--ui-text-muted)] mb-3">
              Тест уведомлений
            </h3>
            <div className="flex gap-4 flex-wrap">
              <Button
                variant="primary"
                onClick={() => notification.success("Кнопка работает!")}
              >
                Success
              </Button>
              <Button
                variant="danger"
                onClick={() => notification.error("Что-то пошло не так")}
              >
                Error
              </Button>
              <Button
                variant="outline"
                onClick={() => notification.info("Информация")}
              >
                Info
              </Button>
              <Button
                variant="outline"
                onClick={() => notification.warning("Предупреждение")}
              >
                Warning
              </Button>
            </div>
          </div>
        </section>

        {/* Чекбоксы */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-[var(--ui-text-secondary)] mb-4 border-b border-[var(--ui-border)] pb-2">
            Чекбоксы
          </h2>

          {/* Основные чекбоксы */}
          <div className="mb-8">
            <h3 className="text-md font-medium text-[var(--ui-text-muted)] mb-3">
              Основные состояния
            </h3>
            <div className="space-y-4">
              <Checkbox
                id="default"
                checked={checkboxStates.default}
                onChange={handleCheckboxChange("default")}
                label="Обычный чекбокс"
              />

              <Checkbox
                id="checked"
                checked={checkboxStates.checked}
                onChange={handleCheckboxChange("checked")}
                label="Отмеченный чекбокс"
              />

              <Checkbox
                id="disabled"
                checked={checkboxStates.disabled}
                onChange={handleCheckboxChange("disabled")}
                label="Отключенный чекбокс"
                disabled
              />

              <Checkbox
                id="required"
                checked={checkboxStates.required}
                onChange={handleCheckboxChange("required")}
                label="Обязательный чекбокс"
                required
              />
            </div>
          </div>

          {/* Чекбокс с ошибкой */}
          <div className="mb-8">
            <h3 className="text-md font-medium text-[var(--ui-text-muted)] mb-3">
              С ошибкой
            </h3>
            <Checkbox
              id="error"
              checked={checkboxStates.error}
              onChange={handleCheckboxChange("error")}
              label="Чекбокс с ошибкой"
              error="Необходимо согласиться с условиями"
            />
          </div>

          {/* Чекбоксы с длинным текстом */}
          <div className="mb-8">
            <h3 className="text-md font-medium text-[var(--ui-text-muted)] mb-3">
              Длинный текст
            </h3>
            <Checkbox
              id="longText"
              checked={checkboxStates.withLabel}
              onChange={handleCheckboxChange("withLabel")}
              label={
                <span>
                  Я соглашаюсь с{" "}
                  <a
                    href="#"
                    className="text-[var(--ui-primary)] hover:underline"
                  >
                    условиями использования
                  </a>{" "}
                  и{" "}
                  <a
                    href="#"
                    className="text-[var(--ui-primary)] hover:underline"
                  >
                    политикой конфиденциальности
                  </a>
                </span>
              }
            />
          </div>

          {/* Все чекбоксы в ряд */}
          <div className="mb-8">
            <h3 className="text-md font-medium text-[var(--ui-text-muted)] mb-3">
              В ряд
            </h3>
            <div className="flex gap-6 flex-wrap">
              <Checkbox
                id="option1"
                checked={false}
                onChange={() => {}}
                label="Опция 1"
              />
              <Checkbox
                id="option2"
                checked={true}
                onChange={() => {}}
                label="Опция 2"
              />
              <Checkbox
                id="option3"
                checked={false}
                onChange={() => {}}
                label="Опция 3"
                disabled
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
