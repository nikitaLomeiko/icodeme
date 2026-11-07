import {
  ActionDispatch,
  ChangeEvent,
  useCallback,
  useContext,
  useReducer,
} from "react";
import { FileAction, FileNode } from "./types";
import { fileContext } from "./file.provider";
import { downloadAsZip, flattenTree } from "../../libs/utils/download-zip";
import { fileReducer, getAllFiles, initFileSystem } from "./file.reducer";

interface IProps {
  initialFileSystem?: FileNode;
}

interface UseExplorerReturn {
  files: FileNode[];
  allFiles: FileNode[];
  dispatch: ActionDispatch<[action: FileAction]> | null;
  handleFileImport: (e: ChangeEvent<HTMLInputElement, Element>) => void;
  handleFolderImport: (e: ChangeEvent<HTMLInputElement, Element>) => void;
  handleDownload: () => void;
  activeFileId: string | null;
  activeFile: FileNode | undefined;
  setActiveFileId: (value: string | null) => void;
}

export const useExplorer = (props: IProps = {}): UseExplorerReturn => {
  const {
    initialFileSystem = {
      children: [],
      content: "",
      id: "1",
      name: "hello",
      type: "file",
    },
  } = props;
  const context = useContext(fileContext);

  const [insulationFiles, dispatchInsulation] = useReducer(
    fileReducer,
    null,
    () => initFileSystem([initialFileSystem]),
  );

  if (!context) {
    return {
      files: insulationFiles,
      activeFile: getAllFiles(insulationFiles).find((f) => f.id === "1"),
      activeFileId: "1",
      allFiles: [],
      handleDownload: () => null,
      handleFileImport: () => null,
      handleFolderImport: () => null,
      setActiveFileId: () => null,
      dispatch: dispatchInsulation,
    };
  }

  const { files, dispatch } = context;

  const handleFileImport = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = e.target.files;
      if (!selectedFiles) return;

      const rootFolder = files.find((n) => n.type === "folder");
      const rootId = rootFolder?.id || "";

      Array.from(selectedFiles).forEach((file) => {
        const reader = new FileReader();
        reader.onload = (ev) => {
          const content = (ev.target?.result as string) || "";
          dispatch({
            type: "IMPORT_FILE",
            parentId: rootId,
            name: file.name,
            content,
          });
        };
        reader.readAsText(file);
      });

      e.target.value = "";
    },
    [dispatch, files],
  );

  const handleFolderImport = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = e.target.files;
      if (!selectedFiles) return;

      Array.from(selectedFiles).forEach((file) => {
        const fullPath = (file as any).webkitRelativePath || file.name;
        const reader = new FileReader();
        reader.onload = (ev) => {
          const content = (ev.target?.result as string) || "";
          dispatch({
            type: "IMPORT_FOLDER",
            path: fullPath,
            content,
          });
        };
        reader.readAsText(file);
      });

      e.target.value = "";
    },
    [dispatch],
  );

  const handleDownload = useCallback(() => {
    const flat = flattenTree(files);
    if (flat.length === 0) return;
    downloadAsZip(flat, "project");
  }, [files]);

  return { ...context, handleDownload, handleFileImport, handleFolderImport };
};
