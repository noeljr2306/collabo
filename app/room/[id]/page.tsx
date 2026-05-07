"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import Header from "@/components/header";
import IDEShell from "@/components/ide/IDEShell";

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const roomCode = params.id as string;

  const rawRoom = useQuery(api.room.getByCode, { code: roomCode });
  const activeUsers = useQuery(api.presence.list, { roomId: roomCode }) ?? [];
  const updatePresence = useMutation(api.presence.update);

  const { user } = useUser();
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Heartbeat presence
  useEffect(() => {
    if (!roomCode || !user) return;
    const name = user.fullName || user.username || "Anonymous";
    updatePresence({ roomId: roomCode, userName: name });
    const interval = setInterval(() => {
      updatePresence({ roomId: roomCode, userName: name });
    }, 5000);
    return () => clearInterval(interval);
  }, [roomCode, user, updatePresence]);

  if (rawRoom === undefined) {
    return (
      <div className="min-h-screen bg-[#1e1e1e] flex items-center justify-center">
        <div className="text-[#007acc] animate-pulse font-mono text-sm">
          Initializing session...
        </div>
      </div>
    );
  }

  if (rawRoom === null) {
    return (
      <div className="min-h-screen bg-[#1e1e1e] flex flex-col items-center justify-center text-[#ccc]">
        <h1 className="text-xl font-bold mb-4">Room not found</h1>
        <Button onClick={() => router.push("/dashboard")}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-[#1e1e1e] overflow-hidden">
      <Header
        roomName={rawRoom.name}
        roomCode={rawRoom.code}
        onCopyCode={handleCopyCode}
        copied={copied}
        onToggleFullscreen={toggleFullscreen}
        isFullscreen={isFullscreen}
        onToggleChat={() => {}} // Chat is now inside the IDE sidebar
        isChatOpen={false}
        activeUsers={activeUsers}
      />

      {/* Full IDE */}
      <div className="flex-1 overflow-hidden">
        <IDEShell room={rawRoom} activeUsers={activeUsers} />
      </div>
    </div>
  );
}
