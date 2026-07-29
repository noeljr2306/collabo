"use client";
// app/room/[id]/page.tsx

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import IDEShell from "@/components/ide/IDEShell";
import { usePresence, userColor } from "@/hooks/usePresence";
import { Loader2, ArrowLeft, Copy, Check, Code2 } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  const roomCode = params.id as string;

  const rawRoom = useQuery(api.room.getByCode, { code: roomCode });
  const activeUsers = useQuery(api.presence.list, { roomId: roomCode }) ?? [];
  const [copied, setCopied] = useState(false);

  // Presence heartbeat — runs here so it's always active
  usePresence({ roomId: roomCode, intervalMs: 4000 });

  const handleCopy = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ── Loading ───────────────────────────────────────────────────────────────
  if (rawRoom === undefined) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#0a0a0b",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <Loader2
          size={16}
          color="#22c55e"
          style={{ animation: "spin 0.8s linear infinite" }}
        />
        <span style={{ color: "#6b6b72", fontSize: 13 }}>
          Connecting to room…
        </span>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    );
  }

  // ── Not found ─────────────────────────────────────────────────────────────
  if (rawRoom === null) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#0a0a0b",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ fontSize: 40 }}>🔍</div>
        <div style={{ textAlign: "center" }}>
          <p
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: "#e4e4e7",
              marginBottom: 6,
            }}
          >
            Room not found
          </p>
          <p style={{ fontSize: 13, color: "#6b6b72" }}>
            The room code{" "}
            <code style={{ color: "#22c55e", fontFamily: "monospace" }}>
              {roomCode}
            </code>{" "}
            does not exist.
          </p>
        </div>
        <button
          onClick={() => router.push("/dashboard")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "#111113",
            border: "1px solid #2a2a2e",
            borderRadius: 10,
            padding: "10px 20px",
            color: "#a1a1aa",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <ArrowLeft size={14} /> Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "#0a0a0b",
        overflow: "hidden",
      }}
    >
      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes pulse-ring {
          0%   { transform: scale(1);   opacity: 0.6; }
          100% { transform: scale(1.8); opacity: 0; }
        }
      `}</style>

      {/* ── Slim top bar ── */}
      <div
        style={{
          height: 44,
          background: "#111113",
          borderBottom: "1px solid #1c1c1f",
          display: "flex",
          alignItems: "center",
          padding: "0 14px",
          gap: 10,
          flexShrink: 0,
          fontFamily: "system-ui, sans-serif",
          zIndex: 30,
        }}
      >
        {/* Back */}
        <Link
          href="/dashboard"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 28,
            height: 28,
            borderRadius: 7,
            color: "#6b6b72",
            textDecoration: "none",
            transition: "all 0.15s",
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = "#1c1c1f";
            (e.currentTarget as HTMLElement).style.color = "#e4e4e7";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = "transparent";
            (e.currentTarget as HTMLElement).style.color = "#6b6b72";
          }}
        >
          <ArrowLeft size={14} />
        </Link>

        {/* Logo mark */}
        <div
          style={{ width: 1, height: 16, background: "#2a2a2e", flexShrink: 0 }}
        />
        <div
          style={{
            width: 22,
            height: 22,
            borderRadius: 6,
            background: "#22c55e",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Code2 size={12} color="#000" strokeWidth={2.5} />
        </div>

        {/* Room name */}
        <span
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: "#e4e4e7",
            letterSpacing: "-0.2px",
            flexShrink: 0,
          }}
        >
          {rawRoom.name}
        </span>

        {/* Live indicator */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            flexShrink: 0,
          }}
        >
          <div style={{ position: "relative", width: 7, height: 7 }}>
            <div
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: "50%",
                background: "#22c55e",
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: "50%",
                background: "#22c55e",
                animation: "pulse-ring 2s ease-out infinite",
              }}
            />
          </div>
          <span style={{ fontSize: 11, color: "#6b6b72" }}>live</span>
        </div>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Active user chips */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            flexShrink: 0,
          }}
        >
          {activeUsers.slice(0, 5).map((u) => {
            const isMe = u.userId === user?.id;
            const color = u.color ?? userColor(u.userId);
            const name = isMe ? "You" : u.userName.split(" ")[0];
            return (
              <div
                key={u.userId}
                title={u.userName}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  background: isMe ? "#22c55e18" : color + "18",
                  border: `1px solid ${isMe ? "#22c55e40" : color + "40"}`,
                  borderRadius: 20,
                  padding: "3px 9px 3px 5px",
                  fontSize: 11,
                  fontWeight: 600,
                  color: isMe ? "#22c55e" : color,
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: isMe ? "#22c55e" : color,
                    display: "inline-block",
                    flexShrink: 0,
                  }}
                />
                {name}
              </div>
            );
          })}
          {activeUsers.length > 5 && (
            <span style={{ fontSize: 11, color: "#6b6b72" }}>
              +{activeUsers.length - 5}
            </span>
          )}
        </div>

        {/* Room code + copy */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            background: "#1c1c1f",
            border: "1px solid #2a2a2e",
            borderRadius: 8,
            padding: "5px 10px",
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: 10, color: "#6b6b72" }}>CODE</span>
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 12,
              fontWeight: 800,
              color: "#22c55e",
              letterSpacing: "0.08em",
            }}
          >
            {roomCode}
          </span>
          <button
            onClick={handleCopy}
            title="Copy room code"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#6b6b72",
              padding: 0,
              display: "flex",
              transition: "color 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#e4e4e7")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#6b6b72")}
          >
            {copied ? (
              <Check size={12} color="#22c55e" strokeWidth={2.5} />
            ) : (
              <Copy size={12} />
            )}
          </button>
        </div>
      </div>

      {/* ── IDE ── */}
      <div style={{ flex: 1, overflow: "hidden" }}>
        <IDEShell room={rawRoom} activeUsers={activeUsers} />
      </div>
    </div>
  );
}
