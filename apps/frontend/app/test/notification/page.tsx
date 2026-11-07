"use client";

import { Button, useNotification } from "@/shared/ui/kit";
import { NotificationPosition } from "@/shared/ui/kit/notification/types/notification.types";
import { useState } from "react";

export default function NotificationDemo() {
  const notification = useNotification();
  const [position, setPosition] = useState<NotificationPosition>("top-right");
  const [duration, setDuration] = useState(3000);

  const positions: NotificationPosition[] = [
    "top-left",
    "top-right",
    "bottom-left",
    "bottom-right",
  ];

  return (
    <div className="min-h-screen bg-[var(--ui-background)] p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-[var(--ui-text)] mb-8">
          Глобальные уведомления
        </h1>

        {/* Позиция */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-[var(--ui-text-secondary)] mb-4">
            Позиция: {position}
          </h2>
          <div className="grid grid-cols-2 gap-2 w-64">
            {positions.map((pos) => (
              <Button
                key={pos}
                variant={position === pos ? "primary" : "outline"}
                size="sm"
                onClick={() => setPosition(pos)}
              >
                {pos}
              </Button>
            ))}
          </div>
        </div>

        {/* Время жизни */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-[var(--ui-text-secondary)] mb-4">
            Время жизни: {duration === 0 ? "не закрывается" : `${duration}мс`}
          </h2>
          <div className="flex gap-2 flex-wrap">
            {[1000, 3000, 5000, 10000, 0].map((d) => (
              <Button
                key={d}
                variant={duration === d ? "primary" : "outline"}
                size="sm"
                onClick={() => setDuration(d)}
              >
                {d === 0 ? "∞" : `${d}ms`}
              </Button>
            ))}
          </div>
        </div>

        {/* Типы уведомлений */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-[var(--ui-text-secondary)] mb-4">
            Типы уведомлений
          </h2>
          <div className="flex gap-4 flex-wrap">
            <Button
              variant="primary"
              onClick={() =>
                notification.success(
                  "Операция выполнена успешно!",
                  duration || undefined,
                )
              }
            >
              Success
            </Button>
            <Button
              variant="danger"
              onClick={() =>
                notification.error(
                  "Произошла ошибка! Попробуйте позже.",
                  duration || undefined,
                )
              }
            >
              Error
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                notification.info(
                  "Новая версия приложения доступна.",
                  duration || undefined,
                )
              }
            >
              Info
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                notification.warning(
                  "Внимание! Заканчивается место на диске.",
                  duration || undefined,
                )
              }
            >
              Warning
            </Button>
          </div>
        </div>

        {/* Массовые уведомления */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-[var(--ui-text-secondary)] mb-4">
            Массовая отправка
          </h2>
          <div className="flex gap-4 flex-wrap">
            <Button
              variant="primary"
              onClick={() => {
                notification.success("Успех 1", duration || undefined);
                notification.info("Инфо 2", duration || undefined);
                notification.warning("Предупреждение 3", duration || undefined);
                notification.error("Ошибка 4", duration || undefined);
              }}
            >
              4 уведомления сразу
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                for (let i = 1; i <= 10; i++) {
                  notification.info(`Уведомление #${i}`, duration || undefined);
                }
              }}
            >
              10 уведомлений
            </Button>
          </div>
        </div>

        {/* API */}
        <div className="mt-8 p-4 rounded-lg border border-[var(--ui-border)] bg-[var(--ui-background-secondary)]">
          <h3 className="text-sm font-semibold text-[var(--ui-text)] mb-2">
            API NotificationProvider
          </h3>
          <div className="space-y-2 text-xs text-[var(--ui-text-secondary)]">
            <div>
              <code className="text-[var(--ui-primary)]">position</code> —
              позиция: top-left | top-right | bottom-left | bottom-right
            </div>
            <div>
              <code className="text-[var(--ui-primary)]">defaultDuration</code>{" "}
              — время жизни по умолчанию (мс)
            </div>
            <div>
              <code className="text-[var(--ui-primary)]">maxNotifications</code>{" "}
              — макс. кол-во одновременно
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
