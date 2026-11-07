import {
  FiArrowLeft,
  FiCopy,
  FiEye,
  FiMaximize2,
  FiMinimize2,
  FiMinus,
  FiPlus,
  FiSearch,
  FiPlay,
} from "react-icons/fi";
import { useRouter } from "next/navigation";
import { useExplorer } from "../store/file/use.explorer";
import { useEffect } from "react";
import { useEnviroment } from "../store/enviroment";
import { isHtmlFile } from "../libs/utils/build-document";
import { FileNode } from "../types/types";

interface IProps {
  onRun: (Files: FileNode[]) => void;
}

export const CodeHeader: React.FC<IProps> = ({ onRun }) => {
  const { activeFile, allFiles } = useExplorer();

  const { copied, fontSize, sidebarOpen, previewOpen, dispatch } =
    useEnviroment();

  const hasHtmlFile = allFiles.some(isHtmlFile);

  const router = useRouter();

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(
        () => dispatch?.({ type: "TOGGLE_COPIED" }),
        1500,
      );
      return () => clearTimeout(timer);
    }
  }, [copied, dispatch]);

  return (
    <header className="flex items-center gap-3 px-4 py-2 bg-[var(--ui-background-secondary)] rounded-t-lg border-b border-[var(--ui-primary)]/20 shrink-0">
      <button
        onClick={() => router.back()}
        className="rounded-lg hover:bg-[var(--ui-text)]/5 text-[var(--ui-text-muted)] hover:text-[var(--ui-primary)] transition-all"
        title="Back"
      >
        <FiArrowLeft className="w-4 h-4" />
      </button>

      <button
        onClick={() => dispatch?.({ type: "TOGGLE_SIDEBAR" })}
        className="rounded-lg hover:bg-[var(--ui-text)]/5 text-[var(--ui-text-muted)] hover:text-[var(--ui-primary)] transition-all"
      >
        {sidebarOpen ? (
          <FiMinimize2 className="w-4 h-4" />
        ) : (
          <FiMaximize2 className="w-4 h-4" />
        )}
      </button>

      <div className="flex items-center gap-1.5 ml-auto">
        <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-[var(--ui-text)]/5 border border-[var(--ui-border)]">
          <button
            type="button"
            onClick={() =>
              dispatch?.({
                type: "SET_FONT_SIZE",
                size: Math.max(10, fontSize - 1),
              })
            }
            disabled={fontSize <= 10}
            className="rounded hover:bg-[var(--ui-text)]/5 text-[var(--ui-text-muted)] hover:text-[var(--ui-primary)] transition-all p-0.5"
            title="Decrease font size"
          >
            <FiMinus className="w-3 h-3" />
          </button>
          <span className="text-[11px] text-[var(--ui-text-muted)] min-w-[20px] text-center select-none">
            {fontSize}
          </span>
          <button
            type="button"
            onClick={() =>
              dispatch?.({
                type: "SET_FONT_SIZE",
                size: Math.min(24, fontSize + 1),
              })
            }
            disabled={fontSize >= 24}
            className="rounded hover:bg-[var(--ui-text)]/5 text-[var(--ui-text-muted)] hover:text-[var(--ui-primary)] transition-all p-0.5"
            title="Increase font size"
          >
            <FiPlus className="w-3 h-3" />
          </button>
        </div>

        {activeFile && (
          <div className="relative">
            <button
              onClick={() => {
                navigator.clipboard.writeText(activeFile.content);
                dispatch?.({ type: "TOGGLE_COPIED" });
              }}
              className="rounded-lg p-1.5 hover:bg-[var(--ui-text)]/5 text-[var(--ui-text-muted)] hover:text-[var(--ui-primary)] transition-all"
              title="Copy all code"
            >
              <FiCopy className="w-3.5 h-3.5" />
            </button>
            {copied && (
              <span className="absolute top-full left-1/2 -translate-x-1/2 mt-0.5 text-[10px] text-[var(--ui-success)] whitespace-nowrap pointer-events-none">
                Copied!
              </span>
            )}
          </div>
        )}

        {activeFile && (
          <button
            onClick={() => dispatch?.({ type: "TOGGLE_SEARCH" })}
            className="rounded-lg p-1.5 hover:bg-[var(--ui-text)]/5 text-[var(--ui-text-muted)] hover:text-[var(--ui-primary)] transition-all"
            title="Search in code"
          >
            <FiSearch className="w-3.5 h-3.5" />
          </button>
        )}

        {activeFile && (
          <button
            onClick={() => onRun(allFiles)}
            className="rounded-lg p-1.5 hover:bg-[var(--ui-text)]/5 text-[var(--ui-text-muted)] hover:text-[var(--ui-primary)] transition-all"
            title="Run code"
          >
            <FiPlay className="w-3.5 h-3.5" />
          </button>
        )}

        {hasHtmlFile && (
          <button
            onClick={() => dispatch?.({ type: "TOGGLE_PREVIEW" })}
            className={`rounded-lg p-1.5 hover:bg-[var(--ui-text)]/5 transition-all ${
              previewOpen
                ? "text-[var(--ui-primary)] bg-[var(--ui-text)]/5"
                : "text-[var(--ui-text-muted)] hover:text-[var(--ui-primary)]"
            }`}
            title="Preview"
          >
            <FiEye className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </header>
  );
};
