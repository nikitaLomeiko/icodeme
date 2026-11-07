import { FiDownload, FiFilePlus, FiFolderPlus, FiUpload } from "react-icons/fi";
import { FileAction, FileNode } from "../../types/types";
import { useExplorer } from "../../store/file/use.explorer";

interface IProps {
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  folderInputRef: React.RefObject<HTMLInputElement | null>;
}

export const TreeHeader: React.FC<IProps> = (props) => {
  const { fileInputRef, folderInputRef } = props;

  const { handleDownload, dispatch, files } = useExplorer();

  return (
    <div className="flex gap-1">
      <button
        onClick={() => fileInputRef.current?.click()}
        className="p-1.5 rounded-lg hover:bg-[var(--ui-text)]/10 text-[var(--ui-text-muted)] hover:text-[var(--ui-primary)] transition-all"
        title="Import files"
      >
        <FiUpload className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={() => folderInputRef.current?.click()}
        className="p-1.5 rounded-lg hover:bg-[var(--ui-text)]/10 text-[var(--ui-text-muted)] hover:text-[var(--ui-primary)] transition-all"
        title="Import folder"
      >
        <FiFolderPlus className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={handleDownload}
        className="p-1.5 rounded-lg hover:bg-[var(--ui-text)]/10 text-[var(--ui-text-muted)] hover:text-[var(--ui-info)] transition-all"
        title="Download all"
      >
        <FiDownload className="w-3.5 h-3.5" />
      </button>
      <div className="w-px h-4 bg-[var(--ui-border)] mx-0.5 self-center" />
      <button
        onClick={() => {
          const name = prompt("Enter file name:");
          if (name)
            dispatch?.({
              type: "CREATE_FILE",
              parentId: files[0]?.id || "",
              name,
            });
        }}
        className="p-1.5 rounded-lg hover:bg-[var(--ui-text)]/10 text-[var(--ui-text-muted)] hover:text-[var(--ui-success)] transition-all"
        title="New file"
      >
        <FiFilePlus className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={() => {
          const name = prompt("Enter folder name:");
          if (name)
            dispatch?.({
              type: "CREATE_FOLDER",
              parentId: files[0]?.id || "",
              name,
            });
        }}
        className="p-1.5 rounded-lg hover:bg-[var(--ui-text)]/10 text-[var(--ui-text-muted)] hover:text-[var(--ui-info)] transition-all"
        title="New folder"
      >
        <FiFolderPlus className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
