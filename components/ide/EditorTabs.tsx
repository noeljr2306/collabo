"use client";

import { useRef, useEffect } from "react";
import { X } from "lucide-react";
import { OpenFile } from "./IDEShell";
import { getFileInfo } from "@/lib/fileIcons";

interface EditorTabsProps {
  openFiles: OpenFile[];
  activeFileId: string | null;
  onSelect: (id: string) => void;
  onClose: (id: string) => void;
}

export default function EditorTabs({
  openFiles,
  activeFileId,
  onSelect,
  onClose,
}: EditorTabsProps) {
  const activeRef = useRef<HTMLButtonElement>(null);

  // Scroll active tab into view
  useEffect(() => {
    activeRef.current?.scrollIntoView({
      inline: "nearest",
      behavior: "smooth",
    });
  }, [activeFileId]);

  if (openFiles.length === 0)
    return (
      <div className="h-[35px] bg-[#252526] border-b border-[#1e1e1e] shrink-0" />
    );

  return (
    <div className="h-[35px] bg-[#252526] border-b border-[#1e1e1e] flex overflow-x-auto overflow-y-hidden shrink-0 scrollbar-none">
      {openFiles.map((file) => {
        const isActive = file.id === activeFileId;
        const info = getFileInfo(file.name);

        return (
          <button
            key={file.id}
            ref={isActive ? activeRef : undefined}
            onClick={() => onSelect(file.id)}
            className={`
              group flex items-center gap-1.5 h-full px-3 min-w-[80px] max-w-[160px] shrink-0
              border-r border-[#1e1e1e] text-[12px] transition-colors relative
              ${
                isActive
                  ? "bg-[#1e1e1e] text-[#ffffff] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[1px] after:bg-[#007acc]"
                  : "bg-[#2d2d2d] text-[#969696] hover:bg-[#1e1e1e] hover:text-[#ccc]"
              }
            `}
          >
            {/* File type badge */}
            <span
              className={`shrink-0 text-[8px] font-black uppercase ${info.color} leading-tight`}
            >
              {info.icon}
            </span>

            {/* Filename */}
            <span className="truncate flex-1 text-left">{file.name}</span>

            {/* Dirty dot or close button */}
            <span className="shrink-0 w-4 h-4 flex items-center justify-center">
              {file.isDirty ? (
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    onClose(file.id);
                  }}
                  className="w-2 h-2 rounded-full bg-[#cccccc] group-hover:hidden"
                />
              ) : null}
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  onClose(file.id);
                }}
                className={`
                  rounded p-0.5 hover:bg-[#3c3c3c]
                  ${file.isDirty ? "hidden group-hover:flex" : "opacity-0 group-hover:opacity-100 flex"}
                  items-center justify-center
                `}
              >
                <X size={10} />
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
