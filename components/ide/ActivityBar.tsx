"use client";

import { SidebarPanel } from "./IDEShell";
import { Files, Search, MessageSquare, GitBranch, Users } from "lucide-react";

interface ActivityBarProps {
  active: SidebarPanel;
  onSelect: (panel: SidebarPanel) => void;
  activeUsers: any[];
}

const ITEMS: { id: SidebarPanel; Icon: any; label: string }[] = [
  { id: "explorer", Icon: Files, label: "Explorer" },
  { id: "search", Icon: Search, label: "Search" },
  { id: "chat", Icon: MessageSquare, label: "Chat" },
];

export default function ActivityBar({
  active,
  onSelect,
  activeUsers,
}: ActivityBarProps) {
  return (
    <div className="w-12 bg-[#333333] flex flex-col items-center pt-1 pb-2 gap-0 border-r border-[#252526] select-none shrink-0">
      {ITEMS.map(({ id, Icon, label }) => (
        <button
          key={id}
          title={label}
          onClick={() => onSelect(id)}
          className={`
            w-full flex items-center justify-center h-12 relative transition-colors
            ${
              active === id
                ? "text-white before:absolute before:left-0 before:top-0 before:h-full before:w-[2px] before:bg-[#007acc]"
                : "text-[#858585] hover:text-[#cccccc]"
            }
          `}
        >
          <Icon size={22} strokeWidth={1.5} />
        </button>
      ))}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Active users count */}
      <div className="flex flex-col items-center gap-1 pb-1">
        <div
          title={`${activeUsers.length} user(s) online`}
          className="flex items-center justify-center w-8 h-8 rounded-full bg-[#252526] text-[#4ec9b0] cursor-default"
        >
          <Users size={14} />
        </div>
        {activeUsers.length > 0 && (
          <span className="text-[9px] text-[#4ec9b0]">
            {activeUsers.length}
          </span>
        )}
      </div>
    </div>
  );
}
