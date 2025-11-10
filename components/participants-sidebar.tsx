"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const participants = [
  { name: "Noel", color: "bg-emerald-500" },
  { name: "Ada", color: "bg-blue-500" },
  { name: "Tunde", color: "bg-pink-500" },
];

export function ParticipantsSidebar() {
  return (
    <aside className="hidden md:flex flex-col w-60 border-l border-[#3e3e42] bg-[#252526] text-white">
      <div className="p-4 border-b border-[#3e3e42] font-semibold">
        Participants
      </div>
      <ScrollArea className="flex-1 p-4">
        <ul className="space-y-4">
          {participants.map((p, i) => (
            <li key={i} className="flex items-center gap-3">
              <Avatar className={`${p.color} text-white`}>
                <AvatarFallback>{p.name[0]}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">{p.name}</span>
            </li>
          ))}
        </ul>
      </ScrollArea>
    </aside>
  );
}
