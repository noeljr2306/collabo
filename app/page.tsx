"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Github, ArrowRight, Check, Users, Zap, Lock,
  FileCode, MessageSquare, Terminal, ChevronDown,
  Globe, Code2, Layers
} from "lucide-react";

const CODE_LINES = [
  { text: 'import { useCollabo } from "collabo/react"', color: "#a1a1aa" },
  { text: "", color: "" },
  { text: 'function App() {', color: "#e4e4e7" },
  { text: '  const { users, room } = useCollabo()', color: "#a1a1aa" },
  { text: "", color: "" },
  { text: '  return (', color: "#e4e4e7" },
  { text: '    <Editor', color: "#6b6b72" },
  { text: '      room={room}', color: "#6b6b72" },
  { text: '      cursors={users}', color: "#22c55e" },
  { text: '      onEdit={sync}', color: "#22c55e" },
  { text: '    />', color: "#6b6b72" },
  { text: '  )', color: "#e4e4e7" },
  { text: '}', color: "#e4e4e7" },
];

const CURSORS = [
  { name: "Kizito", color: "#818cf8", line: 3, offset: 24 },
  { name: "Joshua", color: "#fb923c", line: 8, offset: 18 },
  { name: "Marho",  color: "#34d399", line: 11, offset: 4  },
];

function CodeDemo() {
  const [visibleChars, setVisibleChars] = useState(0);
  const fullText = CODE_LINES.map(l => l.text).join("\n");
  const totalChars = fullText.length;
  const frameRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let char = 0;
    const type = () => {
      char++;
      setVisibleChars(char);
      if (char < totalChars) {
        frameRef.current = setTimeout(type, char < 40 ? 28 : 18);
      }
    };
    const delay = setTimeout(type, 600);
    return () => { clearTimeout(delay); if (frameRef.current) clearTimeout(frameRef.current); };
  }, [totalChars]);

  // Split full text back into lines based on visibleChars
  let charsLeft = visibleChars;
  const renderedLines = CODE_LINES.map((line) => {
    if (charsLeft <= 0) return { text: "", full: line.text, color: line.color };
    const visible = line.text.slice(0, charsLeft);
    charsLeft -= line.text.length + 1; // +1 for newline
    return { text: visible, full: line.text, color: line.color };
  });

  return (
    <div
      className="relative rounded-xl overflow-hidden"
      style={{
        background: "#111113",
        border: "1px solid #2a2a2e",
        boxShadow: "0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)",
      }}
    >
      {/* Window chrome */}
      <div
        style={{ background: "#1c1c1f", borderBottom: "1px solid #2a2a2e" }}
        className="flex items-center gap-2 px-4 py-3"
      >
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
          <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
          <div className="w-3 h-3 rounded-full bg-[#28c840]" />
        </div>
        <span
          style={{ color: "#6b6b72", fontSize: 12, fontFamily: "monospace" }}
          className="ml-3"
        >
          App.tsx — Collabo
        </span>
        <div className="flex-1" />
        {/* Live collaborator chips */}
        <div className="flex items-center gap-1.5">
          {CURSORS.map((c) => (
            <div
              key={c.name}
              style={{
                background: c.color + "18",
                border: `1px solid ${c.color}44`,
                color: c.color,
                fontSize: 10,
                fontFamily: "monospace",
                borderRadius: 20,
                padding: "2px 8px",
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: c.color, display: "inline-block" }} />
              {c.name}
            </div>
          ))}
        </div>
      </div>

      {/* Editor body */}
      <div className="flex" style={{ fontFamily: "'JetBrains Mono', 'Fira Code', monospace", fontSize: 13, lineHeight: "22px" }}>
        {/* Line numbers */}
        <div style={{ color: "#3a3a3f", padding: "16px 0", minWidth: 44, textAlign: "right", paddingRight: 16, userSelect: "none" }}>
          {CODE_LINES.map((_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>

        {/* Code */}
        <div style={{ padding: "16px 20px 20px", flex: 1, position: "relative", overflowX: "auto" }}>
          {renderedLines.map((line, i) => {
            // Find cursor on this line
            const cursor = CURSORS.find((c) => c.line === i);
            return (
              <div key={i} style={{ position: "relative", whiteSpace: "pre" }}>
                <span style={{ color: line.color || "transparent" }}>{line.text || " "}</span>
                {/* Cursor blade */}
                {cursor && line.text.length >= cursor.offset && (
                  <span
                    style={{
                      position: "absolute",
                      left: cursor.offset * 7.8,
                      top: 0,
                      width: 2,
                      height: 22,
                      background: cursor.color,
                      borderRadius: 1,
                      animation: "blink 1.2s step-end infinite",
                    }}
                  />
                )}
                {/* Name label */}
                {cursor && line.text.length >= cursor.offset && (
                  <span
                    style={{
                      position: "absolute",
                      left: cursor.offset * 7.8,
                      top: -16,
                      background: cursor.color,
                      color: "#fff",
                      fontSize: 9,
                      fontFamily: "sans-serif",
                      fontWeight: 600,
                      borderRadius: "3px 3px 3px 0",
                      padding: "1px 5px",
                      whiteSpace: "nowrap",
                      lineHeight: "14px",
                    }}
                  >
                    {cursor.name}
                  </span>
                )}
              </div>
            );
          })}
          {/* Blinking cursor at end of typed text */}
          {visibleChars < totalChars && (
            <span style={{ display: "inline-block", width: 2, height: 14, background: "#22c55e", animation: "blink 0.8s step-end infinite", verticalAlign: "middle", borderRadius: 1 }} />
          )}
        </div>
      </div>

      {/* Bottom status bar */}
      <div
        style={{ background: "#22c55e", color: "#000", fontSize: 11, fontFamily: "monospace", padding: "3px 16px" }}
        className="flex items-center gap-4"
      >
        <span className="font-semibold">● LIVE</span>
        <span className="opacity-70">3 collaborators · TypeScript · UTF-8</span>
      </div>
    </div>
  );
}

// ─── Nav ─────────────────────────────────────────────────────────────────────

function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <nav
      style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        borderBottom: scrolled ? "1px solid #2a2a2e" : "1px solid transparent",
        background: scrolled ? "rgba(10,10,11,0.92)" : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        transition: "all 0.2s ease",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
        <div style={{ display: "flex", alignItems: "center", height: 60, gap: 40 }}>

          {/* Logo */}
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
            <div style={{ width: 28, height: 28, borderRadius: 7, background: "#22c55e", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Code2 size={15} color="#000" strokeWidth={2.5} />
            </div>
            <span style={{ color: "#e4e4e7", fontWeight: 700, fontSize: 16, letterSpacing: "-0.3px" }}>Collabo</span>
          </Link>

          {/* Links */}
          <div style={{ display: "flex", gap: 28, flex: 1 }}>
            {[
              { label: "Features", href: "#features" },
              { label: "Pricing", href: "#pricing" },
              { label: "Docs", href: "#" },
            ].map(({ label, href }) => (
              <a
                key={label}
                href={href}
                style={{ color: "#6b6b72", fontSize: 14, textDecoration: "none", transition: "color 0.15s" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#e4e4e7")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#6b6b72")}
              >
                {label}
              </a>
            ))}
          </div>

          {/* Right */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#6b6b72", transition: "color 0.15s", display: "flex" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#e4e4e7")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#6b6b72")}
            >
              <Github size={18} />
            </a>
            <Link
              href="/auth/login"
              style={{ color: "#a1a1aa", fontSize: 14, textDecoration: "none", padding: "6px 14px", transition: "color 0.15s" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#e4e4e7")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#a1a1aa")}
            >
              Sign in
            </Link>
            <Link
              href="/auth/signup"
              style={{
                background: "#22c55e", color: "#000", fontSize: 14, fontWeight: 600,
                textDecoration: "none", padding: "7px 18px", borderRadius: 8,
                transition: "background 0.15s, transform 0.1s",
                display: "inline-block",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#16a34a"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "#22c55e"; }}
            >
              Get started
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

// ─── Features data ────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: <Users size={20} />,
    title: "Live presence",
    description: "See every collaborator's cursor, selection, and name in real time. Know exactly who's editing what, just like Google Docs for code.",
  },
  {
    icon: <Terminal size={20} />,
    title: "Shared terminal",
    description: "A real Node.js environment in the browser. Run npm commands, scaffold projects, and see output instantly — no server setup required.",
  },
  {
    icon: <FileCode size={20} />,
    title: "Full file system",
    description: "Create, rename, delete, and organize files and folders. Every change syncs to all collaborators in under a second.",
  },
  {
    icon: <MessageSquare size={20} />,
    title: "Integrated chat",
    description: "Room-scoped chat with code block support, message history, and live typing indicators — always one panel away.",
  },
  {
    icon: <Zap size={20} />,
    title: "Zero latency sync",
    description: "Powered by Convex's real-time subscriptions. Changes propagate to every connected user without polling or manual refresh.",
  },
  {
    icon: <Lock size={20} />,
    title: "Access control",
    description: "Room codes gate every session. Host controls who joins. Guest permissions coming soon.",
  },
];

const WHY = [
  {
    label: "No extensions to install",
    sub: "Works in any modern browser. Share a link, join instantly.",
  },
  {
    label: "Monaco editor engine",
    sub: "The same editor that powers VS Code — IntelliSense, folding, multi-cursor all included.",
  },
  {
    label: "Persistent rooms",
    sub: "Files and chat history persist across sessions. Resume exactly where you left off.",
  },
  {
    label: "Built for developers",
    sub: "Keyboard-first, dark-by-default, and designed around real coding workflows — not demos.",
  },
];

// ─── Main page ────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div style={{ background: "#0a0a0b", color: "#e4e4e7", minHeight: "100vh", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <style>{`
        @keyframes blink { 0%, 100% { opacity: 1 } 50% { opacity: 0 } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px) } to { opacity: 1; transform: translateY(0) } }
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        .fade-up { animation: fadeUp 0.6s ease forwards; }
        .fade-up-delay-1 { animation: fadeUp 0.6s 0.1s ease forwards; opacity: 0; }
        .fade-up-delay-2 { animation: fadeUp 0.6s 0.2s ease forwards; opacity: 0; }
        .fade-up-delay-3 { animation: fadeUp 0.6s 0.3s ease forwards; opacity: 0; }
        .feature-card:hover { background: #161618 !important; border-color: #3a3a3f !important; }
        .nav-cta:hover { background: #16a34a !important; }
        .cta-primary:hover { background: #16a34a !important; transform: translateY(-1px); }
        .cta-secondary:hover { border-color: #3a3a3f !important; color: #e4e4e7 !important; }
        @media (prefers-reduced-motion: reduce) {
          .fade-up, .fade-up-delay-1, .fade-up-delay-2, .fade-up-delay-3 { animation: none; opacity: 1; }
        }
      `}</style>

      <Nav />

      {/* ── Hero ── */}
      <section style={{ paddingTop: 140, paddingBottom: 100, paddingLeft: 24, paddingRight: 24 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }}>

            {/* Left copy */}
            <div>
              {/* Eyebrow */}
              <div
                className="fade-up"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  background: "#22c55e14", border: "1px solid #22c55e30",
                  borderRadius: 20, padding: "4px 12px", marginBottom: 24,
                  color: "#22c55e", fontSize: 12, fontWeight: 600, letterSpacing: "0.04em",
                }}
              >
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />
                NOW IN PUBLIC BETA
              </div>

              <h1
                className="fade-up-delay-1"
                style={{
                  fontSize: "clamp(36px, 5vw, 58px)",
                  fontWeight: 800,
                  color: "#ffffff",
                  lineHeight: 1.1,
                  letterSpacing: "-1.5px",
                  marginBottom: 20,
                }}
              >
                Code together,<br />
                <span style={{ color: "#22c55e" }}>ship faster.</span>
              </h1>

              <p
                className="fade-up-delay-2"
                style={{ fontSize: 17, color: "#6b6b72", lineHeight: 1.7, marginBottom: 36, maxWidth: 420 }}
              >
                Collabo is a real-time collaborative IDE that runs entirely in your browser.
                Open a room, share a code, and code with your team — no install required.
              </p>

              <div className="fade-up-delay-3" style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <Link
                  href="/auth/signup"
                  className="cta-primary"
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 8,
                    background: "#22c55e", color: "#000", fontWeight: 700,
                    fontSize: 15, padding: "12px 24px", borderRadius: 10,
                    textDecoration: "none", transition: "all 0.15s ease",
                  }}
                >
                  Start for free
                  <ArrowRight size={16} />
                </Link>
                <Link
                  href="/auth/login"
                  className="cta-secondary"
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 8,
                    background: "transparent", color: "#a1a1aa", fontWeight: 600,
                    fontSize: 15, padding: "12px 24px", borderRadius: 10,
                    textDecoration: "none", border: "1px solid #2a2a2e",
                    transition: "all 0.15s ease",
                  }}
                >
                  Sign in
                </Link>
              </div>

              {/* Social proof */}
              <div style={{ marginTop: 32, display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ display: "flex", marginRight: 4 }}>
                  {["#818cf8", "#fb923c", "#34d399", "#f472b6"].map((c, i) => (
                    <div
                      key={i}
                      style={{
                        width: 28, height: 28, borderRadius: "50%",
                        background: c, border: "2px solid #0a0a0b",
                        marginLeft: i > 0 ? -8 : 0,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 10, fontWeight: 700, color: "#000",
                      }}
                    >
                      {["A","T","Z","K"][i]}
                    </div>
                  ))}
                </div>
                <span style={{ fontSize: 13, color: "#6b6b72" }}>
                  Trusted by developers at hackathons, bootcamps & startups
                </span>
              </div>
            </div>

            {/* Right — code demo */}
            <div style={{ position: "relative" }}>
              {/* Glow */}
              <div style={{
                position: "absolute", inset: -40,
                background: "radial-gradient(ellipse at center, #22c55e10 0%, transparent 70%)",
                pointerEvents: "none",
              }} />
              <CodeDemo />
            </div>
          </div>
        </div>
      </section>

      {/* ── Divider ── */}
      <div style={{ borderTop: "1px solid #2a2a2e", maxWidth: 1200, margin: "0 auto" }} />

      {/* ── Features ── */}
      <section id="features" style={{ padding: "96px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>

          <div style={{ marginBottom: 64 }}>
            <p style={{ color: "#22c55e", fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", marginBottom: 12, textTransform: "uppercase" }}>
              Features
            </p>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 800, color: "#fff", letterSpacing: "-1px", lineHeight: 1.15, marginBottom: 14 }}>
              Everything your team needs<br />to code in sync
            </h2>
            <p style={{ fontSize: 16, color: "#6b6b72", maxWidth: 480 }}>
              Built around how developers actually work — not how demos are scripted.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1, background: "#2a2a2e", borderRadius: 16, overflow: "hidden" }}>
            {FEATURES.map((f, i) => (
              <div
                key={i}
                className="feature-card"
                style={{
                  background: "#111113", padding: "32px 28px",
                  borderRadius: 0, transition: "background 0.15s, border-color 0.15s",
                  cursor: "default",
                }}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: 9,
                  background: "#1c1c1f", border: "1px solid #2a2a2e",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#22c55e", marginBottom: 16,
                }}>
                  {f.icon}
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "#e4e4e7", marginBottom: 8, letterSpacing: "-0.2px" }}>
                  {f.title}
                </h3>
                <p style={{ fontSize: 14, color: "#6b6b72", lineHeight: 1.65 }}>
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why Collabo ── */}
      <section style={{ padding: "0 24px 96px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "start" }}>

            {/* Left */}
            <div>
              <p style={{ color: "#22c55e", fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", marginBottom: 12, textTransform: "uppercase" }}>
                Why Collabo
              </p>
              <h2 style={{ fontSize: "clamp(26px, 3.5vw, 38px)", fontWeight: 800, color: "#fff", letterSpacing: "-0.8px", lineHeight: 1.2, marginBottom: 16 }}>
                A real IDE.<br />Not a code widget.
              </h2>
              <p style={{ fontSize: 15, color: "#6b6b72", lineHeight: 1.7, maxWidth: 400 }}>
                Most "collaborative editors" are text areas with sockets bolted on.
                Collabo is built from the ground up with Monaco, WebContainers,
                and Convex — the same technologies that power VS Code and StackBlitz.
              </p>
            </div>

            {/* Right */}
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {WHY.map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex", alignItems: "flex-start", gap: 16,
                    padding: "22px 0",
                    borderBottom: i < WHY.length - 1 ? "1px solid #1c1c1f" : "none",
                  }}
                >
                  <div style={{
                    width: 22, height: 22, borderRadius: "50%",
                    background: "#22c55e18", border: "1px solid #22c55e44",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0, marginTop: 2,
                  }}>
                    <Check size={11} color="#22c55e" strokeWidth={3} />
                  </div>
                  <div>
                    <p style={{ fontSize: 15, fontWeight: 600, color: "#e4e4e7", marginBottom: 4 }}>{item.label}</p>
                    <p style={{ fontSize: 14, color: "#6b6b72", lineHeight: 1.6 }}>{item.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonial ── */}
      <section style={{ padding: "0 24px 96px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
          <div style={{
            background: "#111113", border: "1px solid #2a2a2e",
            borderRadius: 16, padding: "48px 48px",
          }}>
            <div style={{ fontSize: 48, color: "#22c55e", lineHeight: 1, marginBottom: 20, fontFamily: "Georgia, serif" }}>&ldquo;</div>
            <p style={{ fontSize: 20, color: "#e4e4e7", lineHeight: 1.6, fontWeight: 500, letterSpacing: "-0.3px", marginBottom: 28 }}>
              Collabo saved our hackathon. We scaffolded a full app in one night,
              three of us in the same editor, seeing each other's cursors in real time.
              It just worked.
            </p>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
              <div style={{
                width: 38, height: 38, borderRadius: "50%",
                background: "#818cf8", display: "flex", alignItems: "center",
                justifyContent: "center", fontSize: 14, fontWeight: 700, color: "#fff",
              }}>J</div>
              <div style={{ textAlign: "left" }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: "#e4e4e7" }}>Joshua</p>
                <p style={{ fontSize: 12, color: "#6b6b72" }}>Full Stack Developer</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section style={{ padding: "0 24px 120px" }}>
        <div style={{
          maxWidth: 1200, margin: "0 auto",
          background: "#111113", border: "1px solid #2a2a2e",
          borderRadius: 20, padding: "72px 48px", textAlign: "center",
          position: "relative", overflow: "hidden",
        }}>
          {/* Subtle top glow */}
          <div style={{
            position: "absolute", top: -60, left: "50%", transform: "translateX(-50%)",
            width: 300, height: 120,
            background: "radial-gradient(ellipse, #22c55e18 0%, transparent 70%)",
            pointerEvents: "none",
          }} />

          <p style={{ color: "#22c55e", fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", marginBottom: 16, textTransform: "uppercase" }}>
            Get started today
          </p>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 800, color: "#fff", letterSpacing: "-1.2px", lineHeight: 1.1, marginBottom: 16 }}>
            Your next project deserves<br />a better workflow
          </h2>
          <p style={{ fontSize: 16, color: "#6b6b72", marginBottom: 36, maxWidth: 420, margin: "0 auto 36px" }}>
            Open a room, invite your team, and start coding — together.
            Free to use, no credit card required.
          </p>

          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link
              href="/auth/signup"
              className="cta-primary"
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: "#22c55e", color: "#000", fontWeight: 700,
                fontSize: 15, padding: "13px 28px", borderRadius: 10,
                textDecoration: "none", transition: "all 0.15s ease",
              }}
            >
              Create a room — it&apos;s free
              <ArrowRight size={16} />
            </Link>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="cta-secondary"
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: "transparent", color: "#a1a1aa", fontWeight: 600,
                fontSize: 15, padding: "13px 28px", borderRadius: 10,
                textDecoration: "none", border: "1px solid #2a2a2e",
                transition: "all 0.15s ease",
              }}
            >
              <Github size={16} />
              View on GitHub
            </a>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ borderTop: "1px solid #1c1c1f", padding: "32px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 22, height: 22, borderRadius: 6, background: "#22c55e", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Code2 size={12} color="#000" strokeWidth={2.5} />
            </div>
            <span style={{ color: "#3a3a3f", fontSize: 14, fontWeight: 600 }}>Collabo</span>
          </div>
          <p style={{ color: "#3a3a3f", fontSize: 13 }}>
            Built by Noel Jr. · © 2025
          </p>
          <div style={{ display: "flex", gap: 20 }}>
            {["Features", "Docs", "GitHub"].map((l) => (
              <a key={l} href="#" style={{ color: "#3a3a3f", fontSize: 13, textDecoration: "none", transition: "color 0.15s" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#6b6b72")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#3a3a3f")}
              >
                {l}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}