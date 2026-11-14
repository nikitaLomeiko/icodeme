"use client";

import { FileExplorer } from "./components/file.explorer";
import { CodeEditor } from "./components/code.editor";
import { CodePreview } from "./components/code.preview";
import { EmptyMessage } from "./components/empty.message";
import { CodeHeader } from "./components/code.header";
import { useHasActiveFile } from "./store/file/use.explorer";
import { FileNode } from "./types/types";

interface IProps {
  onRun: (files: FileNode[]) => void;
  className?: string;
}

export const CodeEnvironment: React.FC<IProps> = ({
  onRun,
  className = "h-screen",
}) => {
  const hasActiveFile = useHasActiveFile();

  return (
    <div
      className={`${className} flex flex-col bg-[var(--ui-background-tertiary)] rounded-lg`}
    >
      <CodeHeader onRun={(files) => onRun(files)} />

      <div className="flex-1 flex overflow-hidden ronded-lg">
        <FileExplorer />

        <main className="flex-1 flex flex-col overflow-hidden relative rounded-lg">
          {hasActiveFile ? <CodeEditor /> : <EmptyMessage />}
        </main>
      </div>

      <CodePreview />
    </div>
  );
};
