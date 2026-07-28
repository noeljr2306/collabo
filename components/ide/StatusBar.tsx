"use client";

import {
  Terminal,
  WrapText,
  AlignLeft,
  Users,
  GitBranch,
  Wifi,
} from "lucide-react";
import { userColor } from "@/hooks/usePresence";

interface StatusBarProps {
  language: string | null;
  fileName: string | null;
  activeUsers: any[];
  currentUserId: string;
  terminalOpen: boolean;
  onToggleTerminal: () => void;
  wordWrap: boolean;
  onToggleWordWrap: () => void;
}

export default function StatusBar({
  language,
  fileName,
  activeUsers,
  currentUserId,
  terminalOpen,
  onToggleTerminal,
  wordWrap,
  onToggleWordWrap,
}: StatusBarProps) {
  const others = activeUsers.filter((u) => u.userId !== currentUserId);
  const typingUsers = others.filter((u) => u.isTyping);

  return (
    <div className="h-[22px] bg-[#007acc] flex items-center px-2 text-white text-[11px] shrink-0 select-none overflow-hidden gap-1">
      {/* Left */}
      <div className="flex items-center gap-2 shrink-0">
        <span className="flex items-center gap-1 opacity-80 hover:opacity-100 cursor-default px-1">
          <GitBranch size={11} />
          <span>main</span>
        </span>

        {/* Collaborator count */}
        <button
          title={`${others.length} collaborator(s) online`}
          className="flex items-center gap-1 opacity-80 hover:opacity-100 hover:bg-[#1a85cf] px-1.5 py-0.5 rounded"
        >
          <Users size={11} />
          <span>{activeUsers.length}</span>

          {/* Mini avatars */}
          <div className="flex -space-x-1 ml-0.5">
            {others.slice(0, 3).map((u) => {
              const color = u.color ?? userColor(u.userId);
              const initials = u.userName
                .split(" ")
                .map((w: string) => w[0])
                .join("")
                .toUpperCase()
                .slice(0, 1);
              return (
                <div
                  key={u.userId}
                  title={u.userName}
                  style={{
                    background: color,
                    border: "1px solid rgba(255,255,255,0.3)",
                  }}
                  className="w-3.5 h-3.5 rounded-full flex items-center justify-center text-white text-[7px] font-bold"
                >
                  {initials}
                </div>
              );
            })}
          </div>
        </button>

        {/* Typing indicator */}
        {typingUsers.length > 0 && (
          <span className="opacity-70 text-[10px] italic">
            {typingUsers[0].userName}
            {typingUsers.length > 1 ? ` +${typingUsers.length - 1}` : ""}{" "}
            editing…
          </span>
        )}
      </div>

      {/* Center — filename */}
      <div className="flex-1 flex items-center justify-center">
        {fileName && (
          <span className="opacity-80 truncate max-w-[300px]">{fileName}</span>
        )}
      </div>

      {/* Right */}
      <div className="flex items-center gap-0.5 shrink-0">
        {/* Live indicator */}
        <span className="flex items-center gap-1 opacity-70 px-1.5 cursor-default">
          <Wifi size={10} />
          <span>live</span>
        </span>

        {/* Word wrap toggle */}
        <button
          onClick={onToggleWordWrap}
          title={wordWrap ? "Disable Word Wrap" : "Enable Word Wrap"}
          className={`flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-[#1a85cf] ${wordWrap ? "opacity-100" : "opacity-70"}`}
        >
          {wordWrap ? <WrapText size={10} /> : <AlignLeft size={10} />}
          <span>Wrap</span>
        </button>

        {/* Language */}
        {language && (
          <span className="opacity-80 hover:opacity-100 cursor-default px-2 capitalize hover:bg-[#1a85cf] py-0.5 rounded">
            {language}
          </span>
        )}

        {/* Terminal toggle */}
        <button
          onClick={onToggleTerminal}
          title={
            terminalOpen ? "Hide Terminal (Ctrl+`)" : "Show Terminal (Ctrl+`)"
          }
          className="flex items-center gap-1 opacity-80 hover:opacity-100 hover:bg-[#1a85cf] px-1.5 py-0.5 rounded"
        >
          <Terminal size={10} />
          <span>Terminal</span>
        </button>
      </div>
    </div>
  );
}
