"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface AnimatedFormProps {
  mode: string;
  children: React.ReactNode;
}

export const AnimatedForm: React.FC<AnimatedFormProps> = ({
  mode,
  children,
}) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <>{children}</>;
  }

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
