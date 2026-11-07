import { useCallback, useRef, useState } from "react";
import {
  FiChevronRight,
  FiEdit2,
  FiFile,
  FiFilePlus,
  FiFolder,
  FiFolderPlus,
  FiTrash2,
} from "react-icons/fi";
import { FileNode } from "../../types/types";
import { motion, AnimatePresence } from "framer-motion";
import { RenamingForm } from "../forms/renaming.form";
import { useExplorer } from "../../store/file/use.explorer";

interface IProps {
  node: FileNode;
  depth: number;
}

export const TreeNode: React.FC<IProps> = (props) => {
  const { node, depth } = props;

  const { activeFileId, dispatch, setActiveFileId } = useExplorer();

  const [expanded, setExpanded] = useState(true);
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(node.name);
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const isActive = activeFileId === node.id;

  const handleRename = useCallback(() => {
    if (renameValue.trim() && renameValue !== node.name) {
      dispatch?.({ type: "RENAME", id: node.id, name: renameValue.trim() });
    }
    setIsRenaming(false);
  }, [dispatch, node.id, node.name, renameValue]);

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("text/plain", node.id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (node.type === "folder") {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      setIsDragOver(true);
    }
  };

  const handleDragLeave = () => setIsDragOver(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const draggedId = e.dataTransfer.getData("text/plain");
    if (draggedId && draggedId !== node.id) {
      dispatch?.({ type: "MOVE", id: draggedId, targetParentId: node.id });
    }
  };

  const paddingLeft = 12 + depth * 16;

  if (node.type === "folder") {
    return (
      <div>
        <div
          className={`flex items-center gap-1 px-2 py-1.5 cursor-pointer rounded-lg transition-all duration-150 group select-none
            ${isDragOver ? "bg-[var(--ui-primary)]/20 ring-1 ring-[var(--ui-primary)]" : "hover:bg-[var(--ui-text)]/5"}`}
          style={{ paddingLeft }}
          onClick={() => setExpanded(!expanded)}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <motion.div
            animate={{ rotate: expanded ? 90 : 0 }}
            transition={{ duration: 0.15 }}
          >
            <FiChevronRight className="w-3.5 h-3.5 text-[var(--ui-text-muted)]" />
          </motion.div>
          <FiFolder className="w-4 h-4 text-[var(--ui-warning)] shrink-0" />
          {isRenaming ? (
            <RenamingForm
              inputRef={inputRef}
              onRename={handleRename}
              setIsRenaming={setIsRenaming}
              setValue={setRenameValue}
              value={renameValue}
            />
          ) : (
            <span className="text-xs text-[var(--ui-text-secondary)] truncate flex-1">
              {node.name}
            </span>
          )}
          <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                const name = prompt("Enter file name:");
                if (name)
                  dispatch?.({ type: "CREATE_FILE", parentId: node.id, name });
              }}
              className="p-1 rounded hover:bg-[var(--ui-text)]/10 text-[var(--ui-text-muted)] hover:text-[var(--ui-success)] transition-colors"
              title="New file"
            >
              <FiFilePlus className="w-3 h-3" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                const name = prompt("Enter folder name:");
                if (name)
                  dispatch?.({
                    type: "CREATE_FOLDER",
                    parentId: node.id,
                    name,
                  });
              }}
              className="p-1 rounded hover:bg-[var(--ui-text)]/10 text-[var(--ui-text-muted)] hover:text-[var(--ui-info)] transition-colors"
              title="New folder"
            >
              <FiFolderPlus className="w-3 h-3" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsRenaming(true);
                setRenameValue(node.name);
                setTimeout(() => inputRef.current?.select(), 0);
              }}
              className="p-1 rounded hover:bg-[var(--ui-text)]/10 text-[var(--ui-text-muted)] hover:text-[var(--ui-info)] transition-colors"
              title="Rename"
            >
              <FiEdit2 className="w-3 h-3" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (confirm("Delete folder?"))
                  dispatch?.({ type: "DELETE", id: node.id });
              }}
              className="p-1 rounded hover:bg-[var(--ui-text)]/10 text-[var(--ui-text-muted)] hover:text-[var(--ui-error)] transition-colors"
              title="Delete"
            >
              <FiTrash2 className="w-3 h-3" />
            </button>
          </div>
        </div>
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="overflow-hidden"
            >
              {node.children.map((child) => (
                <TreeNode key={child.id} node={child} depth={depth + 1} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div
      className={`flex items-center gap-2 px-2 py-1.5 cursor-pointer rounded-lg transition-all duration-150 group select-none
        ${
          isActive
            ? "bg-[var(--ui-primary)]/15 text-[var(--ui-primary)] ring-1 ring-[var(--ui-primary)]/30"
            : "hover:bg-[var(--ui-text)]/5 text-[var(--ui-text-secondary)]"
        }`}
      style={{ paddingLeft }}
      draggable
      onDragStart={handleDragStart}
      onClick={() => setActiveFileId(node.id)}
    >
      <FiFile className="w-4 h-4 shrink-0 text-[var(--ui-info)]" />
      {isRenaming ? (
        <RenamingForm
          inputRef={inputRef}
          onRename={handleRename}
          setIsRenaming={setIsRenaming}
          setValue={setRenameValue}
          value={renameValue}
        />
      ) : (
        <span className="text-xs truncate flex-1">{node.name}</span>
      )}
      <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsRenaming(true);
            setRenameValue(node.name);
            setTimeout(() => inputRef.current?.select(), 0);
          }}
          className="p-1 rounded hover:bg-[var(--ui-text)]/10 text-[var(--ui-text-muted)] hover:text-[var(--ui-info)] transition-colors"
          title="Rename"
        >
          <FiEdit2 className="w-3 h-3" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (confirm("Delete file?"))
              dispatch?.({ type: "DELETE", id: node.id });
          }}
          className="p-1 rounded hover:bg-[var(--ui-text)]/10 text-[var(--ui-text-muted)] hover:text-[var(--ui-error)] transition-colors"
          title="Delete"
        >
          <FiTrash2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
