export enum ThemeEnum {
  LIGHT = "light",
  DARK = "dark",
  BLUE = "blue",
  PURPLE = "purple",
  YELLOW = "yellow",
  RED = "red",
  PINK = "pink",
  CYAN = "cyan",
  ORANGE = "orange",
  TEAL = "teal",
  GRAY = "gray",
}

export interface ThemeMetadata {
  value: ThemeEnum;
  label: string;
  icon?: React.ComponentType<{ size?: number | string }>;
}

export const THEME_METADATA: Record<ThemeEnum, ThemeMetadata> = {
  [ThemeEnum.LIGHT]: { value: ThemeEnum.LIGHT, label: "Светлая" },
  [ThemeEnum.DARK]: { value: ThemeEnum.DARK, label: "Тёмная" },
  [ThemeEnum.BLUE]: { value: ThemeEnum.BLUE, label: "Синяя" },
  [ThemeEnum.PURPLE]: { value: ThemeEnum.PURPLE, label: "Фиолетовая" },
  [ThemeEnum.YELLOW]: { value: ThemeEnum.YELLOW, label: "Жёлтая" },
  [ThemeEnum.RED]: { value: ThemeEnum.RED, label: "Красная" },
  [ThemeEnum.PINK]: { value: ThemeEnum.PINK, label: "Розовая" },
  [ThemeEnum.CYAN]: { value: ThemeEnum.CYAN, label: "Голубая" },
  [ThemeEnum.ORANGE]: { value: ThemeEnum.ORANGE, label: "Оранжевая" },
  [ThemeEnum.TEAL]: { value: ThemeEnum.TEAL, label: "Бирюзовая" },
  [ThemeEnum.GRAY]: { value: ThemeEnum.GRAY, label: "Серая" },
};

export interface ThemeConfig {
  id: string;
  name: string;
  colors: {
    primary: string;
    primaryHover: string;
    primaryActive: string;
    secondary: string;
    accent: string;
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  semantic: {
    background: string;
    backgroundSecondary: string;
    text: string;
    textSecondary: string;
    textMuted: string;
    border: string;
    borderFocus: string;
    placeholder: string;
    disabled: string;
  };
  brand: {
    gradientStart: string;
    gradientEnd: string;
    shadow: string;
  };
}

export interface ThemeSwitcherProps {
  limit?: number;
  availableThemes?: ThemeEnum[];
  showLabel?: boolean;
  className?: string;
}
