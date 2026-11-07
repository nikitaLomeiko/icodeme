"use client";

import { createContext } from "react";
import { ThemeEnum } from "../types";

interface ThemeContextType {
  theme: ThemeEnum;
  setTheme: (theme: ThemeEnum) => void;
  availableThemes: ThemeEnum[];
}

export const ThemeContext = createContext<ThemeContextType | undefined>(
  undefined,
);
