// components/ChatModal.tsx
"use client";
import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { Send } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ChatModalProps {
  roomId: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ChatModal({ roomId, isOpen, onOpenChange }: ChatModalProps) {
  const { user } = useUser();
  const messages = useQuery(api.message.list, { roomId }) || [];
  const sendMessage = useMutation(api.message.send);
  const [input, setInput] = useState("");

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !user) return;

    await sendMessage({
      roomId,
      body: input,
      userName: user.fullName || user.username || "Anonymous",
    });
    setInput("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-slate-800 text-slate-50 sm:max-w-[425px] h-[500px] flex flex-col">
        <DialogHeader className="border-b border-slate-800 pb-4">
          <DialogTitle>Room Chat</DialogTitle>
        </DialogHeader>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 flex flex-col-reverse">
          {messages.map((msg: {
            _id: string;
            userId: string;
            userName: string;
            body: string;
          }) => (
            <div
              key={msg._id}
              className={`flex flex-col ${msg.userId === user?.id ? "items-end" : "items-start"}`}
            >
              <span className="text-[10px] text-slate-500 mb-1">
                {msg.userName}
              </span>
              <div
                className={`px-3 py-2 rounded-lg max-w-[80%] text-sm ${
                  msg.userId === user?.id
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-800 text-slate-200"
                }`}
              >
                {msg.body}
              </div>
            </div>
          ))}
        </div>

        {/* Input Form */}
        <form
          onSubmit={handleSend}
          className="pt-4 border-t border-slate-800 flex gap-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="bg-slate-800 border-slate-700"
          />
          <Button
            type="submit"
            size="icon"
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
