import { useContext } from "react";
import {
  NotificationContext,
  NotificationContextType,
} from "../context/notification.context";

export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within NotificationProvider");
  }
  return context;
};
