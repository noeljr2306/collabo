"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import IDEShell from "@/components/ide/IDEShell";
import { usePresence } from "@/hooks/usePresence";
import { Loader2 } from "lucide-react";

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const roomCode = params.id as string;
  const { user } = useUser();

  const rawRoom = useQuery(api.room.getByCode, { code: roomCode });
  const activeUsers = useQuery(api.presence.list, { roomId: roomCode }) ?? [];

  // usePresence handles all heartbeat, cursor, selection, and leave logic
  // It runs at the room page level so it's always active regardless of which component is focused
  const { color } = usePresence({ roomId: roomCode, intervalMs: 4000 });

  if (rawRoom === undefined) {
    return (
      <div className="min-h-screen bg-[#1e1e1e] flex items-center justify-center gap-3">
        <Loader2 className="animate-spin text-[#007acc]" size={18} />
        <span className="text-[#858585] font-mono text-sm">
          Initializing session…
        </span>
      </div>
    );
  }

  if (rawRoom === null) {
    return (
      <div className="min-h-screen bg-[#1e1e1e] flex flex-col items-center justify-center gap-4 text-[#ccc]">
        <div className="text-4xl">🔍</div>
        <p className="text-base font-semibold">Room not found</p>
        <p className="text-[#555] text-sm">
          The room code <code className="text-[#9cdcfe]">{roomCode}</code> does
          not exist.
        </p>
        <Button onClick={() => router.push("/dashboard")} className="mt-2">
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#1e1e1e] overflow-hidden">
      {/* Slim top bar */}
      <div className="h-8 bg-[#323233] border-b border-[#252526] flex items-center px-3 gap-3 shrink-0">
        {/* Room name + code */}
        <span className="text-[12px] text-[#cccccc] font-semibold">
          {rawRoom.name}
        </span>
        <span className="text-[11px] text-[#555] font-mono">{roomCode}</span>

        {/* Copy room code */}
        <button
          onClick={() => navigator.clipboard.writeText(roomCode)}
          className="text-[10px] text-[#007acc] hover:text-[#4fc1ff] transition-colors ml-1"
          title="Copy room code"
        >
          Copy invite
        </button>

        <div className="flex-1" />

        {/* Online users — name chips */}
        <div className="flex items-center gap-1.5">
          {activeUsers.slice(0, 4).map((u) => {
            const isMe = u.userId === user?.id;
            const bgColor = u.color ?? "#007acc";
            return (
              <div
                key={u.userId}
                style={{
                  background: isMe ? "#007acc" : bgColor + "33",
                  borderColor: isMe ? "#007acc" : bgColor,
                }}
                className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] border"
                title={isMe ? "You" : u.userName}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: isMe ? "white" : bgColor }}
                />
                <span
                  style={{ color: isMe ? "white" : bgColor }}
                  className="font-medium"
                >
                  {isMe ? "You" : u.userName.split(" ")[0]}
                </span>
              </div>
            );
          })}
          {activeUsers.length > 4 && (
            <span className="text-[10px] text-[#555]">
              +{activeUsers.length - 4}
            </span>
          )}
        </div>
      </div>

      {/* Full IDE */}
      <div className="flex-1 overflow-hidden">
        <IDEShell room={rawRoom} activeUsers={activeUsers} />
      </div>
    </div>
  );
}
