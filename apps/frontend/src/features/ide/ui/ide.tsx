"use client";

import {
  CodeEnvironment,
  EnvironmentProvider,
  FileProvider,
  type FileNode,
} from "@/shared/ui/kit";

interface IProps {
  initialFiles?: FileNode[];
  className?: string;
  onRun: (files: FileNode[]) => void;
}

export const IDE: React.FC<IProps> = ({ initialFiles, className, onRun }) => (
  <FileProvider initialFileSystem={initialFiles}>
    <EnvironmentProvider>
      <CodeEnvironment onRun={onRun} className={className} />
    </EnvironmentProvider>
  </FileProvider>
);
