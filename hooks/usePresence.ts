// hooks/usePresence.ts
// Manages local user presence — heartbeat, cursor, selection, typing state.
// One hook to rule them all — import this wherever you need presence.

import { useEffect, useRef, useCallback } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";

// Deterministic color per userId — same 10 colors as chat avatars
const PRESENCE_COLORS = [
  "#007acc",
  "#c586c0",
  "#6a9955",
  "#f44747",
  "#dcdcaa",
  "#4ec9b0",
  "#ce9178",
  "#9cdcfe",
  "#d7ba7d",
  "#569cd6",
];

export function userColor(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return PRESENCE_COLORS[Math.abs(hash) % PRESENCE_COLORS.length];
}

interface CursorPosition {
  fileId: string;
  line: number;
  column: number;
}

interface SelectionRange {
  fileId: string;
  startLine: number;
  startColumn: number;
  endLine: number;
  endColumn: number;
}

interface UsePresenceOptions {
  roomId: string;
  intervalMs?: number; // heartbeat interval, default 4000
}

export function usePresence({ roomId, intervalMs = 4000 }: UsePresenceOptions) {
  const { user } = useUser();
  const updatePresence = useMutation(api.presence.update);
  const leavePresence = useMutation(api.presence.leave);

  const cursorRef = useRef<CursorPosition | undefined>(undefined);
  const selectionRef = useRef<SelectionRange | undefined>(undefined);
  const isTypingRef = useRef(false);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const userName = user?.fullName || user?.username || "Anonymous";
  const color = user ? userColor(user.id) : "#007acc";

  const flush = useCallback(() => {
    if (!user) return;
    void updatePresence({
      roomId,
      userName,
      cursor: cursorRef.current,
      selection: selectionRef.current,
      isTyping: isTypingRef.current,
      color,
    });
  }, [roomId, userName, color, updatePresence, user]);

  // Heartbeat — keeps presence alive
  useEffect(() => {
    if (!user) return;
    flush(); // immediate on mount
    const id = setInterval(flush, intervalMs);
    return () => clearInterval(id);
  }, [flush, intervalMs, user]);

  // Leave on unmount / tab close
  useEffect(() => {
    if (!user) return;
    const handleLeave = () => void leavePresence({ roomId });
    window.addEventListener("beforeunload", handleLeave);
    return () => {
      handleLeave();
      window.removeEventListener("beforeunload", handleLeave);
    };
  }, [roomId, leavePresence, user]);

  // ── Exposed updaters ──────────────────────────────────────────────────────

  const updateCursor = useCallback(
    (pos: CursorPosition) => {
      cursorRef.current = pos;
      flush();
    },
    [flush],
  );

  const updateSelection = useCallback(
    (sel: SelectionRange | undefined) => {
      selectionRef.current = sel;
      flush();
    },
    [flush],
  );

  const setTyping = useCallback(
    (typing: boolean) => {
      isTypingRef.current = typing;
      flush();

      // Auto-clear typing after 2s of no activity
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      if (typing) {
        typingTimeoutRef.current = setTimeout(() => {
          isTypingRef.current = false;
          flush();
        }, 2000);
      }
    },
    [flush],
  );

  return { updateCursor, updateSelection, setTyping, color };
}
