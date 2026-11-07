import {
  ActionDispatch,
  createContext,
  useMemo,
  useReducer,
  useState,
} from "react";
import { FileAction, FileNode } from "./types";
import { fileReducer, getAllFiles, initFileSystem } from "./file.reducer";

interface UseExplorerReturn {
  files: FileNode[];
  allFiles: FileNode[];
  dispatch: ActionDispatch<[action: FileAction]>;
  activeFileId: string | null;
  activeFile: FileNode | undefined;
  setActiveFileId: (value: string | null) => void;
}

interface IProps {
  children: React.ReactNode;
  initialFileSystem?: FileNode[];
}

export const fileContext = createContext<UseExplorerReturn | null>(null);

export const FileProvider: React.FC<IProps> = (props) => {
  const { children, initialFileSystem = [] } = props;

  const [files, dispatch] = useReducer(fileReducer, null, () =>
    initFileSystem(initialFileSystem),
  );
  const [activeFileId, setActiveFileId] = useState<string | null>(null);

  const allFiles = useMemo(() => getAllFiles(files), [files]);

  const activeFile = useMemo(
    () => allFiles.find((f) => f.id === activeFileId),
    [allFiles, activeFileId],
  );

  const value = {
    files,
    allFiles,
    dispatch,
    activeFileId,
    activeFile,
    setActiveFileId,
  };

  return <fileContext.Provider value={value}>{children}</fileContext.Provider>;
};
