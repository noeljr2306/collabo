"use client";
// components/chat-panel.tsx
// Fully functional chat — works in inline (sidebar) mode only.
// Modal mode removed since chat lives in the IDE sidebar.

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import {
  Send,
  Hash,
  Copy,
  Check,
  ChevronDown,
  MessageSquare,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Message {
  _id: string;
  _creationTime: number;
  roomId: string;
  userId: string;
  userName: string;
  body: string;
  createdAt: number;
}

interface ChatPanelProps {
  roomId: string;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  inline?: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDate(ts: number) {
  const d = new Date(ts);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString([], {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const AVATAR_COLORS = [
  "#818cf8",
  "#fb923c",
  "#34d399",
  "#f472b6",
  "#60a5fa",
  "#a78bfa",
  "#fbbf24",
  "#4ade80",
];
function avatarColor(userId: string) {
  let h = 0;
  for (let i = 0; i < userId.length; i++)
    h = userId.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

// ─── Code block parser ────────────────────────────────────────────────────────
type Part =
  | { type: "text"; content: string }
  | { type: "code"; content: string; lang: string };

function parseParts(body: string): Part[] {
  const parts: Part[] = [];
  const re = /```(\w*)\n?([\s\S]*?)```/g;
  let last = 0,
    m;
  while ((m = re.exec(body)) !== null) {
    if (m.index > last)
      parts.push({ type: "text", content: body.slice(last, m.index) });
    parts.push({ type: "code", content: m[2].trim(), lang: m[1] || "code" });
    last = m.index + m[0].length;
  }
  if (last < body.length)
    parts.push({ type: "text", content: body.slice(last) });
  return parts.length ? parts : [{ type: "text", content: body }];
}

// ─── Code block ──────────────────────────────────────────────────────────────
function CodeBlock({ code, lang }: { code: string; lang: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div
      style={{
        marginTop: 6,
        borderRadius: 8,
        overflow: "hidden",
        border: "1px solid #2a2a2e",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "#1c1c1f",
          padding: "5px 10px",
          borderBottom: "1px solid #2a2a2e",
        }}
      >
        <span
          style={{
            fontSize: 10,
            color: "#6b6b72",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          {lang}
        </span>
        <button
          onClick={() => {
            navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            fontSize: 10,
            color: "#6b6b72",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
          }}
        >
          {copied ? <Check size={10} color="#22c55e" /> : <Copy size={10} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre
        style={{
          margin: 0,
          padding: "10px 12px",
          background: "#111113",
          color: "#e4e4e7",
          fontSize: 12,
          fontFamily: "'JetBrains Mono', monospace",
          overflowX: "auto",
          lineHeight: 1.6,
          whiteSpace: "pre",
        }}
      >
        {code}
      </pre>
    </div>
  );
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
function Avatar({
  name,
  userId,
  size = 26,
}: {
  name: string;
  userId: string;
  size?: number;
}) {
  const color = avatarColor(userId);
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: color,
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.35,
        fontWeight: 700,
        color: "#fff",
        userSelect: "none",
      }}
    >
      {getInitials(name)}
    </div>
  );
}

// ─── Message bubble ───────────────────────────────────────────────────────────
function Bubble({
  msg,
  isMe,
  showMeta,
}: {
  msg: Message;
  isMe: boolean;
  showMeta: boolean;
}) {
  const parts = parseParts(msg.body);
  const hasCode = parts.some((p) => p.type === "code");

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        alignItems: isMe ? "flex-end" : "flex-start",
      }}
    >
      {showMeta && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            flexDirection: isMe ? "row-reverse" : "row",
            paddingLeft: isMe ? 0 : 32,
          }}
        >
          {!isMe && (
            <Avatar name={msg.userName} userId={msg.userId} size={22} />
          )}
          <span style={{ fontSize: 11, fontWeight: 600, color: "#a1a1aa" }}>
            {msg.userName}
          </span>
          <span style={{ fontSize: 10, color: "#3a3a3f" }}>
            {formatTime(msg.createdAt)}
          </span>
        </div>
      )}

      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: 6,
          flexDirection: isMe ? "row-reverse" : "row",
          paddingLeft: isMe ? 0 : showMeta ? 0 : 28,
        }}
      >
        {!isMe && showMeta && <div style={{ width: 22, flexShrink: 0 }} />}

        {hasCode ? (
          <div style={{ maxWidth: "90%" }}>
            {parts.map((p, i) =>
              p.type === "code" ? (
                <CodeBlock key={i} code={p.content} lang={p.lang} />
              ) : p.content.trim() ? (
                <p
                  key={i}
                  style={{
                    fontSize: 13,
                    color: isMe ? "#fff" : "#e4e4e7",
                    lineHeight: 1.6,
                    marginBottom: 4,
                  }}
                >
                  {p.content}
                </p>
              ) : null,
            )}
          </div>
        ) : (
          <div
            style={{
              maxWidth: "82%",
              background: isMe ? "#0e639c" : "#1c1c1f",
              color: isMe ? "#fff" : "#e4e4e7",
              borderRadius: isMe ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
              padding: "8px 12px",
              fontSize: 13,
              lineHeight: 1.6,
              wordBreak: "break-word",
              border: isMe ? "none" : "1px solid #2a2a2e",
            }}
          >
            {parts.map((p, i) =>
              p.type === "code" ? (
                <CodeBlock key={i} code={p.content} lang={p.lang} />
              ) : (
                <span key={i} style={{ whiteSpace: "pre-wrap" }}>
                  {p.content}
                </span>
              ),
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Date divider ─────────────────────────────────────────────────────────────
function DateDivider({ label }: { label: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        margin: "12px 0",
      }}
    >
      <div style={{ flex: 1, height: 1, background: "#1c1c1f" }} />
      <span
        style={{
          fontSize: 10,
          color: "#3a3a3f",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </span>
      <div style={{ flex: 1, height: 1, background: "#1c1c1f" }} />
    </div>
  );
}

// ─── Main ChatPanel ───────────────────────────────────────────────────────────
export default function ChatPanel({
  roomId,
  isOpen = true,
  onOpenChange,
  inline = false,
}: ChatPanelProps) {
  const { user } = useUser();
  const rawMessages = (useQuery(api.message.list, { roomId }) ??
    []) as Message[];
  const sendMessage = useMutation(api.message.send);

  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [unread, setUnread] = useState(0);
  const [showScroll, setShowScroll] = useState(false);

  const listRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const prevLen = useRef(rawMessages.length);

  // ── Auto scroll ──────────────────────────────────────────────────────────
  const scrollToBottom = useCallback((smooth = true) => {
    bottomRef.current?.scrollIntoView({
      behavior: smooth ? "smooth" : "instant",
    });
    setUnread(0);
    setShowScroll(false);
    setIsAtBottom(true);
  }, []);

  const handleScroll = useCallback(() => {
    const el = listRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 60;
    setIsAtBottom(atBottom);
    setShowScroll(!atBottom);
    if (atBottom) setUnread(0);
  }, []);

  useEffect(() => {
    const delta = rawMessages.length - prevLen.current;
    prevLen.current = rawMessages.length;
    if (delta <= 0) return;
    if (isAtBottom) scrollToBottom(true);
    else {
      setUnread((n) => n + delta);
      setShowScroll(true);
    }
  }, [rawMessages.length, isAtBottom, scrollToBottom]);

  // Initial scroll
  useEffect(() => {
    setTimeout(() => scrollToBottom(false), 80);
  }, []);

  // ── Group messages by user + date ─────────────────────────────────────────
  const grouped = useMemo(() => {
    const items:
      | { type: "date"; label: string }
      | { type: "msg"; msg: Message; showMeta: boolean }[] = [];
    let lastDate = "";
    rawMessages.forEach((msg, i) => {
      const d = formatDate(msg.createdAt);
      if (d !== lastDate) {
        items.push({ type: "date", label: d } as any);
        lastDate = d;
      }
      const prev = rawMessages[i - 1];
      const showMeta =
        !prev ||
        prev.userId !== msg.userId ||
        msg.createdAt - prev.createdAt > 300_000;
      items.push({ type: "msg", msg, showMeta } as any);
    });
    return items;
  }, [rawMessages]);

  // ── Send ─────────────────────────────────────────────────────────────────
  const handleSend = useCallback(async () => {
    const body = input.trim();
    if (!body || !user || sending) return;
    setSending(true);
    setInput("");
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
    }
    try {
      await sendMessage({
        roomId,
        body,
        userName: user.fullName || user.username || "Anonymous",
        userId: user.id,
      });
    } catch (e) {
      console.error("Failed to send:", e);
    } finally {
      setSending(false);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [input, user, sending, sendMessage, roomId]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 110) + "px";
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: "#0a0a0b",
        overflow: "hidden",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "10px 14px 10px",
          borderBottom: "1px solid #1c1c1f",
          display: "flex",
          alignItems: "center",
          gap: 8,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 20,
            height: 20,
            borderRadius: 5,
            background: "#22c55e18",
            border: "1px solid #22c55e30",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Hash size={11} color="#22c55e" />
        </div>
        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: "#e4e4e7",
            letterSpacing: "-0.1px",
          }}
        >
          room-chat
        </span>
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#22c55e",
              display: "inline-block",
            }}
          />
          <span style={{ fontSize: 10, color: "#22c55e", fontWeight: 600 }}>
            LIVE
          </span>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={listRef}
        onScroll={handleScroll}
        style={{
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
          padding: "12px 12px 4px",
          display: "flex",
          flexDirection: "column",
          gap: 4,
          scrollbarWidth: "thin",
          scrollbarColor: "#2a2a2e transparent",
        }}
      >
        {rawMessages.length === 0 ? (
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              paddingBottom: 40,
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                background: "#111113",
                border: "1px solid #2a2a2e",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <MessageSquare size={18} color="#3a3a3f" />
            </div>
            <p style={{ fontSize: 13, color: "#6b6b72", fontWeight: 500 }}>
              No messages yet
            </p>
            <p style={{ fontSize: 12, color: "#3a3a3f" }}>
              Start the conversation
            </p>
          </div>
        ) : (
          grouped.map((item: any, i) =>
            item.type === "date" ? (
              <DateDivider key={`date-${i}`} label={item.label} />
            ) : (
              <Bubble
                key={item.msg._id}
                msg={item.msg}
                isMe={item.msg.userId === user?.id}
                showMeta={item.showMeta}
              />
            ),
          )
        )}
        <div ref={bottomRef} style={{ height: 1 }} />
      </div>

      {/* Scroll to bottom */}
      {showScroll && (
        <div style={{ position: "relative" }}>
          <button
            onClick={() => scrollToBottom(true)}
            style={{
              position: "absolute",
              bottom: 8,
              right: 12,
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "#22c55e",
              color: "#000",
              border: "none",
              borderRadius: 20,
              padding: "5px 12px",
              cursor: "pointer",
              fontSize: 11,
              fontWeight: 700,
              boxShadow: "0 4px 16px rgba(34,197,94,0.3)",
              zIndex: 10,
            }}
          >
            {unread > 0 && (
              <span
                style={{
                  background: "#000",
                  color: "#22c55e",
                  fontSize: 9,
                  fontWeight: 800,
                  borderRadius: 10,
                  padding: "1px 5px",
                }}
              >
                {unread > 99 ? "99+" : unread}
              </span>
            )}
            <ChevronDown size={12} />
          </button>
        </div>
      )}

      {/* Input */}
      <div
        style={{
          padding: "8px 10px 10px",
          flexShrink: 0,
          borderTop: "1px solid #1c1c1f",
        }}
      >
        <div
          style={{
            background: "#111113",
            border: "1px solid #2a2a2e",
            borderRadius: 12,
            overflow: "hidden",
            transition: "border-color 0.15s",
          }}
          onFocusCapture={(e) =>
            (e.currentTarget.style.borderColor = "#22c55e")
          }
          onBlurCapture={(e) => (e.currentTarget.style.borderColor = "#2a2a2e")}
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Message…  (Shift+Enter for new line)"
            rows={1}
            style={{
              width: "100%",
              boxSizing: "border-box",
              background: "transparent",
              color: "#e4e4e7",
              fontSize: 13,
              padding: "10px 12px 4px",
              outline: "none",
              border: "none",
              resize: "none",
              lineHeight: 1.6,
              fontFamily: "system-ui, sans-serif",
              minHeight: 36,
              maxHeight: 110,
              overflowY: "auto",
            }}
          />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "4px 8px 8px",
            }}
          >
            <button
              title="Insert code block"
              onClick={() => {
                setInput((v) => v + "\n```\n\n```");
                setTimeout(() => inputRef.current?.focus(), 0);
              }}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#3a3a3f",
                padding: "3px 6px",
                borderRadius: 5,
                fontSize: 11,
                fontFamily: "monospace",
                transition: "color 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#6b6b72")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#3a3a3f")}
            >
              {"</>"}
            </button>
            <button
              onClick={() => void handleSend()}
              disabled={!input.trim() || sending}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                background: input.trim() && !sending ? "#22c55e" : "#1c1c1f",
                color: input.trim() && !sending ? "#000" : "#3a3a3f",
                border: "none",
                borderRadius: 8,
                padding: "5px 12px",
                cursor: input.trim() && !sending ? "pointer" : "not-allowed",
                fontSize: 12,
                fontWeight: 700,
                transition: "all 0.15s",
              }}
            >
              <Send size={11} />
              Send
            </button>
          </div>
        </div>
        <p
          style={{
            fontSize: 10,
            color: "#2a2a2e",
            marginTop: 5,
            paddingLeft: 2,
          }}
        >
          Enter to send · Shift+Enter for new line · {"</>"} for code block
        </p>
      </div>
    </div>
  );
}
