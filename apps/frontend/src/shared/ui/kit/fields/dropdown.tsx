"use client";

import React, { forwardRef, useState, useRef, useEffect } from "react";
import { FiChevronDown } from "react-icons/fi";
import { useFocused } from "./hooks/use.focused";
import { InputWrapper } from "./wrapper/input.wrapper";
import { FieldIcon } from "./ui/field.icon";
import { BaseDropdownProps, DropdownOption } from "./types";
import { getDropdownPosition, styleSize, stylesVariant } from "./styles";
import { DropdownOption as ComponentDropdownOption } from "./ui/dropdown.option";

export const Dropdown = forwardRef<HTMLDivElement, BaseDropdownProps>(
  (props, forwardedRef) => {
    const {
      id,
      label,
      options,
      value,
      defaultValue,
      onChange,
      icon,
      iconLeft,
      iconRight,
      error,
      variant = "rounded",
      size = "md",
      fullWidth = false,
      disabled = false,
      required = false,
      placeholder,
      inputMode = "floating",
      position = "bottom",
      searchable = false,
      clearable = false,
      multiple = false,
      maxHeight = 300,
      className = "",
      renderOption,
      renderValue,
      onSearch,
      noOptionsMessage = "Ничего не найдено",
    } = props;

    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const [selectedValue, setSelectedValue] = useState<string | string[]>(
      () => {
        if (multiple) {
          if (defaultValue) return [defaultValue];
          if (value) return [value];
          return [];
        }
        return defaultValue || value || "";
      },
    );

    const containerRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const buttonRef = useRef<HTMLDivElement>(null);

    const { isFocused } = useFocused({
      onFocus: () => {},
      onBlur: () => {},
    });

    const selectedOptions = React.useMemo(() => {
      if (multiple) {
        const values = selectedValue as string[];
        return options.filter((opt) => values.includes(opt.value));
      }
      return options.find((opt) => opt.value === selectedValue) || null;
    }, [options, selectedValue, multiple]);

    const filteredOptions = React.useMemo(() => {
      if (!searchTerm) return options;
      return options.filter((opt) =>
        opt.label.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }, [options, searchTerm]);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(event.target as Node)
        ) {
          setIsOpen(false);
          setSearchTerm("");
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (option: DropdownOption) => {
      if (option.disabled) return;

      if (multiple) {
        const current = selectedValue as string[];
        const newValue = current.includes(option.value)
          ? current.filter((v) => v !== option.value)
          : [...current, option.value];
        setSelectedValue(newValue);
        onChange?.(newValue, option);
      } else {
        setSelectedValue(option.value);
        onChange?.(option.value, option);
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    const handleClear = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (multiple) {
        const empty: string[] = [];
        setSelectedValue(empty);
        onChange?.([], null);
      } else {
        setSelectedValue("");
        onChange?.("", null);
      }
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(e.target.value);
      onSearch?.(e.target.value);
    };

    const getDisplayValue = () => {
      if (renderValue) {
        return renderValue(selectedOptions);
      }

      if (multiple) {
        const selected = selectedOptions as DropdownOption[];
        if (selected.length === 0) return placeholder;
        if (selected.length === 1) return selected[0].label;
        return `${selected.length} выбрано`;
      }

      return (selectedOptions as DropdownOption)?.label || placeholder;
    };

    const Icon = icon || iconLeft;
    const hasLeftIcon = !!Icon;
    const hasRightIcon = !!iconRight;

    const sizeStyles = styleSize[size];
    const variantStyles = stylesVariant[variant];

    const buttonClasses = `
      w-full outline-none transition-all duration-200
      bg-[var(--ui-background)] text-[var(--ui-text)] placeholder:text-[var(--ui-placeholder)]
      cursor-pointer flex items-center justify-between
      ${sizeStyles.button}
      ${variantStyles}
      ${error ? "border-[var(--ui-error)]" : ""}
      ${disabled ? "bg-[var(--ui-disabled)] cursor-not-allowed opacity-60" : ""}
      ${fullWidth ? "w-full" : ""}
      ${hasLeftIcon ? "pl-10" : "pl-5"}
      ${hasRightIcon ? "pr-10" : "pr-5"}
      ${className}
    `;

    const hasValue = multiple
      ? (selectedValue as string[]).length > 0
      : !!selectedValue;

    return (
      <InputWrapper
        id={id}
        label={label}
        isFocused={isFocused || isOpen}
        hasValue={hasValue}
        error={error}
        required={required}
        mode={inputMode}
        isIcon={!!Icon || !!iconRight}
        labelSize={size}
      >
        <div
          ref={containerRef}
          className={`relative ${fullWidth ? "w-full" : ""}`}
        >
          <div
            ref={buttonRef}
            className={buttonClasses}
            onClick={() => !disabled && setIsOpen(!isOpen)}
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {hasLeftIcon && <FieldIcon icon={Icon} position="left" />}
              <span className="truncate">{getDisplayValue()}</span>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {clearable && hasValue && (
                <button
                  onClick={handleClear}
                  className="p-0.5 hover:bg-[var(--ui-background-tertiary)] rounded-full transition-colors"
                >
                  ✕
                </button>
              )}
              <FiChevronDown
                className={`${sizeStyles.icon} transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
              />
            </div>
          </div>

          {isOpen && !disabled && (
            <div
              className={`absolute ${getDropdownPosition(position)} left-0 right-0 z-50 bg-[var(--ui-background)] border border-[var(--ui-border)] rounded-lg shadow-xl overflow-hidden`}
            >
              {searchable && (
                <div className="p-2 border-b border-[var(--ui-border)]">
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchTerm}
                    onChange={handleSearch}
                    placeholder="Поиск..."
                    className="w-full px-3 py-2 text-sm bg-[var(--ui-background-secondary)] border border-[var(--ui-border)] rounded-md outline-none focus:border-[var(--ui-primary)]"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              )}

              <div
                className="overflow-y-auto"
                style={{ maxHeight: `${maxHeight}px` }}
              >
                {filteredOptions.length === 0 ? (
                  <div className="px-4 py-3 text-center text-[var(--ui-text-muted)] text-sm">
                    {noOptionsMessage}
                  </div>
                ) : (
                  filteredOptions.map((option) => (
                    <ComponentDropdownOption
                      handleSelect={handleSelect}
                      multiple={multiple}
                      option={option}
                      renderOption={renderOption}
                      selectedValue={selectedValue}
                    />
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </InputWrapper>
    );
  },
);

Dropdown.displayName = "Dropdown";
