import { generateId } from "@/shared/lib/utils/generate-id";
import { FileAction, FileNode } from "./types";

export function initFileSystem(initialNode: FileNode[] = []): FileNode[] {
  const src: FileNode = {
    id: generateId(),
    name: "src",
    type: "folder",
    content: "",
    children: initialNode,
  };

  return [src];
}

export function getAllFiles(nodes: FileNode[]): FileNode[] {
  const result: FileNode[] = [];
  function walk(list: FileNode[]) {
    for (const node of list) {
      if (node.type === "file") result.push(node);
      if (node.children) walk(node.children);
    }
  }
  walk(nodes);
  return result;
}

function findNode(nodes: FileNode[], id: string): FileNode | null {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.children) {
      const found = findNode(node.children, id);
      if (found) return found;
    }
  }
  return null;
}

function removeNode(nodes: FileNode[], id: string): FileNode[] {
  return nodes
    .filter((n) => n.id !== id)
    .map((n) => ({
      ...n,
      children: n.type === "folder" ? removeNode(n.children, id) : n.children,
    }));
}

function addToFolder(
  nodes: FileNode[],
  parentId: string,
  newNode: FileNode,
): FileNode[] {
  return nodes.map((n) => {
    if (n.id === parentId && n.type === "folder") {
      return { ...n, children: [...n.children, newNode] };
    }
    if (n.children) {
      return { ...n, children: addToFolder(n.children, parentId, newNode) };
    }
    return n;
  });
}

function renameNode(nodes: FileNode[], id: string, name: string): FileNode[] {
  return nodes.map((n) => {
    if (n.id === id) return { ...n, name };
    if (n.children) {
      return { ...n, children: renameNode(n.children, id, name) };
    }
    return n;
  });
}

function updateContent(
  nodes: FileNode[],
  id: string,
  content: string,
): FileNode[] {
  return nodes.map((n) => {
    if (n.id === id) return { ...n, content };
    if (n.children) {
      return { ...n, children: updateContent(n.children, id, content) };
    }
    return n;
  });
}

function moveNode(
  nodes: FileNode[],
  id: string,
  targetParentId: string,
): FileNode[] {
  const nodeToMove = findNode(nodes, id);
  if (!nodeToMove) return nodes;

  const withoutSource = removeNode(nodes, id);
  const movedNode = { ...nodeToMove };

  return addToFolder(withoutSource, targetParentId, movedNode);
}

function ensurePath(
  nodes: FileNode[],
  path: string,
  rootId: string,
): [FileNode[], string] {
  const parts = path.split("/");
  let currentId = rootId;
  let result = nodes;

  for (const part of parts) {
    const parent = findNode(result, currentId);
    if (!parent || parent.type !== "folder") return [result, ""];

    let folder = parent.children.find(
      (n) => n.type === "folder" && n.name === part,
    );
    if (!folder) {
      folder = {
        id: generateId(),
        name: part,
        type: "folder",
        content: "",
        children: [],
      };
      result = addToFolder(result, currentId, folder);
    }
    currentId = folder.id;
  }

  return [result, currentId];
}

export function fileReducer(state: FileNode[], action: FileAction): FileNode[] {
  switch (action.type) {
    case "CREATE_FILE": {
      const newNode: FileNode = {
        id: generateId(),
        name: action.name,
        type: "file",
        content: "",
        children: [],
      };
      return addToFolder(state, action.parentId, newNode);
    }
    case "CREATE_FOLDER": {
      const newNode: FileNode = {
        id: generateId(),
        name: action.name,
        type: "folder",
        content: "",
        children: [],
      };
      return addToFolder(state, action.parentId, newNode);
    }
    case "DELETE":
      return removeNode(state, action.id);
    case "RENAME":
      return renameNode(state, action.id, action.name);
    case "UPDATE_CONTENT":
      return updateContent(state, action.id, action.content);
    case "MOVE":
      return moveNode(state, action.id, action.targetParentId);
    case "IMPORT_FILE": {
      const newNode: FileNode = {
        id: generateId(),
        name: action.name,
        type: "file",
        content: action.content,
        children: [],
      };
      return addToFolder(state, action.parentId, newNode);
    }
    case "IMPORT_FOLDER": {
      const rootFolder = state.find((n) => n.type === "folder");
      const rootId = rootFolder?.id || "";
      if (!rootId) return state;
      const [newState, parentId] = ensurePath(state, action.path, rootId);
      const fileName = action.path.split("/").pop()!;
      const fileNode: FileNode = {
        id: generateId(),
        name: fileName,
        type: "file",
        content: action.content,
        children: [],
      };
      return addToFolder(newState, parentId, fileNode);
    }
    default:
      return state;
  }
}
