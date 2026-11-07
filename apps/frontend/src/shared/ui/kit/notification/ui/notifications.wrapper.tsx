"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaCheckCircle,
  FaExclamationCircle,
  FaInfoCircle,
  FaTimesCircle,
  FaTimes,
} from "react-icons/fa";
import { notificationStyles } from "../styles/notification.styles";
import { useNotification } from "../hooks/use.notification";
import { NotificationPosition } from "../types/notification.types";

const icons = {
  success: <FaCheckCircle size={14} />,
  error: <FaTimesCircle size={14} />,
  info: <FaInfoCircle size={14} />,
  warning: <FaExclamationCircle size={14} />,
};

const positionClasses: Record<NotificationPosition, string> = {
  "top-left": "fixed top-4 left-4 z-[100] w-80",
  "top-right": "fixed top-4 right-4 z-[100] w-80",
  "bottom-left": "fixed bottom-4 left-4 z-[100] w-80",
  "bottom-right": "fixed bottom-4 right-4 z-[100] w-80",
};

const positionAnimation = {
  "top-left": {
    initial: { opacity: 0, x: -100 },
    exit: { opacity: 0, x: -100 },
  },
  "top-right": {
    initial: { opacity: 0, x: 100 },
    exit: { opacity: 0, x: 100 },
  },
  "bottom-left": {
    initial: { opacity: 0, x: -100 },
    exit: { opacity: 0, x: -100 },
  },
  "bottom-right": {
    initial: { opacity: 0, x: 100 },
    exit: { opacity: 0, x: 100 },
  },
};

export const NotificationsWrapper: React.FC = () => {
  const { notifications, removeNotification, config } = useNotification();
  const { position } = config;

  return (
    <div className={`${positionClasses[position]} space-y-2`}>
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={positionAnimation[position].initial}
            animate={{ opacity: 1, x: 0 }}
            exit={positionAnimation[position].exit}
            transition={{ duration: 0.2 }}
            className={`
              p-3 rounded-lg border flex items-start gap-2 text-sm shadow-lg backdrop-blur-sm
              ${notificationStyles[notification.type]}
            `}
            role="alert"
          >
            <span className="flex-shrink-0 mt-0.5">
              {icons[notification.type]}
            </span>
            <span className="flex-1 break-words">{notification.message}</span>
            <button
              onClick={() => removeNotification(notification.id)}
              className="flex-shrink-0 hover:opacity-70 transition-opacity mt-0.5"
              aria-label="Закрыть уведомление"
            >
              <FaTimes size={12} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
