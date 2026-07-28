"use client";

import { useEffect, useRef, useState } from "react";
import { X, Plus, Terminal as TerminalIcon, Loader2 } from "lucide-react";
import { getWebContainer } from "@/lib/webcontainer";

interface TerminalPanelProps {
  onClose: () => void;
}

interface TermTab { id: number; }

export default function TerminalPanel({  onClose }: TerminalPanelProps) {
  const [tabs, setTabs] = useState<TermTab[]>([{ id: 1 }]);
  const [activeTab, setActiveTab] = useState(1);
  const [status, setStatus] = useState<"booting" | "ready" | "error">("booting");
  const [statusMsg, setStatusMsg] = useState("Booting WebContainer...");

  const wcRef = useRef<any>(null);
  const termRefs = useRef<Map<number, { term: any; fit: any; dispose: () => void }>>(new Map());
  const mountedRef = useRef(false);

  // Single stable container div — NEVER re-rendered by React
  // We manually create/move terminal divs inside this
  const containerRef = useRef<HTMLDivElement>(null);
  const termDomRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  // ── Boot WebContainer ─────────────────────────────────────────────────────
  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;

    (async () => {
      try {
        setStatusMsg("Starting container...");
        const wc = await getWebContainer();
        wcRef.current = wc;
        setStatus("ready");
        // Mount first terminal
        void spawnTab(1, wc);
      } catch (err: any) {
        setStatus("error");
        setStatusMsg(err?.message ?? "Failed to boot WebContainer");
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Create a real DOM node for a tab and mount xterm into it ──────────────
  const spawnTab = async (tabId: number, wc: any) => {
    if (termDomRefs.current.has(tabId)) return;
    if (!containerRef.current) return;

    // Create a persistent div for this tab — lives outside React's control
    const div = document.createElement("div");
    div.style.cssText = `
      position: absolute; inset: 0;
      padding: 4px 8px;
      background: #1e1e1e;
      width: 100%; height: 100%;
      overflow: hidden;
      display: none;
    `;
    containerRef.current.appendChild(div);
    termDomRefs.current.set(tabId, div);

    // Show this tab
    showTab(tabId);

    // Load xterm
    const { Terminal } = await import("xterm");
    const { FitAddon } = await import("xterm-addon-fit");

    const term = new Terminal({
      theme: {
        background: "#1e1e1e", foreground: "#cccccc", cursor: "#aeafad",
        black: "#1e1e1e", red: "#f44747", green: "#6a9955", yellow: "#dcdcaa",
        blue: "#569cd6", magenta: "#c586c0", cyan: "#4ec9b0", white: "#d4d4d4",
        brightBlack: "#808080", brightRed: "#f44747", brightGreen: "#b5cea8",
        brightYellow: "#d7ba7d", brightBlue: "#9cdcfe", brightMagenta: "#c586c0",
        brightCyan: "#4fc1ff", brightWhite: "#ffffff",
      },
      fontFamily: "'JetBrains Mono','Cascadia Code','Fira Code',monospace",
      fontSize: 13,
      lineHeight: 1.5,
      cursorBlink: true,
      cursorStyle: "block",
      scrollback: 5000,
      allowProposedApi: true,
    });

    const fit = new FitAddon();
    term.loadAddon(fit);
    term.open(div);

    setTimeout(() => {
      try { fit.fit(); } catch {}
      term.writeln("\x1b[1;34m⚡ Collabo Terminal\x1b[0m — WebContainer ready");
      term.writeln("Try: \x1b[1;32mnode --version\x1b[0m or \x1b[1;32mnpm create vite@latest\x1b[0m");
      term.writeln("");
    }, 100);

    const ro = new ResizeObserver(() => {
      try { fit.fit(); } catch {}
    });
    ro.observe(div);

    // Spawn real bash shell
    const shell = await wc.spawn("bash", [], {
      terminal: { cols: term.cols, rows: term.rows },
    });

    shell.output.pipeTo(
      new WritableStream({ write: (data: string) => term.write(data) })
    );

    const writer = shell.input.getWriter();
    const inputDispose = term.onData((data: string) => writer.write(data));
    const resizeDispose = term.onResize(({ cols, rows }: { cols: number; rows: number }) => {
      shell.resize({ cols, rows });
    });

    termRefs.current.set(tabId, {
      term, fit,
      dispose: () => {
        inputDispose.dispose();
        resizeDispose.dispose();
        ro.disconnect();
        try { shell.kill(); } catch {}
        try { term.dispose(); } catch {}
        // Remove DOM node
        const d = termDomRefs.current.get(tabId);
        if (d) { d.remove(); termDomRefs.current.delete(tabId); }
      },
    });
  };

  // ── Show a tab by manipulating DOM directly — no React re-render ──────────
  const showTab = (tabId: number) => {
    termDomRefs.current.forEach((div, id) => {
      div.style.display = id === tabId ? "block" : "none";
    });
    // Refit after showing
    setTimeout(() => {
      const t = termRefs.current.get(tabId);
      if (t) { try { t.fit.fit(); } catch {} }
    }, 50);
  };

  // ── Tab actions ───────────────────────────────────────────────────────────
  const handleTabClick = (tabId: number) => {
    setActiveTab(tabId);
    showTab(tabId);
  };

  const addTab = (): void => {
    if (!wcRef.current) return;
    const id = Date.now(); // unique id
    setTabs((prev) => [...prev, { id }]);
    setActiveTab(id);
    void spawnTab(id, wcRef.current);
  };

  const closeTab = (tabId: number): void => {
    termRefs.current.get(tabId)?.dispose();
    termRefs.current.delete(tabId);

    setTabs((prev) => {
      const next = prev.filter((t) => t.id !== tabId);
      if (next.length === 0) { onClose(); return prev; }
      if (activeTab === tabId) {
        const newActive = next[next.length - 1].id;
        setActiveTab(newActive);
        showTab(newActive);
      }
      return next;
    });
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      termRefs.current.forEach((t) => t.dispose());
    };
  }, []);

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] border-t border-[#3c3c3c] overflow-hidden">

      {/* Tab bar — React controls only this */}
      <div className="h-[35px] bg-[#252526] flex items-center border-b border-[#3c3c3c] shrink-0 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-1.5 px-3 text-[#ccc] text-[11px] shrink-0 border-r border-[#3c3c3c] h-full">
          <TerminalIcon size={12} className="text-[#007acc]" />
          <span className="uppercase tracking-widest font-semibold">Terminal</span>
        </div>

        {tabs.map((tab) => (
          <div
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            className={`group flex items-center gap-1.5 h-full px-3 text-[12px] cursor-pointer shrink-0 border-r border-[#1e1e1e] select-none ${
              activeTab === tab.id
                ? "bg-[#1e1e1e] text-white"
                : "bg-[#2d2d2d] text-[#969696] hover:text-[#ccc]"
            }`}
          >
            <span>bash</span>
            <button
              onClick={(e) => { e.stopPropagation(); closeTab(tab.id); }}
              className="opacity-0 group-hover:opacity-100 hover:bg-[#3c3c3c] rounded p-0.5"
            >
              <X size={10} />
            </button>
          </div>
        ))}

        <button
          onClick={addTab}
          title="New Terminal"
          className="px-2 h-full text-[#858585] hover:text-white hover:bg-[#3c3c3c] shrink-0"
        >
          <Plus size={14} />
        </button>
        <div className="flex-1" />
        <button
          onClick={onClose}
          title="Close Panel"
          className="px-2 h-full text-[#858585] hover:text-white hover:bg-[#3c3c3c] shrink-0"
        >
          <X size={14} />
        </button>
      </div>

      {/* Terminal content area — React never touches inside this div */}
      <div className="flex-1 relative overflow-hidden">
        {status === "booting" && (
          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-[#1e1e1e] z-10">
            <Loader2 size={16} className="animate-spin text-[#007acc]" />
            <span className="text-[#858585] text-xs">{statusMsg}</span>
          </div>
        )}
        {status === "error" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#1e1e1e] z-10 px-6">
            <span className="text-red-400 text-xs font-mono">{statusMsg}</span>
            <p className="text-[#6b6b6b] text-[11px] text-center leading-relaxed">
              WebContainers require Chrome or Edge with these response headers:<br />
              <code className="text-yellow-300">Cross-Origin-Opener-Policy: same-origin</code><br />
              <code className="text-yellow-300">Cross-Origin-Embedder-Policy: require-corp</code>
            </p>
          </div>
        )}

        {/*
          This is the KEY — one stable div that React never re-renders.
          All xterm instances are manually appended as real DOM children.
          React cannot touch or wipe them.
        */}
        <div
          ref={containerRef}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
          }}
        />
      </div>
    </div>
  );
}