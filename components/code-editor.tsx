"use client";

import { useState, useEffect, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import dynamic from "next/dynamic";
import {
  Play,
  Terminal,
  Trash2,
  Loader2,
  Copy,
  Check,
  Code2,
} from "lucide-react";

// Dynamically import Monaco Editor to prevent HMR/runtime issues
const Editor = dynamic(
  () => import("@monaco-editor/react").then((mod) => mod.Editor),
  {
    ssr: false,
  }
);

export default function EditorContainer({ room }: { room: any }) {
  const updateContent = useMutation(api.room.updateContent);
  const updateLanguage = useMutation(api.room.updateLanguage);

  // --- STATE ---
  const [localCode, setLocalCode] = useState(room.content || "");
  const [output, setOutput] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const languages = [
    { id: "javascript", name: "JavaScript", piston: "javascript" },
    { id: "python", name: "Python", piston: "python" },
    { id: "typescript", name: "TypeScript", piston: "typescript" },
    { id: "dart", name: "Dart", piston: "dart" },
    { id: "java", name: "Java", piston: "java" },
  ];

  // --- SYNC LOGIC ---
  useEffect(() => {
    if (room.content !== undefined && room.content !== localCode) {
      setLocalCode(room.content);
    }
  }, [room.content]);

  const handleCodeChange = (newVal: string) => {
    setLocalCode(newVal);

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      updateContent({ id: room._id, content: newVal });
    }, 500);
  };

  const handleLanguageChange = (newLang: string) => {
    updateLanguage({ id: room._id, language: newLang });
  };

  // --- EXECUTION LOGIC ---
  const handleRunCode = async () => {
    setIsRunning(true);
    const pistonLang =
      languages.find((l) => l.id === room.language)?.piston || "javascript";

    try {
      const response = await fetch("https://emkc.org/api/v2/piston/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language: pistonLang,
          version: "*",
          files: [{ content: localCode }],
        }),
      });

      const data = await response.json();
      if (data.message) throw new Error(data.message);

      const rawOutput = data.run.output || data.compile?.output || "";
      const outputLines = rawOutput.trim()
        ? rawOutput.split("\n")
        : ["(No output)"];

      setOutput([
        `> Executing ${pistonLang}...`,
        ...outputLines,
        `\n> Process finished with exit code ${data.run.code}`,
      ]);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      setOutput([`> Execution Error:`, message]);
    } finally {
      setIsRunning(false);
    }
  };

  // --- HELPERS ---
  const clearConsole = () => setOutput([]);
  const copyCode = () => {
    navigator.clipboard.writeText(localCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="flex-1 flex overflow-hidden bg-slate-950">
      {/* LEFT: EDITOR */}
      <div className="flex-1 flex flex-col relative">
        <div className="h-12 px-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50 backdrop-blur-md rounded-t-xl shadow-md shadow-black/20">
          <div className="flex items-center gap-3">
            <select
              value={room.language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="bg-slate-800 text-emerald-400 text-xs font-bold px-3 py-1.5 rounded border border-slate-700 focus:outline-none"
            >
              {languages.map((lang) => (
                <option key={lang.id} value={lang.id}>
                  {lang.name}
                </option>
              ))}
            </select>
            <div className="text-[10px] text-slate-500 font-mono hidden md:block">
              {localCode.length} chars | {localCode.split("\n").length} lines
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={copyCode}
              className="p-2 text-slate-400 hover:text-emerald-400 transition-colors"
            >
              {copied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <div className="flex-1 bg-[#0f172a] relative rounded-b-xl shadow-inner shadow-black/20">
          <Editor
            height="100%"
            theme="vs-dark"
            language={room.language}
            value={localCode}
            onChange={(val) => handleCodeChange(val || "")}
            options={{
              minimap: { enabled: false },
              fontSize: 15,
              fontFamily: "'JetBrains Mono', monospace",
              lineHeight: 22,
              padding: { top: 20, bottom: 20 },
              automaticLayout: true,
              scrollBeyondLastLine: false,
              lineNumbers: "on",
              roundedSelection: true,
              cursorBlinking: "smooth",
              smoothScrolling: true,
              renderWhitespace: "boundary",
              renderLineHighlight: "line",
              scrollbar: {
                verticalScrollbarSize: 8,
                horizontalScrollbarSize: 8,
                handleMouseWheel: true,
                alwaysConsumeMouseWheel: false,
              },
              folding: true,
              wordWrap: "on",
            }}
            className="rounded-xl shadow-lg shadow-slate-800/40"
          />
        </div>
      </div>

      {/* RIGHT: CONSOLE */}
      <div className="w-[400px] border-l border-slate-800 flex flex-col bg-[#020617]/80 backdrop-blur-md rounded-r-xl shadow-inner shadow-black/30">
        <div className="h-12 px-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-400">
            <Terminal className="h-4 w-4 text-emerald-500" />
            <span className="text-xs font-bold uppercase tracking-tighter">
              Output
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={clearConsole}
              className="p-2 text-slate-500 hover:text-red-400"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            <button
              onClick={handleRunCode}
              disabled={isRunning}
              className="bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 text-slate-950 font-black text-[11px] uppercase h-8 px-4 rounded flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20"
            >
              {isRunning ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Play className="h-3 w-3 fill-current" />
              )}
              Run
            </button>
          </div>
        </div>

        <div className="flex-1 p-6 font-mono text-[13px] overflow-y-auto bg-slate-950/70 rounded-b-xl shadow-inner shadow-black/20">
          {output.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center opacity-20">
              <Code2 className="h-12 w-12 mb-2" />
              <p className="text-xs">Waiting for execution...</p>
            </div>
          ) : (
            output.map((line, i) => (
              <div
                key={i}
                className={
                  line.startsWith(">")
                    ? "text-slate-400 mb-2"
                    : "text-emerald-400 mb-1"
                }
              >
                {line}
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
