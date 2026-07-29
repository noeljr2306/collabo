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
import { useUser } from "@clerk/nextjs";

export interface OpenFile {
  id: string;
  name: string;
  language: string;
  isDirty: boolean;
}

export type SidebarPanel = "explorer" | "search" | "chat" | null;

interface IDEShellProps {
  room: { _id: string; name: string; code: string; hostId: string };
  activeUsers: any[];
}

export default function IDEShell({ room, activeUsers }: IDEShellProps) {
  const { user } = useUser();
  const [sidebarPanel, setSidebarPanel] = useState<SidebarPanel>("explorer");
  const [openFiles, setOpenFiles] = useState<OpenFile[]>([]);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [terminalOpen, setTerminalOpen] = useState(true);
  const [wordWrap, setWordWrap] = useState(false);

  const activeFile = openFiles.find((f) => f.id === activeFileId);

  // ── Keyboard shortcuts ────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "`") {
        e.preventDefault();
        setTerminalOpen((v) => !v);
      }
      if (e.ctrlKey && e.key === "b") {
        e.preventDefault();
        setSidebarPanel((v) => (v === null ? "explorer" : null));
      }
      if (e.ctrlKey && e.key === "j") {
        e.preventDefault();
        setSidebarPanel((v) => (v === "chat" ? "explorer" : "chat"));
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
        if (activeFileId === fileId)
          setActiveFileId(rest.length > 0 ? rest[rest.length - 1].id : null);
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

  return (
    <div className="ide-shell flex flex-col h-full w-full overflow-hidden bg-[#1e1e1e] text-[#cccccc] font-mono">
      <div className="flex flex-1 overflow-hidden">
        <ActivityBar
          active={sidebarPanel}
          onSelect={(p) => setSidebarPanel((prev) => (prev === p ? null : p))}
          activeUsers={activeUsers}
          currentUserId={user?.id ?? ""}
        />

        <div className="flex-1 overflow-hidden">
          <Allotment>
            {/* Sidebar */}
            {sidebarPanel !== null && (
              <Allotment.Pane minSize={160} preferredSize={240} snap>
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

            {/* Editor + Terminal */}
            <Allotment.Pane minSize={300}>
              <Allotment vertical>
                {/* Editor */}
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
                          onDirtyChange={(d) => markDirty(activeFileId, d)}
                        />
                      ) : (
                        <WelcomeScreen
                          roomName={room.name}
                          roomCode={room.code}
                          activeUsers={activeUsers}
                          currentUserId={user?.id ?? ""}
                        />
                      )}
                    </div>
                  </div>
                </Allotment.Pane>

                {/* Terminal — always mounted, never unmounted */}
                <Allotment.Pane
                  minSize={35}
                  preferredSize={terminalOpen ? 220 : 35}
                  snap
                >
                  <div style={{ height: "100%", overflow: "hidden" }}>
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
        currentUserId={user?.id ?? ""}
        terminalOpen={terminalOpen}
        onToggleTerminal={() => setTerminalOpen((v) => !v)}
        wordWrap={wordWrap}
        onToggleWordWrap={() => setWordWrap((v) => !v)}
      />
    </div>
  );
}

// ── Welcome screen ────────────────────────────────────────────────────────────

function WelcomeScreen({
  roomName,
  roomCode,
  activeUsers,
  currentUserId,
}: {
  roomName: string;
  roomCode: string;
  activeUsers: any[];
  currentUserId: string;
}) {
  const others = activeUsers.filter((u) => u.userId !== currentUserId);

  return (
    <div className="h-full flex flex-col items-center justify-center gap-4 select-none bg-[#1e1e1e] px-8">
      <div className="text-4xl">⚡</div>
      <div className="text-center">
        <p className="text-[#cccccc] text-base font-semibold">{roomName}</p>
        <p className="text-[#555] text-xs mt-1 font-mono">{roomCode}</p>
      </div>

      {/* Online collaborators */}
      {others.length > 0 && (
        <div className="flex flex-col items-center gap-2">
          <p className="text-[10px] uppercase tracking-widest text-[#555]">
            {others.length} collaborator{others.length > 1 ? "s" : ""} online
          </p>
          <div className="flex -space-x-2">
            {others.slice(0, 5).map((u) => {
              const { userColor } = require("@/hooks/usePresence");
              const color = u.color ?? userColor(u.userId);
              const initials = u.userName
                .split(" ")
                .map((w: string) => w[0])
                .join("")
                .toUpperCase()
                .slice(0, 2);
              return (
                <div
                  key={u.userId}
                  title={u.userName}
                  style={{ background: color, border: "2px solid #1e1e1e" }}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold"
                >
                  {initials}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1.5 text-[11px] text-[#555]">
        {[
          ["Ctrl+`", "Toggle terminal"],
          ["Ctrl+B", "Toggle sidebar"],
          ["Ctrl+J", "Open chat"],
          ["Ctrl+P", "Quick open"],
          ["Ctrl+/", "Toggle comment"],
          ["Ctrl+D", "Select next"],
        ].map(([key, label]) => (
          <span key={key}>
            <kbd className="bg-[#2d2d2d] text-[#858585] px-1.5 py-0.5 rounded text-[10px]">
              {key}
            </kbd>{" "}
            {label}
          </span>
        ))}
      </div>

      <p className="text-[11px] text-[#3c3c3c] mt-2">
        Open a file from the Explorer to start coding
      </p>
    </div>
  );
}

// ── Search panel ──────────────────────────────────────────────────────────────

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
      <div className="px-3 py-2.5 border-b border-[#3c3c3c] shrink-0">
        <p className="text-[10px] uppercase tracking-widest text-[#858585] mb-2 font-semibold">
          Search Files
        </p>
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Type to filter..."
          className="w-full bg-[#3c3c3c] text-[#ccc] text-xs px-2.5 py-1.5 rounded outline-none placeholder-[#555] border border-[#555] focus:border-[#007acc]"
        />
      </div>
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 && query && (
          <p className="px-4 py-6 text-xs text-[#555] text-center">
            No files match "{query}"
          </p>
        )}
        {filtered.map((f) => (
          <button
            key={f._id}
            onClick={() =>
              onOpenFile({ id: f._id, name: f.name, language: f.language })
            }
            className="w-full text-left px-3 py-1.5 text-[12px] text-[#ccc] hover:bg-[#2a2d2e] truncate flex items-center gap-2"
          >
            <span className="text-[#555] text-[10px] shrink-0">FILE</span>
            <span className="truncate">{f.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
