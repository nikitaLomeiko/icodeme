import { NotificationType } from "./notification.types";

export interface NotificationProps {
  type?: NotificationType;
  message: string | null;
  onClose?: () => void;
  autoClose?: boolean;
  autoCloseDelay?: number;
  className?: string;
}
