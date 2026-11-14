"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface IProps {
  mode: string;
  children: React.ReactNode;
}

export const AnimatedForm: React.FC<IProps> = ({ mode, children }) => {
  return (
    <AnimatePresence initial={false} mode="wait">
      <motion.div
        key={mode}
        initial={{ x: 20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -20, opacity: 0 }}
        transition={{ duration: 0.15, ease: "easeOut" }}
        style={{ position: "relative" }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};
