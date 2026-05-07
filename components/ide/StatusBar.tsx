"use client";

import { Terminal, Users, GitBranch } from "lucide-react";

interface StatusBarProps {
  language: string | null;
  fileName: string | null;
  activeUsers: any[];
  terminalOpen: boolean;
  onToggleTerminal: () => void;
}

export default function StatusBar({
  language,
  fileName,
  activeUsers,
  terminalOpen,
  onToggleTerminal,
}: StatusBarProps) {
  return (
    <div className="h-[22px] bg-[#007acc] flex items-center px-2 text-white text-[11px] shrink-0 select-none overflow-hidden">
      {/* Left side */}
      <div className="flex items-center gap-3 flex-1">
        {/* Branch placeholder */}
        <span className="flex items-center gap-1 opacity-90 hover:opacity-100 cursor-default">
          <GitBranch size={11} />
          <span>main</span>
        </span>
      </div>

      {/* Center - filename */}
      {fileName && (
        <div className="absolute left-1/2 -translate-x-1/2 opacity-80 truncate max-w-[200px]">
          {fileName}
        </div>
      )}

      {/* Right side */}
      <div className="flex items-center gap-3 ml-auto">
        {/* Active users */}
        <span
          className="flex items-center gap-1 opacity-90 hover:opacity-100 cursor-default"
          title={`${activeUsers.length} collaborator(s) online`}
        >
          <Users size={11} />
          <span>{activeUsers.length}</span>
        </span>

        {/* Language */}
        {language && (
          <span className="opacity-90 hover:opacity-100 cursor-default capitalize">
            {language}
          </span>
        )}

        {/* Terminal toggle */}
        <button
          onClick={onToggleTerminal}
          title={terminalOpen ? "Hide Terminal" : "Show Terminal"}
          className="flex items-center gap-1 opacity-90 hover:opacity-100 hover:bg-[#1a85cf] px-1 rounded"
        >
          <Terminal size={11} />
          <span>Terminal</span>
        </button>
      </div>
    </div>
  );
}
