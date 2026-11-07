import React, { useCallback, useEffect } from "react";
import { highlightCode } from "../../libs/utils/highlight";

interface IProps {
  activeLine: number;
  scrollTop: number;
  highlightRef: React.RefObject<HTMLDivElement | null>;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  valueRef: React.RefObject<string>;
  value: string;
  searchHighlighted: string;
  onChange: (value: string) => void;
  onToggleSearch: () => void;
  onUpdateActiveLine: () => void;
}

export const EditorArea: React.FC<IProps> = (props) => {
  const {
    activeLine,
    highlightRef,
    scrollTop,
    value,
    textareaRef,
    onToggleSearch,
    onUpdateActiveLine,
    searchHighlighted,
    valueRef,
    onChange,
  } = props;

  const highlighted = highlightCode(value);

  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    if (value !== valueRef.current) {
      const prevLen = valueRef.current.length;
      valueRef.current = value;
      ta.value = value;
      if (Math.abs(value.length - prevLen) > 1) {
        ta.selectionStart = ta.selectionEnd = value.length;
      }
    }
  }, [value]);

  const syncValue = useCallback(
    (newValue: string) => {
      valueRef.current = newValue;
      onChange(newValue);
    },
    [onChange],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      const ta = e.currentTarget;
      const currentVal = valueRef.current;

      if ((e.ctrlKey || e.metaKey) && e.key === "f") {
        e.preventDefault();
        onToggleSearch?.();
        return;
      }

      if (e.key === "Tab") {
        e.preventDefault();
        const start = ta.selectionStart;
        const end = ta.selectionEnd;
        const newValue =
          currentVal.substring(0, start) + "  " + currentVal.substring(end);
        ta.value = newValue;
        valueRef.current = newValue;
        syncValue(newValue);
        requestAnimationFrame(() => {
          ta.selectionStart = ta.selectionEnd = start + 2;
          onUpdateActiveLine();
        });
        return;
      }

      if (e.key === ">") {
        e.preventDefault();
        const start = ta.selectionStart;
        const end = ta.selectionEnd;

        const beforeCursor = currentVal.substring(0, start);
        const tagMatch = beforeCursor.match(
          /<([a-zA-Z][a-zA-Z0-9]*)(?:\s[^>]*)?$/,
        );
        const emptyTagMatch = !tagMatch && beforeCursor.match(/<$/);

        let insertText = ">";

        if (tagMatch) {
          const tagName = tagMatch[1];
          insertText = ">" + `</${tagName}>`;
        } else if (emptyTagMatch) {
          insertText = "></>";
        }

        const newValue =
          currentVal.substring(0, start) +
          insertText +
          currentVal.substring(end);
        ta.value = newValue;
        valueRef.current = newValue;
        syncValue(newValue);
        requestAnimationFrame(() => {
          ta.selectionStart = ta.selectionEnd = start + 1;
          onUpdateActiveLine();
        });
        return;
      }

      const pairs: Record<string, string> = {
        "(": ")",
        "[": "]",
        "{": "}",
      };
      if (e.key in pairs) {
        e.preventDefault();
        const start = ta.selectionStart;
        const end = ta.selectionEnd;
        const newValue =
          currentVal.substring(0, start) +
          e.key +
          pairs[e.key] +
          currentVal.substring(end);
        ta.value = newValue;
        valueRef.current = newValue;
        syncValue(newValue);
        requestAnimationFrame(() => {
          ta.selectionStart = ta.selectionEnd = start + 1;
          onUpdateActiveLine();
        });
        return;
      }
    },
    [syncValue, onUpdateActiveLine, onToggleSearch],
  );

  const handleInput = useCallback(
    (e: React.FormEvent<HTMLTextAreaElement>) => {
      const newValue = (e.target as HTMLTextAreaElement).value;
      valueRef.current = newValue;
      syncValue(newValue);
    },
    [syncValue],
  );

  return (
    <div className="flex-1 relative">
      <div
        className="absolute pointer-events-none bg-[var(--ui-primary)]/5 border-l-2 border-[var(--ui-primary)]/40"
        style={{
          top: `${activeLine * 1.6}em`,
          height: "1.6em",
          left: 0,
          right: 0,
          transform: `translateY(-${scrollTop}px)`,
        }}
      />

      <div
        ref={highlightRef}
        className="absolute inset-0 overflow-hidden pointer-events-none"
        aria-hidden="true"
        style={{ padding: "0 0 0 8px", boxSizing: "border-box", zIndex: 2 }}
      >
        <div style={{ transform: `translateY(-${scrollTop}px)` }}>
          <pre
            style={{
              margin: 0,
              padding: 0,
              border: 0,
              background: "transparent",
              font: "inherit",
              letterSpacing: "inherit",
              fontVariantLigatures: "inherit",
              fontFeatureSettings: "inherit",
              tabSize: 2,
              whiteSpace: "pre-wrap",
              wordBreak: "break-all",
            }}
          >
            <code
              style={{
                color: "var(--ui-text)",
                font: "inherit",
                letterSpacing: "inherit",
                fontVariantLigatures: "inherit",
                fontFeatureSettings: "inherit",
                whiteSpace: "pre-wrap",
                wordBreak: "break-all",
              }}
              dangerouslySetInnerHTML={{ __html: highlighted }}
            />
          </pre>
        </div>
      </div>

      {searchHighlighted && (
        <div
          className="absolute inset-0 overflow-hidden pointer-events-none"
          aria-hidden="true"
          style={{ padding: "0 0 0 8px", boxSizing: "border-box", zIndex: 3 }}
        >
          <div style={{ transform: `translateY(-${scrollTop}px)` }}>
            <pre
              style={{
                margin: 0,
                padding: 0,
                border: 0,
                background: "transparent",
                font: "inherit",
                letterSpacing: "inherit",
                fontVariantLigatures: "inherit",
                fontFeatureSettings: "inherit",
                tabSize: 2,
                whiteSpace: "pre-wrap",
                wordBreak: "break-all",
              }}
            >
              <code
                style={{
                  color: "transparent",
                  font: "inherit",
                  letterSpacing: "inherit",
                  fontVariantLigatures: "inherit",
                  fontFeatureSettings: "inherit",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-all",
                }}
                dangerouslySetInnerHTML={{ __html: searchHighlighted }}
              />
            </pre>
          </div>
        </div>
      )}

      <textarea
        ref={textareaRef}
        defaultValue={value}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
        autoComplete="off"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          padding: "0 0 0 8px",
          margin: 0,
          border: 0,
          outline: "none",
          background: "transparent",
          color: "transparent",
          WebkitTextFillColor: "transparent",
          caretColor: "var(--ui-text)",
          resize: "none",
          overflow: "auto",
          boxSizing: "border-box",
          font: "inherit",
          letterSpacing: "inherit",
          fontVariantLigatures: "inherit",
          fontFeatureSettings: "inherit",
          tabSize: 2,
          whiteSpace: "pre-wrap",
          wordBreak: "break-all",
          WebkitAppearance: "none",
          MozAppearance: "none",
          boxShadow: "none",
          zIndex: 1,
        }}
      />
      <style>{`
        .hl-keyword { color: var(--ui-primary); }
        .hl-string { color: var(--ui-success); }
        .hl-number { color: var(--ui-warning); }
        .hl-comment { color: var(--ui-text-muted); font-style: italic; }
        .hl-function { color: var(--ui-info); }
        .hl-type { color: var(--ui-info); }
        .hl-tag { color: var(--ui-error); }
        .hl-tag-name { color: var(--ui-warning); }
        .hl-attr { color: var(--ui-primary-hover); }
        .hl-property { color: var(--ui-primary-hover); }
        .hl-bracket { color: var(--ui-warning); }
        .hl-search { background: rgba(255, 255, 0, 0.25); border-radius: 2px; }
        .hl-search-current { background: rgba(255, 200, 0, 0.5); border-radius: 2px; outline: 1px solid rgba(255, 200, 0, 0.8); }
      `}</style>
    </div>
  );
};
