import {
  ActionDispatch,
  createContext,
  useCallback,
  useMemo,
  useLayoutEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import { FileAction, FileNode } from "./types";
import {
  fileReducer,
  findNodeById,
  getAllFiles,
  getFirstFile,
  initFileSystem,
} from "./file.reducer";
import { generateId } from "@/shared/lib";

interface IProps {
  children: React.ReactNode;
  initialFileSystem?: FileNode[];
}

export interface IFileTreeContext {
  files: FileNode[];
}

export interface IFileSelectionContext {
  activeFileId: string | null;
  setActiveFileId: (value: string | null) => void;
}

export interface IFileDispatchContext {
  dispatch: ActionDispatch<[action: FileAction]>;
}

export interface IFileMetadataContext {
  hasHtmlFile: boolean;
}

export const fileTreeContext = createContext<IFileTreeContext | null>(null);
export const fileTreeGetterContext = createContext<() => FileNode[]>(() => []);
export const fileSelectionContext = createContext<IFileSelectionContext | null>(
  null,
);
export const activeFileContext = createContext<FileNode | undefined>(undefined);
export const hasActiveFileContext = createContext(false);
export const activeFileGetterContext = createContext<
  () => FileNode | undefined
>(() => undefined);
export const fileDispatchContext = createContext<IFileDispatchContext | null>(
  null,
);
export const fileMetadataContext = createContext<IFileMetadataContext | null>(
  null,
);

export const FileProvider: React.FC<IProps> = (props) => {
  const { initialFileSystem = [] } = props;

  const [files, dispatchFiles] = useReducer(fileReducer, null, () =>
    initFileSystem(initialFileSystem),
  );
  const [structureVersion, bumpStructureVersion] = useReducer(
    (version: number) => version + 1,
    0,
  );
  const [activeFileId, setActiveFileId] = useState<string | null>(
    () => getFirstFile(initialFileSystem)?.id ?? null,
  );
  const filesRef = useRef(files);
  const activeFileIdRef = useRef(activeFileId);
  useLayoutEffect(() => {
    filesRef.current = files;
    activeFileIdRef.current = activeFileId;
  }, [files, activeFileId]);

  const dispatch = useCallback(
    (action: FileAction) => {
      let nextAction = action;
      if (action.type === "CREATE_FILE") {
        nextAction = { ...action, id: action.id ?? generateId() };
        setActiveFileId(nextAction.id ?? null);
      } else if (action.type === "DELETE") {
        const nextFiles = fileReducer(filesRef.current, action);
        if (!findNodeById(nextFiles, activeFileIdRef.current)) {
          setActiveFileId(getFirstFile(nextFiles)?.id ?? null);
        }
      }

      dispatchFiles(nextAction);
      if (action.type !== "UPDATE_CONTENT") bumpStructureVersion();
    },
    [dispatchFiles, bumpStructureVersion, setActiveFileId],
  );
  const activeFile = useMemo(
    () => findNodeById(files, activeFileId),
    [files, activeFileId],
  );
  const activeFileRef = useRef(activeFile);
  useLayoutEffect(() => {
    activeFileRef.current = activeFile;
  }, [activeFile]);
  const getActiveFile = useCallback(() => activeFileRef.current, []);

  const treeValue = useMemo(() => ({ files }), [files]);
  const getFileTree = useCallback(() => {
    const [root] = filesRef.current;
    // `src` is the editor's synthetic root. Keep user-created subfolders, but
    // map files directly in that root to the container's /app directory.
    return root?.type === "folder" && root.name === "src"
      ? root.children
      : filesRef.current;
  }, []);
  const hasHtmlFile = useMemo(
    () =>
      getAllFiles(files).some((file) =>
        file.name.toLowerCase().endsWith(".html"),
      ),
    // Content edits do not affect file extensions or the project structure.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [structureVersion],
  );
  const metadataValue = useMemo(() => ({ hasHtmlFile }), [hasHtmlFile]);
  const selectionValue = useMemo(
    () => ({ activeFileId, setActiveFileId }),
    [activeFileId, setActiveFileId],
  );
  const dispatchValue = useMemo(() => ({ dispatch }), [dispatch]);

  return (
    <fileDispatchContext.Provider value={dispatchValue}>
      <fileMetadataContext.Provider value={metadataValue}>
        <fileSelectionContext.Provider value={selectionValue}>
          <activeFileContext.Provider value={activeFile}>
            <activeFileGetterContext.Provider value={getActiveFile}>
              <fileTreeGetterContext.Provider value={getFileTree}>
                <hasActiveFileContext.Provider value={Boolean(activeFile)}>
                  <fileTreeContext.Provider value={treeValue}>
                    {props.children}
                  </fileTreeContext.Provider>
                </hasActiveFileContext.Provider>
              </fileTreeGetterContext.Provider>
            </activeFileGetterContext.Provider>
          </activeFileContext.Provider>
        </fileSelectionContext.Provider>
      </fileMetadataContext.Provider>
    </fileDispatchContext.Provider>
  );
};
