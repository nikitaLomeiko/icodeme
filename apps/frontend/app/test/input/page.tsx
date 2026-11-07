"use client";

import { useState } from "react";
import {
  TextField,
  PasswordField,
  CodeField,
  TextareaField,
  InputWithSuggestions,
  Avatar,
  Button,
  useNotification,
} from "@/shared/ui/kit";
import {
  FaSearch,
  FaUser,
  FaEnvelope,
  FaCheck,
  FaLock,
  FaDownload,
  FaRobot,
} from "react-icons/fa";

export default function Test() {
  const notification = useNotification();
  const [values, setValues] = useState({
    text: "",
    email: "",
    password: "",
    confirmPassword: "",
    error: "",
    disabled: "",
    search: "",
    username: "",
    withIconsLeft: "",
    withIconsRight: "",
    withBothIcons: "",
    textarea: "",
    suggestions: "",
  });

  const handleChange =
    (field: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setValues({ ...values, [field]: e.target.value });
    };

  return (
    <div className="min-h-screen bg-[var(--ui-background)] p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-[var(--ui-text)] mb-8">
          Все виды полей ввода
        </h1>

        {/* Обычные поля */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-[var(--ui-text-secondary)] mb-4">
            Обычные поля
          </h2>
          <div className="space-y-4">
            <TextField
              id="text"
              label="Текстовое поле"
              value={values.text}
              onChange={handleChange("text")}
              variant="underline"
            />

            <TextField
              id="email"
              label="Почта"
              type="email"
              value={values.email}
              onChange={handleChange("email")}
              variant="underline"
              required
            />
          </div>
        </div>

        {/* Поля с иконками */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-[var(--ui-text-secondary)] mb-4">
            Поля с иконками
          </h2>
          <div className="space-y-4">
            <TextField
              id="search"
              label="Поиск (icon - legacy)"
              value={values.search}
              onChange={handleChange("search")}
              icon={FaSearch}
            />

            <TextField
              id="user"
              label="Имя пользователя (iconLeft)"
              value={values.username}
              onChange={handleChange("username")}
              iconLeft={FaUser}
            />
          </div>
        </div>

        {/* Иконки с разных сторон */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-[var(--ui-text-secondary)] mb-4">
            Иконки слева и справа
          </h2>
          <div className="space-y-4">
            <TextField
              id="iconsLeft"
              label="Иконка слева"
              value={values.withIconsLeft}
              onChange={handleChange("withIconsLeft")}
              iconLeft={FaEnvelope}
            />

            <TextField
              id="iconsRight"
              label="Иконка справа"
              value={values.withIconsRight}
              onChange={handleChange("withIconsRight")}
              iconRight={FaCheck}
            />

            <TextField
              id="iconsBoth"
              label="Иконки с обеих сторон"
              value={values.withBothIcons}
              onChange={handleChange("withBothIcons")}
              iconLeft={FaSearch}
              iconRight={FaCheck}
            />

            <InputWithSuggestions
              id="suggestionsBoth"
              label="Suggestions с иконками"
              value={values.suggestions}
              onChange={handleChange("suggestions")}
              suggestions={["React", "Vue", "Angular", "Svelte", "Next.js"]}
              iconLeft={FaSearch}
              iconRight={FaDownload}
            />
          </div>
        </div>

        {/* Textarea с иконкой */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-[var(--ui-text-secondary)] mb-4">
            Textarea с иконкой
          </h2>
          <div className="space-y-4">
            <TextareaField
              id="textarea"
              label="Сообщение с иконкой"
              value={values.textarea}
              onChange={handleChange("textarea")}
              iconLeft={FaEnvelope}
              rows={4}
            />
          </div>
        </div>

        {/* Парольные поля */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-[var(--ui-text-secondary)] mb-4">
            Парольные поля
          </h2>
          <div className="space-y-4">
            <PasswordField
              id="password"
              label="Пароль"
              value={values.password}
              onChange={handleChange("password")}
            />

            <PasswordField
              id="confirmPassword"
              label="Подтвердите пароль"
              value={values.confirmPassword}
              onChange={handleChange("confirmPassword")}
              required
            />
          </div>
        </div>

        {/* Поля с ошибками */}
        <div className="">
          <h2 className="text-lg font-semibold text-[var(--ui-text-secondary)] ">
            Поля с ошибками
          </h2>
          <div className="space-y-4">
            <TextField
              id="error"
              label="Поле с ошибкой"
              value={values.error}
              onChange={handleChange("error")}
              error="Это поле обязательно для заполнения"
              inputMode="static"
              required
            />

            <PasswordField
              id="errorPassword"
              label="Пароль с ошибкой"
              value={values.password}
              onChange={handleChange("password")}
              required
              error="Пароль должен содержать минимум 6 символов"
            />
          </div>
        </div>

        {/* Отключенные поля */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-[var(--ui-text-secondary)] mb-4">
            Отключенные поля
          </h2>
          <div className="space-y-4">
            <TextField
              id="disabled"
              label="Отключенное поле"
              value={values.disabled}
              onChange={handleChange("disabled")}
              disabled
            />

            <PasswordField
              id="disabledPassword"
              label="Отключенный пароль"
              value="secret"
              onChange={() => {}}
              disabled
            />
          </div>
        </div>

        {/* Разные размеры */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-[var(--ui-text-secondary)] mb-4">
            Разные размеры
          </h2>
          <div className="space-y-4">
            <TextField
              id="small"
              label="Маленькое поле"
              value={values.text}
              onChange={handleChange("text")}
              size="sm"
            />

            <TextField
              id="medium"
              label="Среднее поле"
              value={values.text}
              onChange={handleChange("text")}
              size="md"
            />

            <TextField
              id="large"
              label="Большое поле"
              value={values.text}
              onChange={handleChange("text")}
              size="lg"
            />
          </div>
          <CodeField onChange={() => null} value="" variant="square" />
        </div>

        {/* Аватары */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-[var(--ui-text-secondary)] mb-4">
            Аватары
          </h2>

          <div className="space-y-6">
            {/* Размеры */}
            <div>
              <h3 className="text-sm font-medium text-[var(--ui-text-muted)] mb-3">
                Размеры
              </h3>
              <div className="flex items-end gap-4 flex-wrap">
                <Avatar size="xs" />
                <Avatar size="sm" />
                <Avatar size="md" />
                <Avatar size="lg" />
                <Avatar size="xl" />
                <Avatar size="2xl" />
              </div>
            </div>

            {/* Формы */}
            <div>
              <h3 className="text-sm font-medium text-[var(--ui-text-muted)] mb-3">
                Формы
              </h3>
              <div className="flex items-center gap-4">
                <Avatar size="lg" shape="circle" />
                <Avatar size="lg" shape="rounded" />
                <Avatar size="lg" shape="square" />
              </div>
            </div>

            {/* С изображением */}
            <div>
              <h3 className="text-sm font-medium text-[var(--ui-text-muted)] mb-3">
                С изображением
              </h3>
              <div className="flex items-center gap-4">
                <Avatar
                  src="https://i.pravatar.cc/100?img=1"
                  size="lg"
                  shape="circle"
                  alt="User 1"
                />
                <Avatar
                  src="https://i.pravatar.cc/100?img=5"
                  size="lg"
                  shape="rounded"
                  alt="User 2"
                />
                <Avatar
                  src="https://i.pravatar.cc/100?img=8"
                  size="lg"
                  shape="square"
                  alt="User 3"
                />
              </div>
            </div>

            {/* С инициалами */}
            <div>
              <h3 className="text-sm font-medium text-[var(--ui-text-muted)] mb-3">
                С инициалами
              </h3>
              <div className="flex items-center gap-4 flex-wrap">
                <Avatar initials="ИИ" size="lg" />
                <Avatar initials="АВ" size="lg" />
                <Avatar initials="JD" size="lg" />
                <Avatar initials="MK" size="lg" />
              </div>
            </div>

            {/* С цветом фона */}
            <div>
              <h3 className="text-sm font-medium text-[var(--ui-text-muted)] mb-3">
                С цветом фона
              </h3>
              <div className="flex items-center gap-4 flex-wrap">
                <Avatar bgColor="#EF4444" size="lg" />
                <Avatar bgColor="#3B82F6" size="lg" />
                <Avatar bgColor="#10B981" size="lg" />
                <Avatar bgColor="#8B5CF6" size="lg" />
                <Avatar bgColor="#F59E0B" size="lg" />
              </div>
            </div>

            {/* С кастомной иконкой */}
            <div>
              <h3 className="text-sm font-medium text-[var(--ui-text-muted)] mb-3">
                С кастомной иконкой
              </h3>
              <div className="flex items-center gap-4">
                <Avatar icon={<FaRobot />} size="lg" bgColor="#6366F1" />
                <Avatar icon={<FaUser />} size="lg" bgColor="#EC4899" />
                <Avatar showDefaultIcon={false} size="lg" bgColor="#64748B" />
              </div>
            </div>

            {/* Клик */}
            <div>
              <h3 className="text-sm font-medium text-[var(--ui-text-muted)] mb-3">
                С кликом
              </h3>
              <div className="flex items-center gap-4">
                <Avatar
                  src="https://i.pravatar.cc/100?img=12"
                  size="lg"
                  onClick={() => alert("Клик по аватару!")}
                />
                <Avatar
                  initials="CL"
                  size="lg"
                  onClick={() => console.log("Клик по инициалам")}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Тест уведомлений */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-[var(--ui-text-secondary)] mb-4">
            Тест уведомлений
          </h2>
          <div className="flex gap-4 flex-wrap">
            <Button
              variant="primary"
              onClick={() => notification.success("Валидация прошла!")}
            >
              Success
            </Button>
            <Button
              variant="danger"
              onClick={() => notification.error("Ошибка валидации")}
            >
              Error
            </Button>
            <Button
              variant="outline"
              onClick={() => notification.info("Подсказка")}
            >
              Info
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
