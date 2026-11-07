"use client";

import { useRef, useCallback, useEffect, useState, useMemo } from "react";
import { searchHighlight } from "../libs/utils/search.highlight";
import { LineNumbers } from "./ui/line-numbers";
import { EditorArea } from "./ui/editor.area";
import { MatchCount } from "../libs/utils/match-count";
import { EditorHeader } from "./ui/editor.header";
import { EditorSearch } from "./ui/editor.search";
import { useExplorer } from "../store/file/use.explorer";
import { useEnviroment } from "../store/enviroment";
import { FileNode } from "../types/types";

interface IProps {
  initialFile?: FileNode;
  onChangeContent?: (content: string) => void;
}

export const CodeEditor: React.FC<IProps> = (props) => {
  const { onChangeContent, initialFile } = props;

  const { activeFile, activeFileId, dispatch } = useExplorer({
    initialFileSystem: initialFile,
  });
  const { showSearch, fontSize, dispatch: dispatchEnv } = useEnviroment();

  const value = activeFile?.content || "";

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);

  const valueRef = useRef(value);
  const searchRef = useRef<HTMLInputElement>(null);

  const [scrollTop, setScrollTop] = useState(0);
  const [activeLine, setActiveLine] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentMatch, setCurrentMatch] = useState(0);

  const matchCounted = useMemo(
    () => MatchCount(searchQuery, value),
    [value, searchQuery],
  );
  const searchHighlighted = useMemo(
    () => searchHighlight(searchQuery, value, currentMatch),
    [value, searchQuery, currentMatch],
  );

  const lines = value.split("\n");
  const lineCount = lines.length;

  const updateActiveLine = useCallback(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    const currentVal = valueRef.current;
    const line =
      currentVal.substring(0, ta.selectionStart).split("\n").length - 1;
    setActiveLine(line);
  }, []);

  const handleContentChange = useCallback(
    (content: string) => {
      if (activeFileId) {
        dispatch?.({ type: "UPDATE_CONTENT", id: activeFileId, content });
        onChangeContent?.(content);
      }
    },
    [activeFileId],
  );

  useEffect(() => {
    updateActiveLine();
  }, [value, updateActiveLine]);

  const handleScroll = useCallback(() => {
    if (textareaRef.current) {
      setScrollTop(textareaRef.current.scrollTop);
    }
  }, []);

  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.addEventListener("scroll", handleScroll);
    const onSelectionChange = () => {
      if (document.activeElement === ta) updateActiveLine();
    };
    document.addEventListener("selectionchange", onSelectionChange);
    return () => {
      ta.removeEventListener("scroll", handleScroll);
      document.removeEventListener("selectionchange", onSelectionChange);
    };
  }, [handleScroll, updateActiveLine]);

  return (
    <div className="h-screen flex flex-col bg-[var(--ui-background-tertiary)]">
      <EditorHeader fileName={activeFile?.name || ""} lineCount={lineCount} />
      {showSearch && (
        <EditorSearch
          setCurrentMatch={setCurrentMatch}
          setSearchQuery={setSearchQuery}
          currentMatch={currentMatch}
          matchCounted={matchCounted}
          onToggleSearch={() => dispatchEnv?.({ type: "TOGGLE_SEARCH" })}
          searchQuery={searchQuery}
          searchRef={searchRef}
        />
      )}
      <div
        className="flex-1 relative overflow-hidden"
        style={{
          fontFamily:
            "var(--font-geist-mono), 'Geist Mono', 'JetBrains Mono', 'Fira Code', monospace",
          fontSize,
          fontWeight: 600,
          lineHeight: 1.6,
          letterSpacing: 0,
          fontVariantLigatures: "none",
          fontFeatureSettings: '"liga" 0, "calt" 0',
        }}
      >
        <div className="absolute inset-0 flex">
          <LineNumbers
            activeLine={activeLine}
            lineCount={lineCount}
            scrollTop={scrollTop}
          />

          <EditorArea
            activeLine={activeLine}
            highlightRef={highlightRef}
            scrollTop={scrollTop}
            searchHighlighted={searchHighlighted}
            textareaRef={textareaRef}
            valueRef={valueRef}
            onChange={handleContentChange}
            onToggleSearch={() => dispatchEnv?.({ type: "TOGGLE_SEARCH" })}
            onUpdateActiveLine={updateActiveLine}
            value={value}
          />
        </div>
      </div>
    </div>
  );
};
