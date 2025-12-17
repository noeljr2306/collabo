"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const participants = [
  { name: "Noel", color: "text-emerald-500" },
  { name: "Ada", color: "text-blue-500" },
  { name: "Tunde", color: "text-pink-500" },
  { name: "Kizito", color: "text-green-500" },
  { name: "Marho", color: "text-yellow-500" },
];

export function ParticipantsSidebar() {
  return (
    <aside className="hidden md:flex flex-col w-60 border-l border-slate-800 bg-slate-900/50">
      <div className="p-4 border-b border-slate-800 text-slate-400 font-semibold">
        Participants
      </div>
      <ScrollArea className="flex-1 p-4">
        <ul className="space-y-4">
          {participants.map((p, i) => (
            <li key={i} className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback className={`${p.color} bg-slate-600`}>
                  {p.name[0]}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">{p.name}</span>
            </li>
          ))}
        </ul>
      </ScrollArea>
    </aside>
  );
}
