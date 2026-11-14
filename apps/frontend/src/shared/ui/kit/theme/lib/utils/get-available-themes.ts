import { ThemeEnum } from "../../types";

export const getAvailableThemes = (
  limit?: number,
  baseThemes?: ThemeEnum[],
): ThemeEnum[] => {
  const themes = baseThemes || Object.values(ThemeEnum);

  if (!limit || limit >= themes.length) {
    return themes;
  }

  return themes.slice(0, limit);
};
