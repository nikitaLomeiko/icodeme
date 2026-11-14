import {
  ActionDispatch,
  ChangeEvent,
  useCallback,
  useContext,
  useReducer,
} from "react";
import { FileAction, FileNode } from "./types";
import {
  activeFileContext,
  activeFileGetterContext,
  fileDispatchContext,
  fileMetadataContext,
  fileSelectionContext,
  fileTreeContext,
  fileTreeGetterContext,
  hasActiveFileContext,
} from "./file.provider";
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
  const treeContext = useContext(fileTreeContext);
  const selectionContext = useContext(fileSelectionContext);
  const dispatchContext = useContext(fileDispatchContext);
  const selectedFileContext = useContext(activeFileContext);

  const [insulationFiles, dispatchInsulation] = useReducer(
    fileReducer,
    null,
    () => initFileSystem([initialFileSystem]),
  );

  const files = treeContext?.files ?? insulationFiles;
  const allFiles = getAllFiles(files);
  const dispatch = dispatchContext?.dispatch ?? dispatchInsulation;
  const activeFileId = selectionContext?.activeFileId ?? "1";
  const activeFile =
    selectedFileContext ??
    getAllFiles(insulationFiles).find((file) => file.id === "1");
  const setActiveFileId =
    selectionContext?.setActiveFileId ?? (() => undefined);

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
        const fullPath =
          (file as File & { webkitRelativePath?: string }).webkitRelativePath ||
          file.name;
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

  return {
    files,
    allFiles,
    dispatch,
    activeFileId,
    activeFile,
    setActiveFileId,
    handleDownload,
    handleFileImport,
    handleFolderImport,
  };
};

export const useFileTree = () => {
  const context = useContext(fileTreeContext);
  return context ?? { files: [] };
};

export const useGetFileTree = () => useContext(fileTreeGetterContext);

export const useFileMetadata = () => {
  const context = useContext(fileMetadataContext);
  return context ?? { hasHtmlFile: false };
};

export const useFileSelection = () => {
  const context = useContext(fileSelectionContext);
  return (
    context ?? {
      activeFileId: null,
      setActiveFileId: () => undefined,
    }
  );
};

export const useActiveFile = () => useContext(activeFileContext);

export const useHasActiveFile = () => useContext(hasActiveFileContext);

export const useGetActiveFile = () => useContext(activeFileGetterContext);

export const useFileDispatch = () => {
  const context = useContext(fileDispatchContext);
  return context?.dispatch ?? null;
};

export const useFileImports = () => {
  const { files } = useFileTree();
  const dispatch = useFileDispatch();
  const rootId = files.find((node) => node.type === "folder")?.id ?? "";

  const handleFileImport = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = event.target.files;
      if (!selectedFiles || !dispatch) return;

      for (const file of Array.from(selectedFiles)) {
        const reader = new FileReader();
        reader.onload = (loadEvent) => {
          dispatch({
            type: "IMPORT_FILE",
            parentId: rootId,
            name: file.name,
            content: (loadEvent.target?.result as string) || "",
          });
        };
        reader.readAsText(file);
      }

      event.target.value = "";
    },
    [dispatch, rootId],
  );

  const handleFolderImport = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = event.target.files;
      if (!selectedFiles || !dispatch) return;

      for (const file of Array.from(selectedFiles)) {
        const path =
          (file as File & { webkitRelativePath?: string }).webkitRelativePath ||
          file.name;
        const reader = new FileReader();
        reader.onload = (loadEvent) => {
          dispatch({
            type: "IMPORT_FOLDER",
            path,
            content: (loadEvent.target?.result as string) || "",
          });
        };
        reader.readAsText(file);
      }

      event.target.value = "";
    },
    [dispatch],
  );

  return { handleFileImport, handleFolderImport };
};
