"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { Send, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ChatPanelProps {
  roomId: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  inline?: boolean; // When true, renders as sidebar panel, not modal
}

export default function ChatPanel({
  roomId,
  isOpen,
  onOpenChange,
  inline = false,
}: ChatPanelProps) {
  const { user } = useUser();
  const messages = useQuery(api.message.list, { roomId }) ?? [];
  const sendMessage = useMutation(api.message.send);

  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !user) return;
    await sendMessage({
      roomId,
      body: input.trim(),
      userName: user.fullName || user.username || "Anonymous",
      userId: user.id,
    });
    setInput("");
  };

  const chatContent = (
    <div className="flex flex-col h-full bg-[#1e1e1e] overflow-hidden">
      {/* Header - only shown in inline mode */}
      {inline && (
        <div className="px-3 py-2 border-b border-[#3c3c3c] shrink-0">
          <p className="text-[10px] uppercase tracking-widest text-[#bbb] font-semibold">
            Chat
          </p>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-2 flex flex-col gap-2 min-h-0">
        {messages.length === 0 && (
          <p className="text-[#6b6b6b] text-xs text-center mt-6">
            No messages yet. Say hi! 👋
          </p>
        )}
        {messages.map((msg: any) => {
          const isMe = msg.userId === user?.id;
          return (
            <div
              key={msg._id}
              className={`flex flex-col gap-0.5 ${isMe ? "items-end" : "items-start"}`}
            >
              <span className="text-[10px] text-[#6b6b6b]">{msg.userName}</span>
              <div
                className={`
                  max-w-[85%] px-2.5 py-1.5 rounded-lg text-[12px] leading-relaxed break-words
                  ${
                    isMe
                      ? "bg-[#0e639c] text-white rounded-br-none"
                      : "bg-[#2d2d2d] text-[#ccc] rounded-bl-none"
                  }
                `}
              >
                {msg.body}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-2 py-2 border-t border-[#3c3c3c] shrink-0 flex gap-2 items-end">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Message..."
          rows={1}
          className="flex-1 bg-[#3c3c3c] text-[#ccc] text-[12px] px-2.5 py-1.5 rounded outline-none placeholder-[#6b6b6b] resize-none border border-[#555] focus:border-[#007acc] max-h-[80px] overflow-y-auto"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim()}
          className="shrink-0 bg-[#007acc] hover:bg-[#1a85cf] disabled:opacity-40 disabled:cursor-not-allowed text-white p-1.5 rounded transition-colors"
        >
          <Send size={13} />
        </button>
      </div>
    </div>
  );

  // ── Inline mode (sidebar panel) ───────────────────────────────────────────
  if (inline) {
    return (
      <div className="flex flex-col h-full overflow-hidden">{chatContent}</div>
    );
  }

  // ── Modal mode (original behaviour) ──────────────────────────────────────
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#1e1e1e] border border-[#3c3c3c] text-[#ccc] max-w-md h-[500px] flex flex-col p-0 gap-0">
        <DialogHeader className="px-4 py-3 border-b border-[#3c3c3c] shrink-0">
          <DialogTitle className="text-sm text-[#ccc]">Room Chat</DialogTitle>
        </DialogHeader>
        <div className="flex-1 min-h-0">{chatContent}</div>
      </DialogContent>
    </Dialog>
  );
}
