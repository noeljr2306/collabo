"use client";
// components/header.tsx

import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { useState } from "react";
import {
  Code2,
  ArrowLeft,
  Users,
  Copy,
  Check,
  Maximize2,
  Minimize2,
  MessageSquare,
} from "lucide-react";
import { userColor } from "@/hooks/usePresence";

type ActiveUser = {
  _id: string;
  userId: string;
  userName: string;
  lastSeen: number;
  color?: string;
  isTyping?: boolean;
};

type HeaderProps = {
  roomName: string;
  roomCode: string;
  activeUsers: ActiveUser[];
  onCopyCode: () => void;
  copied: boolean;
  onToggleFullscreen: () => void;
  isFullscreen: boolean;
  onToggleChat: () => void;
  isChatOpen: boolean;
};

function Avatar({ user, isYou }: { user: ActiveUser; isYou: boolean }) {
  const color = user.color ?? userColor(user.userId);
  const initials = user.userName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      title={isYou ? `${user.userName} (you)` : user.userName}
      style={{ position: "relative" }}
    >
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: "50%",
          background: color,
          border: isYou ? "2px solid #22c55e" : "2px solid #1c1c1f",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 10,
          fontWeight: 700,
          color: "#fff",
          flexShrink: 0,
        }}
      >
        {initials}
      </div>
      {/* Online dot */}
      <span
        style={{
          position: "absolute",
          bottom: 0,
          right: 0,
          width: 7,
          height: 7,
          borderRadius: "50%",
          background: "#22c55e",
          border: "1.5px solid #0a0a0b",
        }}
      />
      {/* Typing pulse */}
      {user.isTyping && (
        <span
          style={{
            position: "absolute",
            inset: -2,
            borderRadius: "50%",
            border: `1.5px solid ${color}`,
            animation: "ping 1s ease-in-out infinite",
            opacity: 0,
          }}
        />
      )}
    </div>
  );
}

export default function Header({
  roomName,
  roomCode,
  activeUsers,
  onCopyCode,
  copied,
  onToggleFullscreen,
  isFullscreen,
  onToggleChat,
  isChatOpen,
}: HeaderProps) {
  const router = useRouter();
  const { user } = useUser();
  const [showUsers, setShowUsers] = useState(false);

  return (
    <header
      style={{
        height: 52,
        background: "#111113",
        borderBottom: "1px solid #1c1c1f",
        display: "flex",
        alignItems: "center",
        padding: "0 16px",
        gap: 12,
        flexShrink: 0,
        fontFamily: "system-ui, -apple-system, sans-serif",
        position: "relative",
        zIndex: 30,
      }}
    >
      <style>{`
        @keyframes ping {
          0%   { transform: scale(1);   opacity: 0.6; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        .hdr-btn {
          display: flex; align-items: center; justify-content: center;
          width: 30px; height: 30px; border-radius: 8px;
          border: none; background: none; cursor: pointer;
          color: #6b6b72; transition: all 0.15s;
        }
        .hdr-btn:hover { background: #1c1c1f; color: #e4e4e7; }
        .hdr-btn.active { background: #22c55e18; color: #22c55e; }
      `}</style>

      {/* Back to dashboard */}
      <button
        className="hdr-btn"
        onClick={() => router.push("/dashboard")}
        title="Back to dashboard"
      >
        <ArrowLeft size={15} />
      </button>

      {/* Logo + Room name */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Link
          href="/dashboard"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            textDecoration: "none",
          }}
        >
          <div
            style={{
              width: 22,
              height: 22,
              borderRadius: 6,
              background: "#22c55e",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Code2 size={12} color="#000" strokeWidth={2.5} />
          </div>
        </Link>
        <div style={{ width: 1, height: 16, background: "#2a2a2e" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: "#e4e4e7",
              letterSpacing: "-0.2px",
            }}
          >
            {roomName}
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span
              style={{
                width: 5,
                height: 5,
                borderRadius: "50%",
                background: "#22c55e",
                display: "inline-block",
                animation: "ping 2s ease-in-out infinite",
              }}
            />
            <span style={{ fontSize: 11, color: "#6b6b72" }}>live</span>
          </div>
        </div>
      </div>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Presence avatars */}
      <div style={{ position: "relative" }}>
        <button
          onClick={() => setShowUsers((v) => !v)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: "#1c1c1f",
            border: "1px solid #2a2a2e",
            borderRadius: 20,
            padding: "4px 10px 4px 6px",
            cursor: "pointer",
            transition: "border-color 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#3a3a3f")}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#2a2a2e")}
        >
          {/* Stacked avatars */}
          <div style={{ display: "flex", marginRight: 2 }}>
            {activeUsers.slice(0, 4).map((u, i) => (
              <div
                key={u._id}
                style={{ marginLeft: i > 0 ? -8 : 0, zIndex: 4 - i }}
              >
                <Avatar user={u} isYou={u.userId === user?.id} />
              </div>
            ))}
            {activeUsers.length > 4 && (
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: "#2a2a2e",
                  border: "2px solid #1c1c1f",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 10,
                  fontWeight: 700,
                  color: "#6b6b72",
                  marginLeft: -8,
                }}
              >
                +{activeUsers.length - 4}
              </div>
            )}
          </div>
          <span style={{ fontSize: 12, color: "#6b6b72", fontWeight: 600 }}>
            {activeUsers.length}
          </span>
          <Users size={12} color="#6b6b72" />
        </button>

        {/* Dropdown */}
        {showUsers && (
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 8px)",
              right: 0,
              background: "#111113",
              border: "1px solid #2a2a2e",
              borderRadius: 12,
              padding: "8px",
              minWidth: 200,
              zIndex: 50,
              boxShadow: "0 16px 48px rgba(0,0,0,0.5)",
            }}
          >
            <p
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: "#3a3a3f",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                padding: "4px 8px 8px",
                marginBottom: 4,
                borderBottom: "1px solid #1c1c1f",
              }}
            >
              {activeUsers.length} online
            </p>
            {activeUsers.map((u) => {
              const isYou = u.userId === user?.id;
              const color = u.color ?? userColor(u.userId);
              return (
                <div
                  key={u._id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "7px 8px",
                    borderRadius: 8,
                  }}
                >
                  <Avatar user={u} isYou={isYou} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: "#e4e4e7",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {u.userName}
                      {isYou ? " (you)" : ""}
                    </p>
                    {u.isTyping && (
                      <p style={{ fontSize: 11, color: color }}>editing…</p>
                    )}
                  </div>
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: "#22c55e",
                      flexShrink: 0,
                    }}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Room code */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: "#1c1c1f",
          border: "1px solid #2a2a2e",
          borderRadius: 8,
          padding: "6px 12px",
        }}
      >
        <span style={{ fontSize: 11, color: "#6b6b72" }}>Code</span>
        <span
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 13,
            fontWeight: 700,
            color: "#22c55e",
            letterSpacing: "0.05em",
          }}
        >
          {roomCode}
        </span>
        <button
          onClick={onCopyCode}
          title="Copy code"
          style={{
            display: "flex",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "#6b6b72",
            padding: 0,
            transition: "color 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#e4e4e7")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#6b6b72")}
        >
          {copied ? (
            <Check size={13} color="#22c55e" strokeWidth={2.5} />
          ) : (
            <Copy size={13} />
          )}
        </button>
      </div>

      {/* Icon buttons */}
      <button
        className={`hdr-btn ${isChatOpen ? "active" : ""}`}
        onClick={onToggleChat}
        title="Chat (Ctrl+J)"
      >
        <MessageSquare size={15} />
      </button>
      <button
        className="hdr-btn"
        onClick={onToggleFullscreen}
        title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
      >
        {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
      </button>
    </header>
  );
}
