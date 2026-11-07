"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaCheckCircle,
  FaExclamationCircle,
  FaInfoCircle,
  FaTimesCircle,
} from "react-icons/fa";
import { NotificationProps } from "./types/notification.props";
import { notificationStyles } from "./styles/notification.styles";

const icons = {
  success: <FaCheckCircle className="text-xs" />,
  error: <FaTimesCircle className="text-xs" />,
  info: <FaInfoCircle className="text-xs" />,
  warning: <FaExclamationCircle className="text-xs" />,
};

export const Notification: React.FC<NotificationProps> = ({
  type = "error",
  message,
  onClose,
  autoClose = true,
  autoCloseDelay = 3000,
  className = "",
}) => {
  const [isVisible, setIsVisible] = React.useState(true);

  React.useEffect(() => {
    if (autoClose && message) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onClose?.();
      }, autoCloseDelay);
      return () => clearTimeout(timer);
    }
  }, [message, autoClose, autoCloseDelay, onClose]);

  if (!message) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className={`
            mb-3 p-2.5 rounded-lg border flex items-center gap-2 text-xs
            ${notificationStyles[type]}
            ${className}
          `}
          role="alert"
        >
          <span className="flex-shrink-0">{icons[type]}</span>
          <span className="flex-1">{message}</span>
          {onClose && (
            <button
              onClick={() => {
                setIsVisible(false);
                onClose();
              }}
              className="flex-shrink-0 hover:opacity-70 transition-opacity"
            >
              <FaTimesCircle size={10} />
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

Notification.displayName = "Notification";
