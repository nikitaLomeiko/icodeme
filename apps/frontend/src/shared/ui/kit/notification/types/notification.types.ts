export type NotificationType = "success" | "error" | "info" | "warning";

export type NotificationPosition =
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right";

export interface NotificationItem {
  id: string;
  type: NotificationType;
  message: string;
  duration?: number;
}

export interface NotificationProviderConfig {
  maxNotifications?: number;
  defaultDuration?: number;
  position?: NotificationPosition;
}
