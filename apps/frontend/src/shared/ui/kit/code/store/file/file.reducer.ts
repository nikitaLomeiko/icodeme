import { generateId } from "@/shared/lib";
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

export function getFirstFile(nodes: FileNode[]): FileNode | undefined {
  for (const node of nodes) {
    if (node.type === "file") return node;
    const nested = getFirstFile(node.children);
    if (nested) return nested;
  }
  return undefined;
}

export function findNodeById(
  nodes: FileNode[],
  id: string | null,
): FileNode | undefined {
  if (!id) return undefined;
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.children) {
      const found = findNodeById(node.children, id);
      if (found) return found;
    }
  }
  return undefined;
}

function removeNode(nodes: FileNode[], id: string): FileNode[] {
  let changed = false;
  const next: FileNode[] = [];

  for (const node of nodes) {
    if (node.id === id) {
      changed = true;
      continue;
    }

    if (node.type === "folder") {
      const children = removeNode(node.children, id);
      if (children !== node.children) {
        changed = true;
        next.push({ ...node, children });
        continue;
      }
    }

    next.push(node);
  }

  return changed ? next : nodes;
}

function addToFolder(
  nodes: FileNode[],
  parentId: string,
  newNode: FileNode,
): FileNode[] {
  for (let index = 0; index < nodes.length; index++) {
    const node = nodes[index];
    if (node.id === parentId && node.type === "folder") {
      const next = nodes.slice();
      next[index] = { ...node, children: [...node.children, newNode] };
      return next;
    }

    if (node.type === "folder") {
      const children = addToFolder(node.children, parentId, newNode);
      if (children !== node.children) {
        const next = nodes.slice();
        next[index] = { ...node, children };
        return next;
      }
    }
  }

  return nodes;
}

function renameNode(nodes: FileNode[], id: string, name: string): FileNode[] {
  for (let index = 0; index < nodes.length; index++) {
    const node = nodes[index];
    if (node.id === id) {
      if (node.name === name) return nodes;
      const next = nodes.slice();
      next[index] = { ...node, name };
      return next;
    }

    if (node.type === "folder") {
      const children = renameNode(node.children, id, name);
      if (children !== node.children) {
        const next = nodes.slice();
        next[index] = { ...node, children };
        return next;
      }
    }
  }

  return nodes;
}

function updateContent(
  nodes: FileNode[],
  id: string,
  content: string,
): FileNode[] {
  for (let index = 0; index < nodes.length; index++) {
    const node = nodes[index];
    if (node.id === id) {
      if (node.content === content) return nodes;
      const next = nodes.slice();
      next[index] = { ...node, content };
      return next;
    }

    if (node.type === "folder") {
      const children = updateContent(node.children, id, content);
      if (children !== node.children) {
        const next = nodes.slice();
        next[index] = { ...node, children };
        return next;
      }
    }
  }

  return nodes;
}

function moveNode(
  nodes: FileNode[],
  id: string,
  targetParentId: string,
): FileNode[] {
  const nodeToMove = findNodeById(nodes, id);
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
    const parent = findNodeById(result, currentId);
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
        id: action.id ?? generateId(),
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
