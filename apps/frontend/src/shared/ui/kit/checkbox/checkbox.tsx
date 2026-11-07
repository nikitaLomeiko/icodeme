"use client";

import React from "react";
import { motion } from "framer-motion";
import { FaCheck } from "react-icons/fa";

interface CheckboxProps {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: React.ReactNode;
  disabled?: boolean;
  error?: string;
  required?: boolean;
  className?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  id,
  checked,
  onChange,
  label,
  disabled = false,
  error,
  required = false,
  className = "",
}) => {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <div className="flex items-center gap-2">
        <div className="relative">
          <input
            type="checkbox"
            id={id}
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            disabled={disabled}
            className="absolute opacity-0 w-6 h-6 cursor-pointer"
          />
          <motion.div
            whileTap={{ scale: 0.95 }}
            className={`
              w-4 h-4 rounded border-2 flex items-center justify-center
              transition-all duration-200 cursor-pointer
              ${
                checked
                  ? "bg-emerald-500 border-emerald-500"
                  : "bg-white border-gray-300 hover:border-emerald-400"
              }
              ${disabled ? "opacity-50 cursor-not-allowed" : ""}
              ${error ? "border-red-500" : ""}
            `}
            onClick={() => !disabled && onChange(!checked)}
          >
            {checked && <FaCheck size={10} className="text-white" />}
          </motion.div>
        </div>
        {label && (
          <label
            htmlFor={id}
            className={`
              text-[12px] cursor-pointer select-none
              ${disabled ? "text-gray-400 cursor-not-allowed" : "text-gray-600"}
              ${error ? "text-red-600" : ""}
            `}
            onClick={() => !disabled && onChange(!checked)}
          >
            {label}
            {required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
        )}
      </div>
      {error && <p className="text-[10px] text-red-500 mt-0.5 ml-6">{error}</p>}
    </div>
  );
};

Checkbox.displayName = "Checkbox";
