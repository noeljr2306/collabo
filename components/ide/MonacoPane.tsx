"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

const MonacoEditor = dynamic(
  () => import("@monaco-editor/react").then((m) => m.Editor),
  { ssr: false }
);

interface MonacoPaneProps {
  fileId: string;
  roomId: string;
  onDirtyChange: (dirty: boolean) => void;
}

export default function MonacoPane({ fileId, roomId, onDirtyChange }: MonacoPaneProps) {
  const file = useQuery(api.room.getFileContent, { fileId: fileId as any });
  const updateContent = useMutation(api.room.updateFileContent);

  const [localContent, setLocalContent] = useState<string | undefined>(undefined);
  const remoteContent = file?.content;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isSyncingRef = useRef(false); // prevent echo loop

  // Hydrate from Convex on first load or file switch
  useEffect(() => {
    if (remoteContent !== undefined && localContent === undefined) {
      setLocalContent(remoteContent);
    }
  }, [remoteContent, localContent]);

  // When remote changes (another user typed), sync in — but only if we're not the ones who sent it
  useEffect(() => {
    if (remoteContent !== undefined && !isSyncingRef.current) {
      setLocalContent(remoteContent);
    }
  }, [remoteContent]);

  // Reset local content when file switches
  useEffect(() => {
    setLocalContent(undefined);
    onDirtyChange(false);
  }, [fileId]);

  const handleChange = (value: string | undefined) => {
    const val = value ?? "";
    setLocalContent(val);
    onDirtyChange(val !== remoteContent);

    // Debounced sync to Convex (broadcasts to all collaborators)
    if (timerRef.current) clearTimeout(timerRef.current);
    isSyncingRef.current = true;
    timerRef.current = setTimeout(async () => {
      await updateContent({ fileId: fileId as any, content: val });
      // Allow a brief window before re-accepting remote changes
      setTimeout(() => { isSyncingRef.current = false; }, 200);
    }, 400);
  };

  if (!file || localContent === undefined) {
    return (
      <div className="h-full flex items-center justify-center bg-[#1e1e1e]">
        <Loader2 className="animate-spin text-[#007acc]" size={20} />
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-[#1e1e1e]">
      <MonacoEditor
        height="100%"
        theme="vs-dark"
        language={file.language}
        value={localContent}
        onChange={handleChange}
        options={{
          fontSize: 14,
          fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
          fontLigatures: true,
          lineHeight: 22,
          minimap: { enabled: true, scale: 1 },
          scrollBeyondLastLine: false,
          automaticLayout: true,
          padding: { top: 12, bottom: 12 },
          lineNumbers: "on",
          renderLineHighlight: "line",
          cursorBlinking: "smooth",
          cursorSmoothCaretAnimation: "on",
          smoothScrolling: true,
          folding: true,
          wordWrap: "off",
          tabSize: 2,
          insertSpaces: true,
          formatOnPaste: true,
          formatOnType: false,
          renderWhitespace: "selection",
          bracketPairColorization: { enabled: true },
          guides: {
            bracketPairs: true,
            indentation: true,
          },
          suggest: {
            showKeywords: true,
            showSnippets: true,
          },
          scrollbar: {
            verticalScrollbarSize: 8,
            horizontalScrollbarSize: 8,
          },
          overviewRulerLanes: 3,
          stickyScroll: { enabled: true },
        }}
      />
    </div>
  );
}
