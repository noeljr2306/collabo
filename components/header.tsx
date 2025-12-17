"use client";

import React from "react";
import { useRouter } from "next/navigation"; // Add this
import {
  Users,
  Copy,
  Check,
  MessageSquare,
  ArrowLeft,
  Code2,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { useUser } from "@clerk/nextjs";

type ActiveUser = {
  _id: string;      // Convex internal ID
  userId: string;   // Clerk user ID
  userName: string; // The name we saved
  lastSeen: number;
}
type HeaderProps = {
  roomName: string;
  roomCode: string;
  activeUsers: ActiveUser[];
  onCopyCode: () => void;
  copied: boolean;
  onToggleFullscreen: () => void;
  isFullscreen: boolean;
  onToggleChat: () => void;
  isChatOpen: boolean;
};

export default function Header({
  roomName,
  roomCode,
  activeUsers,
  onCopyCode,
  copied,
  onToggleFullscreen,
  isFullscreen,
  onToggleChat,
  isChatOpen,
}: HeaderProps) {
  const router = useRouter(); // Initialize router
  const { user } = useUser();

  return (
    <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-4 py-3 flex items-center justify-between shrink-0 shadow-lg shadow-slate-950/50">
      <div className="flex items-center gap-4">
        {/* Back Button hooked to Dashboard */}
        <button
          onClick={() => router.push("/dashboard")}
          className="h-9 w-9 flex items-center justify-center rounded-md hover:bg-slate-800 hover:text-emerald-400 transition-colors text-slate-400"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Code2 className="h-5 w-5 text-slate-950" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-50">{roomName}</h1>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-xs text-slate-400">Live Session</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="bg-slate-800/50 text-slate-300 border border-slate-700 px-3 py-1.5 rounded-md flex items-center gap-2 group relative">
          <Users className="h-3.5 w-3.5 text-emerald-400" />
          <span className="text-sm font-medium">{activeUsers.length}</span>

          {/* Tooltip to show names */}
          <div className="absolute top-12 right-0 bg-slate-900 border border-slate-800 p-2 rounded shadow-xl hidden group-hover:block z-80 min-w-[140px]">
            <p className="text-[10px] text-slate-500 mb-1 border-b border-slate-800 pb-1">
              Active Now
            </p>

            {activeUsers.map((u) => (
              <div
                key={u._id} // Convex uses _id
                className="text-xs py-1 flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2">
                  {/* Presence Indicator */}
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />

                  <span className="truncate max-w-[100px] text-slate-300">
                    {u.userName} {/* Matches your presence schema field */}
                  </span>
                </div>

                {/* Comparison with Clerk user ID */}
                {u.userId === user?.id && (
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-bold">
                    You
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-800/50 px-4 py-2 rounded-lg border border-slate-700 hover:border-emerald-500/50 transition-colors">
          <span className="text-sm text-slate-400">Room:</span>
          <span className="text-sm font-mono font-bold text-emerald-400">
            {roomCode}
          </span>
          <button
            className="h-6 w-6 flex items-center justify-center rounded hover:bg-slate-700 hover:text-emerald-400 transition-colors text-slate-400"
            onClick={onCopyCode}
          >
            {copied ? (
              <Check className="h-3 w-3 text-emerald-400" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            className="h-9 w-9 flex items-center justify-center rounded-md hover:bg-slate-800 hover:text-emerald-400 transition-colors text-slate-400"
            onClick={onToggleFullscreen}
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </button>

          <button
            className={`h-9 w-9 flex items-center justify-center rounded-md hover:bg-slate-800 hover:text-emerald-400 transition-colors ${
              isChatOpen ? "bg-slate-800 text-emerald-400" : "text-slate-400"
            }`}
            onClick={onToggleChat}
          >
            <MessageSquare className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
