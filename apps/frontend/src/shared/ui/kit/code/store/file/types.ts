export interface FileNode {
  id: string;
  name: string;
  type: "file" | "folder";
  content: string;
  children: FileNode[];
}

export type FileAction =
  | { type: "CREATE_FILE"; parentId: string; name: string }
  | { type: "CREATE_FOLDER"; parentId: string; name: string }
  | { type: "DELETE"; id: string }
  | { type: "RENAME"; id: string; name: string }
  | { type: "UPDATE_CONTENT"; id: string; content: string }
  | { type: "MOVE"; id: string; targetParentId: string }
  | { type: "IMPORT_FILE"; parentId: string; name: string; content: string }
  | { type: "IMPORT_FOLDER"; path: string; content: string };

export interface IFileContext {
  files: FileNode[];
}
