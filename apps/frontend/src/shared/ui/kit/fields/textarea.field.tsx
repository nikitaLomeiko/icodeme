"use client";

import { forwardRef, useEffect, useRef } from "react";
import { InputWrapper } from "./wrapper/input.wrapper";
import { BaseTextareaProps } from "./types/field.props";
import {
  sizeStyles,
  variantStyles,
  disabledStyles,
  errorStyles,
  textareaBaseStyles,
} from "./styles/field.styles";
import { useInternal } from "./hooks/use.internal";
import { useFocused } from "./hooks/use.focused";
import { FieldIcon } from "./ui/field.icon";

export const TextareaField = forwardRef<HTMLTextAreaElement, BaseTextareaProps>(
  (props, forwardedRef) => {
    const {
      id,
      label,
      value,
      onChange,
      onFocus,
      onBlur,
      iconLeft,
      required = false,
      disabled = false,
      error,
      variant = "rounded",
      size = "md",
      fullWidth = false,
      className = "",
      inputMode = "floating",
      placeholder,
      rows = 4,
      maxLength,
      autoExpand = false,
      maxRows = 10,
      ...restProps
    } = props;

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const hasLeftIcon = !!iconLeft;

    const { handleChange, hasValue, internalValue } = useInternal({
      value,
      onChange,
    });

    const { handleBlur, handleFocus, isFocused } = useFocused({
      onFocus,
      onBlur,
    });

    useEffect(() => {
      if (autoExpand && textareaRef.current) {
        const textarea = textareaRef.current;

        // Сбрасываем высоту для корректного расчёта scrollHeight
        textarea.style.height = "auto";

        const computedStyle = window.getComputedStyle(textarea);
        const borderTopWidth = parseFloat(computedStyle.borderTopWidth) || 0;
        const borderBottomWidth =
          parseFloat(computedStyle.borderBottomWidth) || 0;
        const paddingTop = parseFloat(computedStyle.paddingTop) || 0;
        const paddingBottom = parseFloat(computedStyle.paddingBottom) || 0;

        const borderAndPadding =
          borderTopWidth + borderBottomWidth + paddingTop + paddingBottom;

        // Получаем line-height в пикселях
        let lineHeight = parseFloat(computedStyle.lineHeight);
        if (isNaN(lineHeight) || computedStyle.lineHeight === "normal") {
          // Для "normal" используем 1.2 * font-size (стандартное значение)
          const fontSize = parseFloat(computedStyle.fontSize) || 16;
          lineHeight = fontSize * 1.2;
        }

        const minRows = Math.min(rows, maxRows);
        const maxRowsLimit = maxRows;

        // scrollHeight уже включает border и padding, поэтому вычитаем их
        const contentHeight = textarea.scrollHeight - borderAndPadding;

        // Минимальная и максимальная высота контента (без border и padding)
        const minContentHeight = lineHeight * minRows;
        const maxContentHeight = lineHeight * maxRowsLimit;

        // Ограничиваем высоту контента
        const constrainedContentHeight = Math.max(
          minContentHeight,
          Math.min(contentHeight, maxContentHeight),
        );

        // Итоговая высота включает border и padding
        const newHeight = constrainedContentHeight + borderAndPadding;

        textarea.style.height = `${newHeight}px`;
      }
    }, [internalValue, autoExpand, rows, maxRows]);

    const inputStyles = `
      ${textareaBaseStyles}
      ${sizeStyles[size]}
      ${variantStyles[variant]}
      ${error ? errorStyles : ""}
      ${disabled ? disabledStyles : ""}
      ${fullWidth ? "w-full" : ""}
      ${hasLeftIcon ? "pl-10" : "pl-2"}
      ${autoExpand ? "overflow-y-hidden" : ""}
      ${className}
    `;

    return (
      <InputWrapper
        id={id}
        label={label}
        isFocused={isFocused}
        hasValue={hasValue}
        error={error}
        required={required}
        mode={inputMode}
        isIcon={hasLeftIcon}
        labelPosition={rows > 1 ? "top" : "center"}
        labelSize={size}
      >
        <div className="relative">
          {hasLeftIcon && (
            <FieldIcon icon={iconLeft} position="left" isTextarea />
          )}
          <textarea
            ref={(el) => {
              textareaRef.current = el;
              if (typeof forwardedRef === "function") {
                forwardedRef(el);
              } else if (forwardedRef) {
                forwardedRef.current = el;
              }
            }}
            id={id}
            value={internalValue}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            required={required}
            disabled={disabled}
            className={inputStyles}
            placeholder={placeholder}
            rows={rows}
            maxLength={maxLength}
            {...restProps}
          />
          {maxLength && (
            <span className="absolute bottom-2 right-2 text-[10px] text-gray-400">
              {String(internalValue).length}/{maxLength}
            </span>
          )}
        </div>
      </InputWrapper>
    );
  },
);

TextareaField.displayName = "TextareaField";
