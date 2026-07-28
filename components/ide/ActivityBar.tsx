"use client";

import { SidebarPanel } from "./IDEShell";
import { Files, Search, MessageSquare, Users } from "lucide-react";
import { userColor } from "@/hooks/usePresence";

interface ActivityBarProps {
  active: SidebarPanel;
  onSelect: (panel: SidebarPanel) => void;
  activeUsers: any[];
  currentUserId: string;
}

const ITEMS: {
  id: SidebarPanel;
  Icon: any;
  label: string;
  shortcut: string;
}[] = [
  { id: "explorer", Icon: Files, label: "Explorer", shortcut: "Ctrl+B" },
  { id: "search", Icon: Search, label: "Search", shortcut: "Ctrl+P" },
  { id: "chat", Icon: MessageSquare, label: "Chat", shortcut: "Ctrl+J" },
];

export default function ActivityBar({
  active,
  onSelect,
  activeUsers,
  currentUserId,
}: ActivityBarProps) {
  const others = activeUsers.filter((u) => u.userId !== currentUserId);

  return (
    <div className="w-12 bg-[#333333] flex flex-col items-center pt-1 pb-2 shrink-0 border-r border-[#252526]">
      {ITEMS.map(({ id, Icon, label, shortcut }) => (
        <button
          key={id}
          title={`${label} (${shortcut})`}
          onClick={() => onSelect(id)}
          className={`
            relative w-full h-12 flex items-center justify-center transition-colors group
            ${
              active === id
                ? "text-white before:absolute before:left-0 before:top-2 before:bottom-2 before:w-[2px] before:bg-[#007acc] before:rounded-r"
                : "text-[#858585] hover:text-[#cccccc]"
            }
          `}
        >
          <Icon size={22} strokeWidth={1.4} />

          {/* Tooltip */}
          <span className="absolute left-full ml-2 px-2 py-1 bg-[#1e1e1e] text-[#cccccc] text-[11px] rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 border border-[#3c3c3c] shadow-lg">
            {label}
            <span className="ml-2 text-[#555]">{shortcut}</span>
          </span>
        </button>
      ))}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Collaborator presence avatars */}
      <div className="flex flex-col items-center gap-1.5 mb-1">
        {others.slice(0, 4).map((u) => {
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
              title={u.userName + (u.isTyping ? " (typing…)" : "")}
              style={{ background: color }}
              className="relative w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold cursor-default"
            >
              {initials}
              {/* Typing pulse ring */}
              {u.isTyping && (
                <span
                  className="absolute inset-0 rounded-full animate-ping opacity-40"
                  style={{ background: color }}
                />
              )}
              {/* Online dot */}
              <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#6a9955] border-2 border-[#333]" />
            </div>
          );
        })}

        {others.length > 4 && (
          <div
            title={`${others.length - 4} more user(s)`}
            className="w-7 h-7 rounded-full bg-[#3c3c3c] flex items-center justify-center text-[#858585] text-[9px] font-bold cursor-default"
          >
            +{others.length - 4}
          </div>
        )}

        {/* Users icon when no one else is here */}
        {others.length === 0 && (
          <div
            title="No other collaborators"
            className="w-7 h-7 rounded-full bg-[#2d2d2d] flex items-center justify-center text-[#555]"
          >
            <Users size={12} />
          </div>
        )}
      </div>
    </div>
  );
}
