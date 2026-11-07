"use client";

import { useEffect } from "react";
import { FileExplorer } from "./components/file.explorer";
import { CodeEditor } from "./components/code.editor";
import { CodePreview } from "./components/code.preview";
import { EmptyMessage } from "./components/empty.message";
import { CodeHeader } from "./components/code.header";
import { useExplorer } from "./store/file/use.explorer";
import { FileNode } from "./types/types";

interface IProps {
  onRun: (Files: FileNode[]) => void;
  className?: string;
}

export const CodeEnviroment: React.FC<IProps> = ({ onRun, className = "h-screen" }) => {
  const { activeFileId, allFiles, setActiveFileId, activeFile } = useExplorer();

  useEffect(() => {
    if (!activeFileId && allFiles.length > 0) {
      setActiveFileId(allFiles[0].id);
    }
  }, [allFiles, activeFileId, setActiveFileId]);

  return (
    <div className={`${className} flex flex-col bg-[var(--ui-background-tertiary)] rounded-lg`}>
      <CodeHeader onRun={(files) => onRun(files)} />

      <div className="flex-1 flex overflow-hidden ronded-lg">
        <FileExplorer />

        <main className="flex-1 flex flex-col overflow-hidden relative rounded-lg">
          {activeFile ? <CodeEditor /> : <EmptyMessage />}
        </main>
      </div>

      <CodePreview />
    </div>
  );
};
