"use client";

import React from "react";
import {
  ThemeEnum,
  ThemeSwitcherProps,
  THEME_METADATA,
} from "../types/theme.typs";
import { Button } from "../../buttons/button";
import { FaPalette } from "react-icons/fa";
import { useTheme } from "../lib";
import { getAvailableThemes } from "../lib/utils/getAvailableThemes";
import { getNextTheme } from "../lib/utils/getNextTheme";

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({
  limit,
  availableThemes: customThemes,
  showLabel = false,
  className,
}) => {
  const { theme, setTheme, availableThemes } = useTheme();

  const effectiveThemes =
    customThemes || getAvailableThemes(limit, availableThemes);

  const toggleTheme = () => {
    const next = getNextTheme(theme, effectiveThemes);
    setTheme(next);
  };

  const currentThemeMeta = THEME_METADATA[theme];

  return (
    <Button
      variant="ghost"
      onClick={toggleTheme}
      sizeIcon={20}
      icon={FaPalette}
      className={className}
      aria-label="Переключить тему"
    >
      {showLabel && (
        <span style={{ marginLeft: 8 }}>{currentThemeMeta?.label}</span>
      )}
    </Button>
  );
};
