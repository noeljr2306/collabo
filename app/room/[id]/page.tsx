"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChatPanel } from "@/components/chat-panel";
import { ParticipantsSidebar } from "@/components/participants-sidebar";
import { Code2, Copy, MessageSquare, ArrowLeft } from "lucide-react";

export default function RoomPage() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const roomCode = "ABC123";

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
  };

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const handleMessage = (event: MessageEvent) => {
      console.log("Message from VSCode:", event.data);
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return (
    <div className="h-screen flex flex-col bg-[#1e1e1e] text-white">
      <header className="bg-[#252526] border-b border-[#3e3e42] px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="h-9 w-9">
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <Code2 className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-bold">VSCode Room</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-lg">
            <span className="text-sm text-muted-foreground">Room Code:</span>
            <span className="text-sm font-mono font-semibold">{roomCode}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={copyRoomCode}
            >
              <Copy className="h-3 w-3" />
            </Button>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={copyRoomCode}
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <MessageSquare className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* VSCode Web iframe */}
        <div className="flex-1 p-2 overflow-hidden rounded-lg">
          <iframe
            ref={iframeRef}
            src="https://vscode.dev/"
            className="w-full h-full rounded-lg border border-[#3e3e42]"
          ></iframe>
        </div>

        {/* Participants Sidebar */}
        <ParticipantsSidebar />

        {/* Chat Panel */}
        <ChatPanel isOpen={false} onClose={() => {}} />
      </div>
    </div>
  );
}
