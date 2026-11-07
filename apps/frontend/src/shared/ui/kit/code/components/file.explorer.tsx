"use client";

import { useCallback, useEffect, useRef } from "react";
import { TreeNode } from "./ui/tree.node";
import { TreeHeader } from "./ui/tree.header";
import { useExplorer } from "../store/file/use.explorer";
import { useEnviroment } from "../store/enviroment";

export const FileExplorer = () => {
  const { handleFileImport, handleFolderImport, files } = useExplorer();
  const { sidebarWidth, sidebarOpen, dispatch } = useEnviroment();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const handleSidebarMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      const startX = e.clientX;
      const startWidth = sidebarWidth;

      const handleMouseMove = (ev: MouseEvent) => {
        const newWidth = Math.max(
          160,
          Math.min(500, startWidth + (ev.clientX - startX)),
        );
        dispatch?.({ type: "SET_SIDEBAR_WIDTH", width: newWidth });
      };

      const handleMouseUp = () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    },
    [sidebarWidth],
  );

  return (
    <aside
      className={`shrink-0 border-r border-[var(--ui-border)] overflow-hidden relative ${
        sidebarOpen ? "" : "w-0 transition-all duration-200 ease-in-out"
      }`}
      style={{ width: sidebarOpen ? sidebarWidth : undefined }}
    >
      <div
        className="h-full"
        style={{ width: sidebarWidth, minWidth: sidebarWidth }}
      >
        <div className="h-full flex flex-col">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileImport}
            style={{ display: "none" }}
          />
          <input
            ref={folderInputRef}
            type="file"
            multiple
            /* @ts-ignore */
            webkitdirectory=""
            onChange={handleFolderImport}
            style={{ display: "none" }}
          />

          <div className="flex items-center justify-between px-3 py-2.5 border-b border-[var(--ui-border)]">
            <span className="text-xs font-semibold tracking-wider text-[var(--ui-text-muted)] uppercase">
              Explorer
            </span>
            <TreeHeader
              fileInputRef={fileInputRef}
              folderInputRef={folderInputRef}
            />
          </div>
          <div className="flex-1 overflow-y-auto p-1.5 space-y-0.5 custom-scroll">
            {files.map((node) => (
              <TreeNode key={node.id} node={node} depth={0} />
            ))}
          </div>
        </div>
      </div>
      {sidebarOpen && (
        <div
          className="absolute top-0 right-0 w-1.5 h-full cursor-col-resize hover:bg-[var(--ui-primary)]/30 active:bg-[var(--ui-primary)]/50 transition-colors z-10"
          onMouseDown={handleSidebarMouseDown}
        />
      )}
    </aside>
  );
};
