"use client";

import { createContext } from "react";
import {
  NotificationItem,
  NotificationProviderConfig,
} from "../types/notification.types";

export interface NotificationContextType {
  notifications: NotificationItem[];
  addNotification: (notification: Omit<NotificationItem, "id">) => string;
  removeNotification: (id: string) => void;
  success: (message: string, duration?: number) => string;
  error: (message: string, duration?: number) => string;
  info: (message: string, duration?: number) => string;
  warning: (message: string, duration?: number) => string;
  config: Required<NotificationProviderConfig>;
}

export const NotificationContext =
  createContext<NotificationContextType | null>(null);
