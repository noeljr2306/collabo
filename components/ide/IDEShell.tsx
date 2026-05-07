"use client";

import { useState, useCallback, useEffect } from "react";
import { Allotment } from "allotment";
import ActivityBar from "./ActivityBar";
import FileTree from "./FileTree";
import EditorTabs from "./EditorTabs";
import MonacoPane from "./MonacoPane";
import TerminalPanel from "./TerminalPanel";
import ChatPanel from "@/components/chat-panel";
import StatusBar from "./StatusBar";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export interface OpenFile {
  id: string;
  name: string;
  language: string;
  isDirty: boolean;
}

interface IDEShellProps {
  room: {
    _id: string;
    name: string;
    code: string;
    hostId: string;
  };
  activeUsers: any[];
}

export type SidebarPanel = "explorer" | "search" | "chat" | null;

export default function IDEShell({ room, activeUsers }: IDEShellProps) {
  const [sidebarPanel, setSidebarPanel] = useState<SidebarPanel>("explorer");
  const [openFiles, setOpenFiles] = useState<OpenFile[]>([]);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [terminalOpen, setTerminalOpen] = useState(true);

  const activeFile = openFiles.find((f) => f.id === activeFileId);

  // ── Ctrl+` toggles terminal ───────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "`") {
        e.preventDefault();
        setTerminalOpen((v) => !v);
      }
      // Ctrl+B toggles sidebar
      if (e.ctrlKey && e.key === "b") {
        e.preventDefault();
        setSidebarPanel((v) => (v === null ? "explorer" : null));
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const openFile = useCallback(
    (file: { id: string; name: string; language: string }) => {
      setOpenFiles((prev) => {
        if (prev.find((f) => f.id === file.id)) return prev;
        return [...prev, { ...file, isDirty: false }];
      });
      setActiveFileId(file.id);
    },
    [],
  );

  const closeFile = useCallback(
    (fileId: string) => {
      setOpenFiles((prev) => {
        const rest = prev.filter((f) => f.id !== fileId);
        if (activeFileId === fileId) {
          setActiveFileId(rest.length > 0 ? rest[rest.length - 1].id : null);
        }
        return rest;
      });
    },
    [activeFileId],
  );

  const markDirty = useCallback((fileId: string, dirty: boolean) => {
    setOpenFiles((prev) =>
      prev.map((f) => (f.id === fileId ? { ...f, isDirty: dirty } : f)),
    );
  }, []);

  const handleActivityClick = (panel: SidebarPanel) => {
    setSidebarPanel((prev) => (prev === panel ? null : panel));
  };

  const sidebarVisible = sidebarPanel !== null;

  return (
    <div className="ide-shell flex flex-col h-full w-full overflow-hidden bg-[#1e1e1e] text-[#cccccc] font-mono">
      <div className="flex flex-1 overflow-hidden">
        <ActivityBar
          active={sidebarPanel}
          onSelect={handleActivityClick}
          activeUsers={activeUsers}
        />

        <div className="flex-1 overflow-hidden">
          <Allotment>
            {sidebarVisible && (
              <Allotment.Pane minSize={150} preferredSize={220} snap>
                <div className="h-full bg-[#252526] flex flex-col overflow-hidden border-r border-[#3c3c3c]">
                  {sidebarPanel === "explorer" && (
                    <FileTree
                      roomId={room.code}
                      onOpenFile={openFile}
                      activeFileId={activeFileId}
                    />
                  )}
                  {sidebarPanel === "chat" && (
                    <ChatPanel
                      roomId={room.code}
                      isOpen={true}
                      onOpenChange={() => {}}
                      inline={true}
                    />
                  )}
                  {sidebarPanel === "search" && (
                    <SearchPanel roomId={room.code} onOpenFile={openFile} />
                  )}
                </div>
              </Allotment.Pane>
            )}

            <Allotment.Pane minSize={300}>
              <Allotment vertical>
                <Allotment.Pane minSize={100}>
                  <div className="flex flex-col h-full overflow-hidden">
                    <EditorTabs
                      openFiles={openFiles}
                      activeFileId={activeFileId}
                      onSelect={setActiveFileId}
                      onClose={closeFile}
                    />
                    <div className="flex-1 overflow-hidden">
                      {activeFileId ? (
                        <MonacoPane
                          fileId={activeFileId}
                          roomId={room.code}
                          onDirtyChange={(dirty) =>
                            markDirty(activeFileId, dirty)
                          }
                        />
                      ) : (
                        <WelcomeScreen roomName={room.name} />
                      )}
                    </div>
                  </div>
                </Allotment.Pane>

                {/* 
                  KEY FIX: Always render TerminalPanel, just hide it visually.
                  This prevents WebContainer/xterm from being destroyed on close.
                */}
                <Allotment.Pane
                  minSize={terminalOpen ? 80 : 0}
                  preferredSize={terminalOpen ? 220 : 0}
                  snap
                >
                  <div
                    style={{
                      height: "100%",
                      visibility: terminalOpen ? "visible" : "hidden",
                      pointerEvents: terminalOpen ? "auto" : "none",
                    }}
                  >
                    <TerminalPanel
                      roomId={room.code}
                      onClose={() => setTerminalOpen(false)}
                    />
                  </div>
                </Allotment.Pane>
              </Allotment>
            </Allotment.Pane>
          </Allotment>
        </div>
      </div>

      <StatusBar
        language={activeFile?.language ?? null}
        fileName={activeFile?.name ?? null}
        activeUsers={activeUsers}
        terminalOpen={terminalOpen}
        onToggleTerminal={() => setTerminalOpen((v) => !v)}
      />
    </div>
  );
}

function WelcomeScreen({ roomName }: { roomName: string }) {
  return (
    <div className="h-full flex flex-col items-center justify-center gap-3 select-none bg-[#1e1e1e]">
      <div className="text-5xl mb-2">⚡</div>
      <p className="text-[#cccccc] text-lg font-semibold">{roomName}</p>
      <p className="text-[#6b6b6b] text-sm">
        Open a file from the explorer to start coding
      </p>
      <div className="mt-4 flex flex-col gap-1 text-xs text-[#6b6b6b]">
        <span>
          <kbd className="bg-[#3c3c3c] px-1.5 py-0.5 rounded">Ctrl+`</kbd>{" "}
          &nbsp;Toggle terminal
        </span>
        <span>
          <kbd className="bg-[#3c3c3c] px-1.5 py-0.5 rounded">Ctrl+B</kbd>{" "}
          &nbsp;Toggle sidebar
        </span>
      </div>
    </div>
  );
}

function SearchPanel({
  roomId,
  onOpenFile,
}: {
  roomId: string;
  onOpenFile: (f: any) => void;
}) {
  const [query, setQuery] = useState("");
  const files = useQuery(api.room.getFiles, { roomId }) ?? [];
  const filtered = files.filter(
    (f) => !f.isFolder && f.name.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-3 py-2 border-b border-[#3c3c3c]">
        <p className="text-[10px] uppercase tracking-widest text-[#bbb] mb-2">
          Search
        </p>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search files..."
          className="w-full bg-[#3c3c3c] text-[#ccc] text-xs px-2 py-1.5 rounded outline-none placeholder-[#6b6b6b] border border-[#555] focus:border-[#007acc]"
        />
      </div>
      <div className="flex-1 overflow-y-auto">
        {filtered.map((f) => (
          <button
            key={f._id}
            onClick={() =>
              onOpenFile({ id: f._id, name: f.name, language: f.language })
            }
            className="w-full text-left px-3 py-1.5 text-xs text-[#ccc] hover:bg-[#2a2d2e] truncate"
          >
            {f.name}
          </button>
        ))}
        {query && filtered.length === 0 && (
          <p className="px-3 py-4 text-xs text-[#6b6b6b]">No files found</p>
        )}
      </div>
    </div>
  );
}
