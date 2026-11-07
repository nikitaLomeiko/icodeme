import {
  downloadMarkdownAsPdf,
  downloadMarkdownAsHtml,
  downloadMarkdownAsTxt,
  downloadMarkdown,
} from "../../../model/utils";
import { observer } from "mobx-react-lite";
import React, { useCallback, useEffect } from "react";
import { FiMaximize2, FiMinimize2 } from "react-icons/fi";
import { Dropdown, fontSize } from "@/shared/ui/kit";
import { documentOptionStore } from "@/entities/document/model";

interface IProps {}

export const OptionMenu: React.FC<IProps> = observer((props) => {
  const {
    fontSize,
    isZenMode,
    setFontSize,
    toggleZenMode,
    content,
    title,
    toggleOptionMenu,
  } = documentOptionStore;

  const handleDownloadPdf = useCallback(async () => {
    await downloadMarkdownAsPdf(content, title);
    toggleOptionMenu();
  }, [content, title]);

  const handleDownloadTxt = useCallback(() => {
    downloadMarkdownAsTxt(content, title);
    toggleOptionMenu();
  }, [content, title]);

  const handleDownloadMd = useCallback(() => {
    downloadMarkdown(content, title);
    toggleOptionMenu();
  }, [content, title]);

  const handleDownloadHtml = useCallback(() => {
    downloadMarkdownAsHtml(content, title);
    toggleOptionMenu();
  }, [content, title]);

  const handleToggleZenMode = () => {
    toggleZenMode();
    toggleOptionMenu();
  };
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isZenMode) {
        toggleZenMode();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isZenMode]);

  useEffect(() => {
    if (isZenMode) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [isZenMode]);

  return (
    <div className="absolute right-0 mt-2 w-56 bg-[var(--ui-background-secondary)] rounded-lg shadow-xl border border-[var(--ui-border)] overflow-hidden z-50">
      <div className="py-1">
        <div className="px-3 py-2">
          <div className="text-xs text-[var(--ui-text)] mb-2">
            Размер текста
          </div>
          <Dropdown
            value={fontSize}
            onChange={(e) => setFontSize(e as fontSize)}
            id="sg"
            options={[
              { label: "Маленький", value: "sm", description: "14px" },
              { label: "Средний", value: "md", description: "16px" },
              { label: "Большой", value: "lg", description: "18px" },
              { label: "Очень большой", value: "xlg", description: "20px" },
            ]}
          />
        </div>

        <div className="border-t border-[var(--ui-border)] my-1"></div>

        <div className="px-3 py-2">
          <div className="text-xs text-[var(--ui-text)] mb-2">Скачать как</div>
          <div className="space-y-1">
            <button
              onClick={handleDownloadPdf}
              className="w-full text-left px-2 py-1.5 text-sm text-[var(--ui-text)]/50 hover:bg-[var(--ui-background-tertiary)]/50 rounded transition-colors cursor-pointer"
            >
              PDF
            </button>
            <button
              onClick={handleDownloadTxt}
              className="w-full text-left px-2 py-1.5 text-sm text-[var(--ui-text)]/50 hover:bg-[var(--ui-background-tertiary)]/50 rounded transition-colors cursor-pointer"
            >
              TXT
            </button>
            <button
              onClick={handleDownloadHtml}
              className="w-full text-left px-2 py-1.5 text-sm text-[var(--ui-text)]/50 hover:bg-[var(--ui-background-tertiary)]/50 rounded transition-colors cursor-pointer"
            >
              HTML
            </button>
            <button
              onClick={handleDownloadMd}
              className="w-full text-left px-2 py-1.5 text-sm text-[var(--ui-text)]/50 hover:bg-[var(--ui-background-tertiary)]/50 rounded transition-colors cursor-pointer"
            >
              Markdown
            </button>
          </div>
        </div>

        <div className="border-t border-[var(--ui-border)] my-1"></div>

        <button
          onClick={handleToggleZenMode}
          className="w-full text-left px-3 py-2 text-sm text-[var(--ui-text)] hover:bg-[var(--ui-background-tertiary)]/10 transition-colors flex items-center gap-2 cursor-pointer"
        >
          {isZenMode ? (
            <FiMinimize2 className="w-4 h-4" />
          ) : (
            <FiMaximize2 className="w-4 h-4" />
          )}
          {isZenMode ? "Выйти из Zen режима" : "Zen режим"}
        </button>
      </div>
    </div>
  );
});
