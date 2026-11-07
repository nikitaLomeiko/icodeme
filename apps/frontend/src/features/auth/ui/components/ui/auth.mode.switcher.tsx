"use client";

import React from "react";
import { Button, Title } from "@/shared/ui/kit";
import { FaArrowLeft } from "react-icons/fa";
import { typeMode } from "../../../model/types/mode.types";

interface AuthModeSwitcherProps {
  mode: typeMode;
  onModeChange: (mode: typeMode) => void;
}

export const AuthModeSwitcher: React.FC<AuthModeSwitcherProps> = ({
  mode,
  onModeChange,
}) => {
  return (
    <div className="mt-3 text-center">
      {mode === "login" && (
        <Title
          as="p"
          size="lg"
          weight="normal"
          align="center"
          className="light:text-gray-500 dark:text-slate-400 transition-colors duration-500"
        >
          Нет аккаунта?{" "}
          <Button variant="ghost" onClick={() => onModeChange("register")}>
            Создать
          </Button>
        </Title>
      )}
      {mode === "register" && (
        <Title
          as="p"
          size="lg"
          weight="normal"
          align="center"
          className="light:text-gray-500 dark:text-slate-400 transition-colors duration-500"
        >
          Уже есть?{" "}
          <Button variant="ghost" onClick={() => onModeChange("login")}>
            Войти
          </Button>
        </Title>
      )}
      {(mode === "forgot" || mode === "verify") && (
        <Button variant="ghost" onClick={() => onModeChange("login")}>
          <FaArrowLeft className="small" />
          <span className="small">Назад</span>
        </Button>
      )}
    </div>
  );
};
