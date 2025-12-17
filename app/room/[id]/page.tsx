"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { useMutation } from "convex/react";
import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import ChatModal from "@/components/chat-panel";
import EditorContainer from "@/components/code-editor";

export default function RoomPage() {
  // 🔹 ROUTING
  const params = useParams();
  const router = useRouter();
  const roomCode = params.id as string;

  // 🔹 DATA (HOOKS MUST BE FIRST)
  const rawRoom = useQuery(api.room.getByCode, { code: roomCode });
  const activeUsers = useQuery(api.presence.list, { roomId: roomCode }) || [];
  const updatePresence = useMutation(api.presence.update);

  // 🔹 UI STATE
  const [copied, setCopied] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { user } = useUser();

  useEffect(() => {
    if (!roomCode || !user) return;

    // Use the name from Clerk (fallback to "Anonymous" if not set)
    const name = user.fullName || user.username || "Anonymous";

    // Initial heartbeat
    updatePresence({ roomId: roomCode, userName: name });

    const interval = setInterval(() => {
      updatePresence({ roomId: roomCode, userName: name });
    }, 5000);

    return () => clearInterval(interval);
  }, [roomCode, user, updatePresence]);
  // 🔹 LOADING STATE
  if (rawRoom === undefined) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-emerald-400 animate-pulse font-mono">
          Initializing session...
        </div>
      </div>
    );
  }

  // 🔹 NOT FOUND
  if (rawRoom === null) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-50">
        <h1 className="text-xl font-bold">Room not found</h1>
        <Button onClick={() => router.push("/dashboard")} className="mt-4">
          Back to Dashboard
        </Button>
      </div>
    );
  }

  // 🔹 SAFE ROOM OBJECT
  const room = {
    ...rawRoom,
    content: rawRoom.content ?? "// Happy Coding!",
    language: rawRoom.language ?? "javascript",
  };

  // 🔹 HANDLERS
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
    <div className="h-screen flex flex-col bg-slate-950 overflow-hidden">
      <Header
        roomName={room.name}
        roomCode={room.code}
        onCopyCode={handleCopyCode}
        copied={copied}
        onToggleFullscreen={toggleFullscreen}
        isFullscreen={isFullscreen}
        onToggleChat={() => setIsChatOpen(true)}
        isChatOpen={isChatOpen}
        activeUsers={activeUsers}
      />

      <EditorContainer room={room} />
      <ChatModal
        roomId={roomCode}
        isOpen={isChatOpen}
        onOpenChange={setIsChatOpen}
      />
    </div>
  );
}
