"use client";

import React, { useState, useCallback } from "react";
import {
  NotificationContext,
  NotificationContextType,
} from "./context/notification.context";
import { NotificationItem, NotificationProviderConfig } from "./types/notification.types";

const defaultConfig: Required<NotificationProviderConfig> = {
  maxNotifications: 5,
  defaultDuration: 3000,
  position: "top-right",
};

export const NotificationProvider: React.FC<
  {
    children: React.ReactNode;
  } & NotificationProviderConfig
> = ({ children, maxNotifications, defaultDuration, position }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const config: Required<NotificationProviderConfig> = {
    ...defaultConfig,
    ...(maxNotifications !== undefined && { maxNotifications }),
    ...(defaultDuration !== undefined && { defaultDuration }),
    ...(position !== undefined && { position }),
  };

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const addNotification = useCallback(
    (notification: Omit<NotificationItem, "id">): string => {
      const id = Math.random().toString(36).substring(2, 9);
      const newNotification: NotificationItem = {
        ...notification,
        id,
        duration: notification.duration ?? config.defaultDuration,
      };

      setNotifications((prev) => {
        const updated =
          prev.length >= config.maxNotifications
            ? [
                ...prev.slice(prev.length - config.maxNotifications + 1),
                newNotification,
              ]
            : [...prev, newNotification];
        return updated;
      });

      if (newNotification.duration !== 0) {
        setTimeout(() => removeNotification(id), newNotification.duration);
      }

      return id;
    },
    [removeNotification, config.maxNotifications, config.defaultDuration],
  );

  const success = useCallback(
    (message: string, duration?: number) =>
      addNotification({ type: "success", message, duration }),
    [addNotification],
  );

  const error = useCallback(
    (message: string, duration?: number) =>
      addNotification({ type: "error", message, duration }),
    [addNotification],
  );

  const info = useCallback(
    (message: string, duration?: number) =>
      addNotification({ type: "info", message, duration }),
    [addNotification],
  );

  const warning = useCallback(
    (message: string, duration?: number) =>
      addNotification({ type: "warning", message, duration }),
    [addNotification],
  );

  const value: NotificationContextType = {
    notifications,
    addNotification,
    removeNotification,
    success,
    error,
    info,
    warning,
    config,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
