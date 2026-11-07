import { ThemeEnum } from "../../types";

export const getNextTheme = (
  currentTheme: ThemeEnum,
  availableThemes?: ThemeEnum[],
): ThemeEnum => {
  const themes = availableThemes || Object.values(ThemeEnum);
  const currentIndex = themes.indexOf(currentTheme);

  if (currentIndex === -1) {
    return themes[0];
  }

  const nextIndex = (currentIndex + 1) % themes.length;
  return themes[nextIndex];
};
