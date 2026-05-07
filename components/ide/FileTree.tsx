"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { getFileInfo, getLanguageFromFilename } from "@/lib/fileIcons";
import {
  ChevronRight,
  ChevronDown,
  Plus,
  FolderPlus,
  RefreshCw,
} from "lucide-react";

interface FileTreeProps {
  roomId: string;
  onOpenFile: (file: { id: string; name: string; language: string }) => void;
  activeFileId: string | null;
}

interface FileNode {
  _id: string;
  name: string;
  isFolder: boolean;
  language: string;
  parentId?: string;
  content: string;
}

type ContextMenu = {
  x: number;
  y: number;
  fileId: string;
  isFolder: boolean;
} | null;

export default function FileTree({
  roomId,
  onOpenFile,
  activeFileId,
}: FileTreeProps) {
  const files = useQuery(api.room.getFiles, { roomId }) ?? [];
  const createFile = useMutation(api.room.createFile);
  const renameFile = useMutation(api.room.renameFile);
  const deleteFile = useMutation(api.room.deleteFile);

  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set(),
  );
  const [contextMenu, setContextMenu] = useState<ContextMenu>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [creating, setCreating] = useState<{
    parentId?: string;
    isFolder: boolean;
  } | null>(null);
  const [createValue, setCreateValue] = useState("");
  const renameRef = useRef<HTMLInputElement>(null);
  const createRef = useRef<HTMLInputElement>(null);

  // Close context menu on outside click
  useEffect(() => {
    const handler = () => setContextMenu(null);
    window.addEventListener("click", handler);
    return () => window.removeEventListener("click", handler);
  }, []);

  useEffect(() => {
    if (renamingId) renameRef.current?.select();
  }, [renamingId]);

  useEffect(() => {
    if (creating) {
      setTimeout(() => createRef.current?.focus(), 50);
    }
  }, [creating]);

  const toggleFolder = (id: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleContextMenu = (e: React.MouseEvent, file: FileNode) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      fileId: file._id,
      isFolder: file.isFolder,
    });
  };

  const handleRootContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, fileId: "", isFolder: true });
  };

  // ── Create file/folder ─────────────────────────────────────────────────────
  const startCreate = (isFolder: boolean, parentId?: string) => {
    setCreating({ parentId, isFolder });
    setCreateValue("");
    setContextMenu(null);
    if (parentId) setExpandedFolders((p) => new Set(p).add(parentId));
  };

  const commitCreate = async () => {
    if (!createValue.trim() || !creating) {
      setCreating(null);
      return;
    }
    const name = createValue.trim();
    const language = creating.isFolder
      ? "folder"
      : getLanguageFromFilename(name);
    await createFile({
      roomId,
      name,
      language,
      isFolder: creating.isFolder,
      parentId: creating.parentId,
      content: "",
    });
    setCreating(null);
    setCreateValue("");
  };

  // ── Rename ─────────────────────────────────────────────────────────────────
  const startRename = (file: FileNode) => {
    setRenamingId(file._id);
    setRenameValue(file.name);
    setContextMenu(null);
  };

  const commitRename = async (fileId: string) => {
    if (renameValue.trim()) {
      const language = getLanguageFromFilename(renameValue.trim());
      await renameFile({
        fileId: fileId as any,
        name: renameValue.trim(),
        language,
      });
    }
    setRenamingId(null);
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDelete = async (fileId: string) => {
    if (confirm("Delete this file?")) {
      await deleteFile({ fileId: fileId as any });
    }
    setContextMenu(null);
  };

  // ── Build tree ─────────────────────────────────────────────────────────────
  const renderNodes = (parentId?: string, depth = 0): React.ReactNode[] => {
    const nodes = files
      .filter((f) =>
        parentId === undefined ? !f.parentId : f.parentId === parentId,
      )
      .sort((a, b) => {
        if (a.isFolder && !b.isFolder) return -1;
        if (!a.isFolder && b.isFolder) return 1;
        return a.name.localeCompare(b.name);
      });

    return nodes.flatMap((file) => {
      const isExpanded = expandedFolders.has(file._id);
      const info = getFileInfo(file.name);

      return [
        <div key={file._id}>
          {/* Inline rename input */}
          {renamingId === file._id ? (
            <div
              style={{ paddingLeft: depth * 12 + 8 }}
              className="flex items-center h-6 bg-[#2a2d2e]"
            >
              <input
                ref={renameRef}
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onBlur={() => commitRename(file._id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") commitRename(file._id);
                  if (e.key === "Escape") setRenamingId(null);
                }}
                className="flex-1 bg-[#313131] text-[#ccc] text-xs px-1 py-0.5 rounded outline outline-1 outline-[#007acc] min-w-0"
              />
            </div>
          ) : (
            <button
              onContextMenu={(e) => handleContextMenu(e, file as FileNode)}
              onClick={() => {
                if (file.isFolder) toggleFolder(file._id);
                else
                  onOpenFile({
                    id: file._id,
                    name: file.name,
                    language: file.language,
                  });
              }}
              style={{ paddingLeft: depth * 12 + 4 }}
              className={`
                w-full flex items-center gap-1.5 h-[22px] text-[13px] pr-2 truncate transition-colors
                ${
                  activeFileId === file._id
                    ? "bg-[#094771] text-white"
                    : "hover:bg-[#2a2d2e] text-[#cccccc]"
                }
              `}
            >
              {/* Chevron for folders */}
              <span className="shrink-0 w-4 flex items-center justify-center">
                {file.isFolder ? (
                  isExpanded ? (
                    <ChevronDown size={12} />
                  ) : (
                    <ChevronRight size={12} />
                  )
                ) : null}
              </span>

              {/* Icon */}
              {file.isFolder ? (
                <span className="shrink-0 text-[11px]">
                  {isExpanded ? "📂" : "📁"}
                </span>
              ) : (
                <span
                  className={`shrink-0 text-[9px] font-black uppercase ${info.color} bg-[#3c3c3c] px-0.5 rounded leading-tight min-w-[20px] text-center`}
                >
                  {info.icon}
                </span>
              )}

              <span className="truncate text-left">{file.name}</span>
            </button>
          )}
        </div>,

        // Render children if folder is expanded
        ...(file.isFolder && isExpanded
          ? renderNodes(file._id, depth + 1)
          : []),

        // Inline create input inside this folder
        ...(creating?.parentId === file._id && file.isFolder && isExpanded
          ? [
              <div
                key="creating-child"
                style={{ paddingLeft: (depth + 1) * 12 + 8 }}
                className="flex items-center h-6"
              >
                <input
                  ref={createRef}
                  value={createValue}
                  onChange={(e) => setCreateValue(e.target.value)}
                  onBlur={commitCreate}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") commitCreate();
                    if (e.key === "Escape") setCreating(null);
                  }}
                  placeholder={creating.isFolder ? "folder name" : "file name"}
                  className="flex-1 bg-[#313131] text-[#ccc] text-xs px-1 py-0.5 rounded outline outline-1 outline-[#007acc] min-w-0"
                />
              </div>,
            ]
          : []),
      ];
    });
  };

  const ctxFile = contextMenu
    ? files.find((f) => f._id === contextMenu.fileId)
    : null;

  return (
    <div
      className="flex flex-col h-full overflow-hidden"
      onContextMenu={handleRootContextMenu}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-[#3c3c3c] shrink-0">
        <span className="text-[10px] uppercase tracking-widest text-[#bbb] font-semibold">
          Explorer
        </span>
        <div className="flex gap-1">
          <button
            title="New File"
            onClick={() => startCreate(false, undefined)}
            className="text-[#858585] hover:text-white p-0.5 rounded hover:bg-[#3c3c3c]"
          >
            <Plus size={14} />
          </button>
          <button
            title="New Folder"
            onClick={() => startCreate(true, undefined)}
            className="text-[#858585] hover:text-white p-0.5 rounded hover:bg-[#3c3c3c]"
          >
            <FolderPlus size={14} />
          </button>
        </div>
      </div>

      {/* Room name section */}
      <div className="px-2 py-1 shrink-0">
        <p className="text-[10px] uppercase tracking-widest text-[#858585] px-1 py-1 font-semibold truncate">
          Collabo
        </p>
      </div>

      {/* File nodes */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {/* Root-level create input */}
        {creating && !creating.parentId && (
          <div className="flex items-center h-6 px-2">
            <input
              ref={createRef}
              value={createValue}
              onChange={(e) => setCreateValue(e.target.value)}
              onBlur={commitCreate}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitCreate();
                if (e.key === "Escape") setCreating(null);
              }}
              placeholder={creating.isFolder ? "folder name" : "file name"}
              className="flex-1 bg-[#313131] text-[#ccc] text-xs px-1 py-0.5 rounded outline outline-1 outline-[#007acc] min-w-0"
            />
          </div>
        )}

        {renderNodes()}

        {files.filter((f) => !f.isFolder).length === 0 && !creating && (
          <p className="px-4 py-4 text-xs text-[#6b6b6b] leading-relaxed">
            No files yet.
            <br />
            Click + to create your first file.
          </p>
        )}
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div
          style={{ top: contextMenu.y, left: contextMenu.x }}
          className="fixed z-50 bg-[#252526] border border-[#454545] rounded shadow-xl min-w-[160px] py-1 text-xs text-[#ccc]"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() =>
              startCreate(
                false,
                ctxFile?.isFolder ? contextMenu.fileId : ctxFile?.parentId,
              )
            }
            className="w-full text-left px-3 py-1.5 hover:bg-[#094771] flex items-center gap-2"
          >
            <Plus size={12} /> New File
          </button>
          <button
            onClick={() =>
              startCreate(
                true,
                ctxFile?.isFolder ? contextMenu.fileId : ctxFile?.parentId,
              )
            }
            className="w-full text-left px-3 py-1.5 hover:bg-[#094771] flex items-center gap-2"
          >
            <FolderPlus size={12} /> New Folder
          </button>
          {ctxFile && (
            <>
              <div className="border-t border-[#454545] my-1" />
              <button
                onClick={() => startRename(ctxFile as FileNode)}
                className="w-full text-left px-3 py-1.5 hover:bg-[#094771]"
              >
                Rename
              </button>
              <button
                onClick={() => handleDelete(contextMenu.fileId)}
                className="w-full text-left px-3 py-1.5 hover:bg-[#c72e2e] text-red-400"
              >
                Delete
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
