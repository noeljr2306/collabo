"use client";
// components/ide/TerminalPanel.tsx

import { useEffect, useRef, useState, useCallback } from "react";
import {
  X,
  Plus,
  Terminal as TerminalIcon,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { getWebContainer } from "@/lib/webcontainer";
import { useWCSync } from "@/hooks/useWCSync";

interface TerminalPanelProps {
  roomId: string;
  onClose: () => void;
}

interface Tab {
  id: number;
}

export default function TerminalPanel({ roomId, onClose }: TerminalPanelProps) {
  const [tabs, setTabs] = useState<Tab[]>([{ id: 1 }]);
  const [activeTab, setActiveTab] = useState(1);
  const [status, setStatus] = useState<"booting" | "ready" | "error">(
    "booting",
  );
  const [statusMsg, setStatusMsg] = useState("Booting WebContainer…");
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);

  const wcRef = useRef<any>(null);
  const bootedRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const termDivs = useRef<Map<number, HTMLDivElement>>(new Map());
  const termInstances = useRef<
    Map<number, { term: any; fit: any; kill: () => void }>
  >(new Map());
  const tabCounterRef = useRef(1);
  const watchCleanup = useRef<(() => void) | null>(null);

  const { syncAll, startWatching } = useWCSync(roomId);

  // ── Manual sync handler ───────────────────────────────────────────────────
  const handleManualSync = useCallback(async () => {
    if (!wcRef.current || syncing) return;
    setSyncing(true);
    try {
      await syncAll(wcRef.current);
      setLastSync(
        new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      );
    } finally {
      setSyncing(false);
    }
  }, [syncAll, syncing]);

  // ── Boot WebContainer ─────────────────────────────────────────────────────
  useEffect(() => {
    if (bootedRef.current) return;
    bootedRef.current = true;

    (async () => {
      try {
        const wc = await getWebContainer();
        wcRef.current = wc;
        setStatus("ready");

        // Do an initial sync to pick up any existing files
        await syncAll(wc);

        // Start filesystem watcher — auto-syncs when files change
        const cleanup = startWatching(wc);
        watchCleanup.current = cleanup;

        // Spawn first terminal
        await spawnTerminal(1, wc);
      } catch (err: any) {
        setStatus("error");
        setStatusMsg(err?.message ?? "Failed to boot WebContainer");
      }
    })();

    return () => {
      watchCleanup.current?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Spawn xterm + shell ───────────────────────────────────────────────────
  const spawnTerminal = async (id: number, wc: any) => {
    if (!containerRef.current || termDivs.current.has(id)) return;

    const div = document.createElement("div");
    div.style.cssText =
      "position:absolute;inset:0;width:100%;height:100%;padding:4px 8px;" +
      "background:#0a0a0b;overflow:hidden;display:block;";
    containerRef.current.appendChild(div);
    termDivs.current.set(id, div);
    showTab(id);

    const [{ Terminal }, { FitAddon }] = await Promise.all([
      import("xterm"),
      import("xterm-addon-fit"),
    ]);

    const term = new Terminal({
      theme: {
        background: "#0a0a0b",
        foreground: "#e4e4e7",
        cursor: "#22c55e",
        cursorAccent: "#0a0a0b",
        black: "#1c1c1f",
        red: "#ef4444",
        green: "#22c55e",
        yellow: "#eab308",
        blue: "#3b82f6",
        magenta: "#a855f7",
        cyan: "#06b6d4",
        white: "#e4e4e7",
        brightBlack: "#6b6b72",
        brightRed: "#f87171",
        brightGreen: "#4ade80",
        brightYellow: "#facc15",
        brightBlue: "#60a5fa",
        brightMagenta: "#c084fc",
        brightCyan: "#22d3ee",
        brightWhite: "#ffffff",
      },
      fontFamily: "'JetBrains Mono','Cascadia Code','Fira Code',monospace",
      fontSize: 13,
      lineHeight: 1.5,
      cursorBlink: true,
      cursorStyle: "block",
      scrollback: 5000,
    });

    const fit = new FitAddon();
    term.loadAddon(fit);
    term.open(div);

    setTimeout(() => {
      try {
        fit.fit();
      } catch {}
      term.writeln("\x1b[1;32m⚡ Collabo Terminal\x1b[0m — WebContainer ready");
      term.writeln(
        "\x1b[2mFiles created here sync automatically to the Explorer.\x1b[0m",
      );
      term.writeln("");
    }, 150);

    const ro = new ResizeObserver(() => {
      try {
        fit.fit();
      } catch {}
    });
    ro.observe(div);

    const shell = await wc.spawn("bash", [], {
      terminal: { cols: term.cols, rows: term.rows },
    });

    shell.output.pipeTo(
      new WritableStream({ write: (data: string) => term.write(data) }),
    );

    const writer = shell.input.getWriter();
    term.onData((data: string) => writer.write(data));
    term.onResize(({ cols, rows }: any) => shell.resize({ cols, rows }));

    termInstances.current.set(id, {
      term,
      fit,
      kill: () => {
        ro.disconnect();
        try {
          shell.kill();
        } catch {}
        try {
          term.dispose();
        } catch {}
        div.remove();
        termDivs.current.delete(id);
        termInstances.current.delete(id);
      },
    });
  };

  const showTab = (id: number) => {
    termDivs.current.forEach((div, key) => {
      div.style.display = key === id ? "block" : "none";
    });
    setTimeout(() => {
      try {
        termInstances.current.get(id)?.fit.fit();
      } catch {}
    }, 30);
  };

  const switchTab = (id: number) => {
    setActiveTab(id);
    showTab(id);
  };

  const addTab = () => {
    if (!wcRef.current) return;
    const id = ++tabCounterRef.current;
    setTabs((prev) => [...prev, { id }]);
    setActiveTab(id);
    void spawnTerminal(id, wcRef.current);
  };

  const closeTab = (id: number) => {
    termInstances.current.get(id)?.kill();
    setTabs((prev) => {
      const next = prev.filter((t) => t.id !== id);
      if (next.length === 0) {
        onClose();
        return prev;
      }
      if (activeTab === id) {
        const newId = next[next.length - 1].id;
        setActiveTab(newId);
        setTimeout(() => showTab(newId), 0);
      }
      return next;
    });
  };

  useEffect(
    () => () => {
      termInstances.current.forEach((t) => t.kill());
    },
    [],
  );

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: "#0a0a0b",
        borderTop: "1px solid #1c1c1f",
        overflow: "hidden",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>

      {/* ── Tab bar ── */}
      <div
        style={{
          height: 36,
          background: "#111113",
          borderBottom: "1px solid #1c1c1f",
          display: "flex",
          alignItems: "center",
          flexShrink: 0,
          overflow: "hidden",
        }}
      >
        {/* Label */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "0 14px",
            height: "100%",
            borderRight: "1px solid #1c1c1f",
            flexShrink: 0,
          }}
        >
          <TerminalIcon size={12} color="#22c55e" />
          <span
            style={{
              fontSize: 11,
              color: "#6b6b72",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            Terminal
          </span>
        </div>

        {/* Tabs */}
        {tabs.map((tab) => (
          <div
            key={tab.id}
            onClick={() => switchTab(tab.id)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              height: "100%",
              padding: "0 12px",
              borderRight: "1px solid #1c1c1f",
              cursor: "pointer",
              flexShrink: 0,
              background: activeTab === tab.id ? "#0a0a0b" : "transparent",
              color: activeTab === tab.id ? "#e4e4e7" : "#6b6b72",
              fontSize: 12,
              transition: "color 0.15s",
            }}
          >
            <span>bash</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                closeTab(tab.id);
              }}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "inherit",
                padding: 2,
                display: "flex",
                borderRadius: 4,
                opacity: 0.5,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.5")}
            >
              <X size={10} />
            </button>
          </div>
        ))}

        {/* New tab */}
        <button
          onClick={addTab}
          style={{
            padding: "0 10px",
            height: "100%",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "#6b6b72",
            display: "flex",
            alignItems: "center",
            flexShrink: 0,
            transition: "color 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#e4e4e7")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#6b6b72")}
        >
          <Plus size={14} />
        </button>

        <div style={{ flex: 1 }} />

        {/* Last sync time */}
        {lastSync && !syncing && (
          <span style={{ fontSize: 10, color: "#3a3a3f", paddingRight: 8 }}>
            synced {lastSync}
          </span>
        )}

        {/* Sync Files button */}
        <button
          onClick={handleManualSync}
          disabled={syncing || status !== "ready"}
          title="Sync terminal filesystem to Explorer"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "0 14px",
            height: "100%",
            background: "none",
            border: "none",
            borderLeft: "1px solid #1c1c1f",
            cursor: syncing || status !== "ready" ? "not-allowed" : "pointer",
            color: syncing ? "#3a3a3f" : "#22c55e",
            fontSize: 11,
            fontWeight: 600,
            flexShrink: 0,
            transition: "color 0.15s",
          }}
          onMouseEnter={(e) => {
            if (!syncing && status === "ready")
              (e.currentTarget as HTMLElement).style.background = "#111113";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = "none";
          }}
        >
          <RefreshCw
            size={12}
            style={{
              animation: syncing ? "spin 0.8s linear infinite" : "none",
            }}
          />
          {syncing ? "Syncing…" : "Sync Files"}
        </button>

        {/* Close */}
        <button
          onClick={onClose}
          style={{
            padding: "0 10px",
            height: "100%",
            background: "none",
            border: "none",
            borderLeft: "1px solid #1c1c1f",
            cursor: "pointer",
            color: "#6b6b72",
            display: "flex",
            alignItems: "center",
            flexShrink: 0,
            transition: "color 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#e4e4e7")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#6b6b72")}
        >
          <X size={14} />
        </button>
      </div>

      {/* ── Content ── */}
      <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
        {status === "booting" && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              background: "#0a0a0b",
            }}
          >
            <Loader2
              size={16}
              color="#22c55e"
              style={{ animation: "spin 0.8s linear infinite" }}
            />
            <span style={{ fontSize: 13, color: "#6b6b72" }}>{statusMsg}</span>
          </div>
        )}

        {status === "error" && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 10,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              background: "#0a0a0b",
              padding: 24,
              textAlign: "center",
            }}
          >
            <span style={{ fontSize: 13, color: "#ef4444" }}>{statusMsg}</span>
            <p style={{ fontSize: 12, color: "#6b6b72", lineHeight: 1.7 }}>
              Requires Chrome/Edge with headers:
              <br />
              <code style={{ color: "#eab308", fontSize: 11 }}>
                Cross-Origin-Opener-Policy: same-origin
              </code>
              <br />
              <code style={{ color: "#eab308", fontSize: 11 }}>
                Cross-Origin-Embedder-Policy: require-corp
              </code>
            </p>
          </div>
        )}

        <div ref={containerRef} style={{ position: "absolute", inset: 0 }} />
      </div>
    </div>
  );
}
