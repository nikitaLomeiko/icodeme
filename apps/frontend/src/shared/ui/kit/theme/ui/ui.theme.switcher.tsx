"use client";

import React from "react";
import {
  ThemeEnum,
  ThemeSwitcherProps,
  themeMetadata,
} from "../types/theme.types";
import { Button } from "../../buttons/button";
import { FaPalette } from "react-icons/fa";
import { useTheme } from "../lib";
import { getAvailableThemes } from "../lib/utils/get-available-themes";
import { getNextTheme } from "../lib/utils/get-next-theme";

interface IProps extends ThemeSwitcherProps {}

export const ThemeSwitcher: React.FC<IProps> = (props) => {
  const {
    limit,
    availableThemes: customThemes,
    showLabel = false,
    className,
  } = props;
  const { theme, setTheme, availableThemes } = useTheme();

  const effectiveThemes =
    customThemes || getAvailableThemes(limit, availableThemes);

  const toggleTheme = () => {
    const next = getNextTheme(theme, effectiveThemes);
    setTheme(next);
  };

  const currentThemeMeta = themeMetadata[theme];

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
