"use client";
// app/dashboard/page.tsx

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser, UserButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Code2,
  Plus,
  Users,
  Clock,
  ArrowRight,
  Copy,
  Check,
  Search,
  Hash,
  Loader2,
  X,
} from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function CopyCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      title="Copy room code"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        background: "#1c1c1f",
        border: "1px solid #2a2a2e",
        borderRadius: 6,
        padding: "3px 9px",
        color: "#6b6b72",
        fontSize: 11,
        fontFamily: "'JetBrains Mono', monospace",
        cursor: "pointer",
        transition: "all 0.15s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "#3a3a3f";
        e.currentTarget.style.color = "#a1a1aa";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "#2a2a2e";
        e.currentTarget.style.color = "#6b6b72";
      }}
    >
      {copied ? (
        <Check size={10} color="#22c55e" strokeWidth={3} />
      ) : (
        <Copy size={10} />
      )}
      {code}
    </button>
  );
}

// ─── Create Room Modal ────────────────────────────────────────────────────────

function CreateRoomModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (code: string) => void;
}) {
  const createRoom = useMutation(api.room.create);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError("");
    try {
      const { roomCode } = await createRoom({ name: name.trim() });
      onCreated(roomCode);
    } catch (err: any) {
      setError(err?.message ?? "Failed to create room. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.72)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        padding: 24,
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div
        style={{
          background: "#111113",
          border: "1px solid #2a2a2e",
          borderRadius: 18,
          padding: "28px 28px 24px",
          width: "100%",
          maxWidth: 420,
          boxShadow: "0 32px 80px rgba(0,0,0,0.6)",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 6,
          }}
        >
          <div>
            <h2
              style={{
                fontSize: 18,
                fontWeight: 800,
                color: "#fff",
                letterSpacing: "-0.4px",
              }}
            >
              New room
            </h2>
            <p style={{ fontSize: 13, color: "#6b6b72", marginTop: 2 }}>
              A 6-character invite code is generated automatically.
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#6b6b72",
              padding: 6,
              borderRadius: 8,
              display: "flex",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#1c1c1f";
              e.currentTarget.style.color = "#e4e4e7";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "none";
              e.currentTarget.style.color = "#6b6b72";
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: "#1c1c1f", margin: "18px 0" }} />

        {/* Error */}
        {error && (
          <div
            style={{
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.2)",
              borderRadius: 10,
              padding: "10px 14px",
              marginBottom: 16,
              fontSize: 13,
              color: "#ef4444",
            }}
          >
            {error}
          </div>
        )}

        <form
          onSubmit={handleCreate}
          style={{ display: "flex", flexDirection: "column", gap: 20 }}
        >
          <div>
            <label
              style={{
                display: "block",
                fontSize: 13,
                fontWeight: 600,
                color: "#a1a1aa",
                marginBottom: 7,
              }}
            >
              Room name
            </label>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Hackathon 2025, Sprint #3..."
              maxLength={48}
              style={{
                width: "100%",
                boxSizing: "border-box",
                background: "#1c1c1f",
                border: "1px solid #2a2a2e",
                borderRadius: 10,
                padding: "11px 14px",
                color: "#e4e4e7",
                fontSize: 14,
                fontFamily: "system-ui, sans-serif",
                outline: "none",
                transition: "border-color 0.15s, box-shadow 0.15s",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#22c55e";
                e.target.style.boxShadow = "0 0 0 3px rgba(34,197,94,0.12)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#2a2a2e";
                e.target.style.boxShadow = "none";
              }}
            />
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                background: "transparent",
                border: "1px solid #2a2a2e",
                borderRadius: 10,
                padding: "10px",
                cursor: "pointer",
                color: "#a1a1aa",
                fontSize: 14,
                fontWeight: 600,
                fontFamily: "system-ui, sans-serif",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#3a3a3f";
                e.currentTarget.style.color = "#e4e4e7";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#2a2a2e";
                e.currentTarget.style.color = "#a1a1aa";
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || loading}
              style={{
                flex: 1,
                background: "#22c55e",
                color: "#000",
                border: "none",
                borderRadius: 10,
                padding: "10px",
                cursor: !name.trim() || loading ? "not-allowed" : "pointer",
                fontSize: 14,
                fontWeight: 700,
                fontFamily: "system-ui, sans-serif",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                opacity: !name.trim() || loading ? 0.5 : 1,
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => {
                if (name.trim() && !loading)
                  e.currentTarget.style.background = "#16a34a";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#22c55e";
              }}
            >
              {loading ? (
                <>
                  <Loader2
                    size={14}
                    style={{ animation: "spin 0.7s linear infinite" }}
                  />{" "}
                  Creating…
                </>
              ) : (
                <>
                  <Plus size={14} /> Create room
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Join Room Modal ──────────────────────────────────────────────────────────

function JoinRoomModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = code.trim().toUpperCase();
    if (trimmed.length !== 6) {
      setError("Room codes are exactly 6 characters.");
      return;
    }
    router.push(`/room/${trimmed}`);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.72)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        padding: 24,
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div
        style={{
          background: "#111113",
          border: "1px solid #2a2a2e",
          borderRadius: 18,
          padding: "28px 28px 24px",
          width: "100%",
          maxWidth: 380,
          boxShadow: "0 32px 80px rgba(0,0,0,0.6)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 6,
          }}
        >
          <div>
            <h2
              style={{
                fontSize: 18,
                fontWeight: 800,
                color: "#fff",
                letterSpacing: "-0.4px",
              }}
            >
              Join a room
            </h2>
            <p style={{ fontSize: 13, color: "#6b6b72", marginTop: 2 }}>
              Enter a 6-character room code to join.
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#6b6b72",
              padding: 6,
              borderRadius: 8,
              display: "flex",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#1c1c1f";
              e.currentTarget.style.color = "#e4e4e7";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "none";
              e.currentTarget.style.color = "#6b6b72";
            }}
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ height: 1, background: "#1c1c1f", margin: "18px 0" }} />

        {error && (
          <div
            style={{
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.2)",
              borderRadius: 10,
              padding: "10px 14px",
              marginBottom: 16,
              fontSize: 13,
              color: "#ef4444",
            }}
          >
            {error}
          </div>
        )}

        <form
          onSubmit={handleJoin}
          style={{ display: "flex", flexDirection: "column", gap: 20 }}
        >
          <div>
            <label
              style={{
                display: "block",
                fontSize: 13,
                fontWeight: 600,
                color: "#a1a1aa",
                marginBottom: 7,
              }}
            >
              Room code
            </label>
            <input
              autoFocus
              value={code}
              onChange={(e) => {
                setCode(
                  e.target.value
                    .toUpperCase()
                    .replace(/[^A-Z0-9]/g, "")
                    .slice(0, 6),
                );
                setError("");
              }}
              placeholder="ABC123"
              maxLength={6}
              style={{
                width: "100%",
                boxSizing: "border-box",
                background: "#1c1c1f",
                border: "1px solid #2a2a2e",
                borderRadius: 10,
                padding: "14px",
                color: "#e4e4e7",
                fontSize: 26,
                fontWeight: 800,
                letterSpacing: "0.35em",
                textAlign: "center",
                fontFamily: "'JetBrains Mono', monospace",
                outline: "none",
                transition: "border-color 0.15s, box-shadow 0.15s",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#22c55e";
                e.target.style.boxShadow = "0 0 0 3px rgba(34,197,94,0.12)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#2a2a2e";
                e.target.style.boxShadow = "none";
              }}
            />
            {/* Progress dots */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: 6,
                marginTop: 10,
              }}
            >
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: i < code.length ? "#22c55e" : "#2a2a2e",
                    transition: "background 0.15s",
                  }}
                />
              ))}
            </div>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                background: "transparent",
                border: "1px solid #2a2a2e",
                borderRadius: 10,
                padding: "10px",
                cursor: "pointer",
                color: "#a1a1aa",
                fontSize: 14,
                fontWeight: 600,
                fontFamily: "system-ui, sans-serif",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#3a3a3f";
                e.currentTarget.style.color = "#e4e4e7";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#2a2a2e";
                e.currentTarget.style.color = "#a1a1aa";
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={code.length !== 6}
              style={{
                flex: 1,
                background: "#22c55e",
                color: "#000",
                border: "none",
                borderRadius: 10,
                padding: "10px",
                cursor: code.length !== 6 ? "not-allowed" : "pointer",
                fontSize: 14,
                fontWeight: 700,
                fontFamily: "system-ui, sans-serif",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                opacity: code.length !== 6 ? 0.4 : 1,
                transition: "background 0.15s, opacity 0.15s",
              }}
              onMouseEnter={(e) => {
                if (code.length === 6)
                  e.currentTarget.style.background = "#16a34a";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#22c55e";
              }}
            >
              <ArrowRight size={14} /> Join room
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Room Card ────────────────────────────────────────────────────────────────

function RoomCard({ room }: { room: any }) {
  const router = useRouter();
  return (
    <div
      onClick={() => router.push(`/room/${room.code}`)}
      style={{
        background: "#111113",
        border: "1px solid #2a2a2e",
        borderRadius: 14,
        padding: "20px 22px",
        cursor: "pointer",
        transition: "border-color 0.15s, background 0.15s",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "#3a3a3f";
        e.currentTarget.style.background = "#161618";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "#2a2a2e";
        e.currentTarget.style.background = "#111113";
      }}
    >
      <div
        style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 0 }}
      >
        {/* Icon */}
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 11,
            background: "#1c1c1f",
            border: "1px solid #2a2a2e",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Hash size={17} color="#22c55e" />
        </div>
        {/* Info */}
        <div style={{ minWidth: 0 }}>
          <p
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: "#e4e4e7",
              letterSpacing: "-0.2px",
              marginBottom: 5,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {room.name}
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <CopyCode code={room.code} />
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                fontSize: 12,
                color: "#6b6b72",
              }}
            >
              <Clock size={11} />
              {timeAgo(room.createdAt)}
            </span>
          </div>
        </div>
      </div>

      {/* Open button */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          background: "#1c1c1f",
          border: "1px solid #2a2a2e",
          borderRadius: 8,
          padding: "7px 14px",
          color: "#a1a1aa",
          fontSize: 13,
          fontWeight: 600,
          flexShrink: 0,
          transition: "all 0.15s",
          whiteSpace: "nowrap",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "#22c55e";
          e.currentTarget.style.color = "#22c55e";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "#2a2a2e";
          e.currentTarget.style.color = "#a1a1aa";
        }}
      >
        Open <ArrowRight size={13} />
      </div>
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user } = useUser();
  const router = useRouter();
  const rooms = useQuery(api.room.getRecent);

  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = (rooms ?? []).filter(
    (r: any) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.code.toLowerCase().includes(search.toLowerCase()),
  );

  const firstName = user?.firstName || user?.username || "there";
  const greeting =
    new Date().getHours() < 12
      ? "morning"
      : new Date().getHours() < 18
        ? "afternoon"
        : "evening";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0a0b",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <style>{`
        @keyframes spin    { to { transform: rotate(360deg) } }
        @keyframes fadeUp  { from { opacity: 0; transform: translateY(10px) } to { opacity: 1; transform: translateY(0) } }
        .room-grid { animation: fadeUp 0.35s ease forwards; }
      `}</style>

      {/* ── Top nav ── */}
      <nav
        style={{
          height: 56,
          padding: "0 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid #1c1c1f",
          background: "#0a0a0b",
          position: "sticky",
          top: 0,
          zIndex: 40,
        }}
      >
        {/* Logo */}
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            textDecoration: "none",
          }}
        >
          <div
            style={{
              width: 26,
              height: 26,
              borderRadius: 7,
              background: "#22c55e",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Code2 size={14} color="#000" strokeWidth={2.5} />
          </div>
          <span
            style={{
              color: "#e4e4e7",
              fontWeight: 700,
              fontSize: 15,
              letterSpacing: "-0.2px",
            }}
          >
            Collabo
          </span>
        </Link>

        {/* Right side */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span
            style={{
              fontSize: 13,
              color: "#6b6b72",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#22c55e",
                display: "inline-block",
              }}
            />
            {user?.emailAddresses?.[0]?.emailAddress}
          </span>
          <UserButton
            afterSignOutUrl="/"
            appearance={{ elements: { userButtonAvatarBox: "w-8 h-8" } }}
          />
        </div>
      </nav>

      {/* ── Page body ── */}
      <main
        style={{ maxWidth: 900, margin: "0 auto", padding: "52px 24px 80px" }}
      >
        {/* Page header */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            marginBottom: 40,
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <div>
            <h1
              style={{
                fontSize: 26,
                fontWeight: 800,
                color: "#fff",
                letterSpacing: "-0.7px",
                marginBottom: 5,
              }}
            >
              Good {greeting}, {firstName}
            </h1>
            <p style={{ fontSize: 14, color: "#6b6b72" }}>
              {rooms === undefined
                ? "Loading rooms…"
                : rooms.length === 0
                  ? "Create your first room to start collaborating."
                  : `${rooms.length} room${rooms.length === 1 ? "" : "s"} in your workspace`}
            </p>
          </div>

          {/* Action buttons */}
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={() => setShowJoin(true)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                background: "#111113",
                border: "1px solid #2a2a2e",
                borderRadius: 10,
                padding: "9px 18px",
                cursor: "pointer",
                color: "#a1a1aa",
                fontSize: 14,
                fontWeight: 600,
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#3a3a3f";
                e.currentTarget.style.color = "#e4e4e7";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#2a2a2e";
                e.currentTarget.style.color = "#a1a1aa";
              }}
            >
              <Users size={14} /> Join room
            </button>
            <button
              onClick={() => setShowCreate(true)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                background: "#22c55e",
                border: "none",
                borderRadius: 10,
                padding: "9px 18px",
                cursor: "pointer",
                color: "#000",
                fontSize: 14,
                fontWeight: 700,
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#16a34a";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#22c55e";
              }}
            >
              <Plus size={14} /> New room
            </button>
          </div>
        </div>

        {/* Search */}
        {rooms && rooms.length > 0 && (
          <div style={{ position: "relative", marginBottom: 20 }}>
            <Search
              size={14}
              color="#6b6b72"
              style={{
                position: "absolute",
                left: 14,
                top: "50%",
                transform: "translateY(-50%)",
                pointerEvents: "none",
              }}
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or code…"
              style={{
                width: "100%",
                boxSizing: "border-box",
                background: "#111113",
                border: "1px solid #2a2a2e",
                borderRadius: 10,
                padding: "10px 14px 10px 38px",
                color: "#e4e4e7",
                fontSize: 14,
                fontFamily: "system-ui, sans-serif",
                outline: "none",
                transition: "border-color 0.15s, box-shadow 0.15s",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#22c55e";
                e.target.style.boxShadow = "0 0 0 3px rgba(34,197,94,0.12)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#2a2a2e";
                e.target.style.boxShadow = "none";
              }}
            />
          </div>
        )}

        {/* Rooms list */}
        {rooms === undefined ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              padding: "80px 0",
            }}
          >
            <Loader2
              size={20}
              color="#22c55e"
              style={{ animation: "spin 0.8s linear infinite" }}
            />
          </div>
        ) : filtered.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "72px 24px",
              border: "1px dashed #2a2a2e",
              borderRadius: 16,
            }}
          >
            {search ? (
              <>
                <p
                  style={{
                    fontSize: 15,
                    fontWeight: 600,
                    color: "#e4e4e7",
                    marginBottom: 6,
                  }}
                >
                  No rooms match &ldquo;{search}&rdquo;
                </p>
                <p style={{ fontSize: 13, color: "#6b6b72" }}>
                  Try a different name or room code.
                </p>
              </>
            ) : (
              <>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 14,
                    background: "#111113",
                    border: "1px solid #2a2a2e",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 16px",
                  }}
                >
                  <Hash size={20} color="#3a3a3f" />
                </div>
                <p
                  style={{
                    fontSize: 15,
                    fontWeight: 600,
                    color: "#e4e4e7",
                    marginBottom: 6,
                  }}
                >
                  No rooms yet
                </p>
                <p style={{ fontSize: 13, color: "#6b6b72", marginBottom: 22 }}>
                  Create a room and invite your team to start coding together.
                </p>
                <button
                  onClick={() => setShowCreate(true)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    background: "#22c55e",
                    border: "none",
                    borderRadius: 10,
                    padding: "10px 22px",
                    cursor: "pointer",
                    color: "#000",
                    fontSize: 14,
                    fontWeight: 700,
                    fontFamily: "system-ui, sans-serif",
                  }}
                >
                  <Plus size={14} /> Create your first room
                </button>
              </>
            )}
          </div>
        ) : (
          <div
            className="room-grid"
            style={{ display: "flex", flexDirection: "column", gap: 10 }}
          >
            {/* Section label */}
            <p
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "#3a3a3f",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginBottom: 4,
                paddingLeft: 2,
              }}
            >
              Your rooms · {filtered.length}
            </p>
            {filtered.map((room: any) => (
              <RoomCard key={room._id} room={room} />
            ))}
          </div>
        )}
      </main>

      {showCreate && (
        <CreateRoomModal
          onClose={() => setShowCreate(false)}
          onCreated={(code) => {
            setShowCreate(false);
            router.push(`/room/${code}`);
          }}
        />
      )}
      {showJoin && <JoinRoomModal onClose={() => setShowJoin(false)} />}
    </div>
  );
}
