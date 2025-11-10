"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChatPanel({ isOpen, onClose }: ChatPanelProps) {
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>(
    []
  );
  const [message, setMessage] = useState("");

  const sendMessage = () => {
    if (!message.trim()) return;
    setMessages([...messages, { sender: "You", text: message }]);
    setMessage("");
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        side="right"
        className="bg-[#252526] border-l border-[#3e3e42] text-white w-[320px] p-0"
      >
        <SheetHeader className="p-4 border-b border-[#3e3e42]">
          <SheetTitle>Room Chat</SheetTitle>
        </SheetHeader>

        <ScrollArea className="flex-1 p-4 h-[calc(100vh-180px)]">
          <div className="space-y-3">
            {messages.map((msg, i) => (
              <div key={i}>
                <p className="text-sm text-muted-foreground font-semibold">
                  {msg.sender}
                </p>
                <p className="text-sm">{msg.text}</p>
                <Separator className="my-2 opacity-20" />
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="p-4 border-t border-[#3e3e42] flex gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            className="bg-[#1e1e1e] border-none text-white placeholder:text-gray-400"
          />
          <Button onClick={sendMessage}>Send</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
