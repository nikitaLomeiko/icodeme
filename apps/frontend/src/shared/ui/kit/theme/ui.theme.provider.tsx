"use client";

import React, { useEffect, useState } from "react";
import "./styles/theme.css";
import "./styles/layout-theme.css";
import { ThemeEnum } from "./types/theme.types";
import { ThemeContext } from "./context/theme.context";
import { getAvailableThemes } from "./lib/utils/get-available-themes";

interface IProps {
  children: React.ReactNode;
  theme: ThemeEnum;
  limit?: number;
  availableThemes?: ThemeEnum[];
}

export const UIThemeProvider: React.FC<IProps> = (props) => {
  const {
    children,
    theme: initialTheme,
    limit,
    availableThemes: customThemes,
  } = props;
  const [theme, setThemeState] = useState<ThemeEnum>(initialTheme);
  const availableThemes = customThemes || getAvailableThemes(limit);

  const setTheme = (newTheme: ThemeEnum) => {
    localStorage.setItem("data-theme", newTheme);
    setThemeState(newTheme);
  };

  useEffect(() => {
    const storedTheme = localStorage.getItem("data-theme") as ThemeEnum | null;
    const activeTheme =
      storedTheme && availableThemes.includes(storedTheme)
        ? storedTheme
        : theme;

    const frame = requestAnimationFrame(() => {
      if (activeTheme !== theme) setThemeState(activeTheme);
    });

    document.documentElement.setAttribute("data-theme", activeTheme);
    return () => cancelAnimationFrame(frame);
  }, [availableThemes, theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, availableThemes }}>
      {children}
    </ThemeContext.Provider>
  );
};
