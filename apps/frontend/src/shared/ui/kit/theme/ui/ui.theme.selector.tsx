"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  ThemeEnum,
  ThemeSwitcherProps,
  THEME_METADATA,
} from "../types/theme.typs";
import { Button } from "../../buttons/button";
import { FaPalette, FaCheck } from "react-icons/fa";
import { getAvailableThemes } from "../lib/utils/getAvailableThemes";
import { useTheme } from "../lib";

export const ThemeSelector: React.FC<ThemeSwitcherProps> = ({
  limit,
  availableThemes: customThemes,
  showLabel = false,
  className,
}) => {
  const { theme, setTheme, availableThemes } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const effectiveThemes =
    customThemes || getAvailableThemes(limit, availableThemes);

  const currentThemeMeta = THEME_METADATA[theme];

  const handleSelectTheme = (newTheme: ThemeEnum) => {
    setTheme(newTheme);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      className={`relative inline-block ${className || ""}`}
      ref={dropdownRef}
    >
      <Button
        variant="ghost"
        onClick={() => setIsOpen(!isOpen)}
        sizeIcon={20}
        icon={FaPalette}
        aria-label="Выбрать тему"
        aria-expanded={isOpen}
      >
        {showLabel && (
          <span style={{ marginLeft: 8 }}>{currentThemeMeta?.label}</span>
        )}
      </Button>

      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            right: 0,
            marginTop: 8,
            backgroundColor: "var(--ui-background)",
            border: "1px solid var(--ui-border)",
            borderRadius: 8,
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
            zIndex: 1000,
            minWidth: 180,
            maxHeight: 400,
            overflowY: "auto",
          }}
        >
          <ul
            style={{
              listStyle: "none",
              margin: 0,
              padding: 8,
            }}
          >
            {effectiveThemes.map((themeOption) => {
              const meta = THEME_METADATA[themeOption];
              const isActive = theme === themeOption;

              return (
                <li key={themeOption}>
                  <button
                    onClick={() => handleSelectTheme(themeOption)}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "8px 12px",
                      border: "none",
                      backgroundColor: isActive
                        ? "var(--ui-background-secondary)"
                        : "transparent",
                      color: isActive ? "var(--ui-primary)" : "var(--ui-text)",
                      borderRadius: 6,
                      cursor: "pointer",
                      fontSize: 14,
                      transition: "background-color 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor =
                          "var(--ui-background-secondary)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = "transparent";
                      }
                    }}
                  >
                    <span>{meta.label}</span>
                    {isActive && <FaCheck size={14} />}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};
