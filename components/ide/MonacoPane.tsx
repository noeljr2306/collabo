"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import { usePresence, userColor } from "@/hooks/usePresence";
import type * as Monaco from "monaco-editor";

const MonacoEditor = dynamic(
  () => import("@monaco-editor/react").then((m) => m.Editor),
  { ssr: false },
);

interface MonacoPaneProps {
  fileId: string;
  roomId: string;
  onDirtyChange: (dirty: boolean) => void;
}

// Per-user decoration state
interface UserDecoration {
  cursorDecoration: string[];
  selectionDecoration: string[];
}

export default function MonacoPane({
  fileId,
  roomId,
  onDirtyChange,
}: MonacoPaneProps) {
  const { user } = useUser();
  const file = useQuery(api.room.getFileContent, { fileId: fileId as any });
  const updateContent = useMutation(api.room.updateFileContent);
  const activeUsers = useQuery(api.presence.list, { roomId }) ?? [];

  const [localContent, setLocalContent] = useState<string | undefined>(
    undefined,
  );
  const remoteContent = file?.content;

  const editorRef = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<typeof Monaco | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isSyncingRef = useRef(false);
  const decorationsRef = useRef<Map<string, UserDecoration>>(new Map());

  const { updateCursor, updateSelection, setTyping } = usePresence({ roomId });

  // ── Content sync ──────────────────────────────────────────────────────────

  useEffect(() => {
    if (remoteContent !== undefined && localContent === undefined) {
      setLocalContent(remoteContent);
    }
  }, [remoteContent, localContent]);

  useEffect(() => {
    if (remoteContent !== undefined && !isSyncingRef.current) {
      setLocalContent(remoteContent);
    }
  }, [remoteContent]);

  useEffect(() => {
    setLocalContent(undefined);
    onDirtyChange(false);
    // Clear all decorations when file changes
    decorationsRef.current.clear();
  }, [fileId]);

  const handleChange = useCallback(
    (value: string | undefined) => {
      const val = value ?? "";
      setLocalContent(val);
      onDirtyChange(val !== remoteContent);
      setTyping(true);

      if (timerRef.current) clearTimeout(timerRef.current);
      isSyncingRef.current = true;
      timerRef.current = setTimeout(async () => {
        await updateContent({ fileId: fileId as any, content: val });
        setTimeout(() => {
          isSyncingRef.current = false;
        }, 300);
        setTyping(false);
      }, 400);
    },
    [fileId, remoteContent, updateContent, setTyping],
  );

  // ── Editor mount ──────────────────────────────────────────────────────────

  const handleEditorMount = useCallback(
    (editor: Monaco.editor.IStandaloneCodeEditor, monaco: typeof Monaco) => {
      editorRef.current = editor;
      monacoRef.current = monaco;

      // Track cursor position
      editor.onDidChangeCursorPosition((e) => {
        updateCursor({
          fileId,
          line: e.position.lineNumber,
          column: e.position.column,
        });
      });

      // Track selection
      editor.onDidChangeCursorSelection((e) => {
        const sel = e.selection;
        const isEmpty =
          sel.startLineNumber === sel.endLineNumber &&
          sel.startColumn === sel.endColumn;

        updateSelection(
          isEmpty
            ? undefined
            : {
                fileId,
                startLine: sel.startLineNumber,
                startColumn: sel.startColumn,
                endLine: sel.endLineNumber,
                endColumn: sel.endColumn,
              },
        );
      });

      // VS Code keyboard shortcuts
      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
        // Save = clear dirty
        onDirtyChange(false);
      });
    },
    [fileId, updateCursor, updateSelection, onDirtyChange],
  );

  // ── Collaborative cursors & selections ───────────────────────────────────

  useEffect(() => {
    const editor = editorRef.current;
    const monaco = monacoRef.current;
    if (!editor || !monaco || !user) return;

    // Remove decorations for users no longer present
    const activeUserIds = new Set(activeUsers.map((u) => u.userId));
    decorationsRef.current.forEach((_, uid) => {
      if (!activeUserIds.has(uid)) {
        const decs = decorationsRef.current.get(uid);
        if (decs) {
          editor.deltaDecorations(decs.cursorDecoration, []);
          editor.deltaDecorations(decs.selectionDecoration, []);
          decorationsRef.current.delete(uid);
        }
      }
    });

    // Add/update decorations for each remote user
    activeUsers.forEach((presence) => {
      if (presence.userId === user.id) return; // skip self
      if (!presence.cursor && !presence.selection) return;

      const color = presence.color ?? userColor(presence.userId);
      const name = presence.userName;

      const existing = decorationsRef.current.get(presence.userId) ?? {
        cursorDecoration: [],
        selectionDecoration: [],
      };

      // ── Cursor decoration ──
      let newCursorDec: string[] = existing.cursorDecoration;
      if (presence.cursor && presence.cursor.fileId === fileId) {
        const { line, column } = presence.cursor;

        // Inject dynamic CSS for this user's cursor color
        const styleId = `cursor-style-${presence.userId.replace(/[^a-z0-9]/gi, "")}`;
        if (!document.getElementById(styleId)) {
          const style = document.createElement("style");
          style.id = styleId;
          style.textContent = `
            .cursor-${presence.userId.replace(/[^a-z0-9]/gi, "")} {
              border-left: 2px solid ${color} !important;
              position: relative;
            }
            .cursor-${presence.userId.replace(/[^a-z0-9]/gi, "")}::before {
              content: '${name}';
              position: absolute;
              top: -18px;
              left: -1px;
              background: ${color};
              color: #fff;
              font-size: 10px;
              font-family: monospace;
              padding: 1px 5px;
              border-radius: 3px 3px 3px 0;
              white-space: nowrap;
              z-index: 100;
              pointer-events: none;
              line-height: 16px;
            }
          `;
          document.head.appendChild(style);
        }

        newCursorDec = editor.deltaDecorations(existing.cursorDecoration, [
          {
            range: new monaco.Range(line, column, line, column),
            options: {
              className: `cursor-${presence.userId.replace(/[^a-z0-9]/gi, "")}`,
              stickiness:
                monaco.editor.TrackedRangeStickiness
                  .NeverGrowsWhenTypingAtEdges,
            },
          },
        ]);
      } else {
        newCursorDec = editor.deltaDecorations(existing.cursorDecoration, []);
      }

      // ── Selection decoration ──
      let newSelDec: string[] = existing.selectionDecoration;
      if (presence.selection && presence.selection.fileId === fileId) {
        const { startLine, startColumn, endLine, endColumn } =
          presence.selection;
        const hex = color.replace("#", "");
        const r = parseInt(hex.slice(0, 2), 16);
        const g = parseInt(hex.slice(2, 4), 16);
        const b = parseInt(hex.slice(4, 6), 16);

        const selStyleId = `sel-style-${presence.userId.replace(/[^a-z0-9]/gi, "")}`;
        if (!document.getElementById(selStyleId)) {
          const style = document.createElement("style");
          style.id = selStyleId;
          style.textContent = `
            .selection-${presence.userId.replace(/[^a-z0-9]/gi, "")} {
              background: rgba(${r}, ${g}, ${b}, 0.2) !important;
            }
          `;
          document.head.appendChild(style);
        }

        newSelDec = editor.deltaDecorations(existing.selectionDecoration, [
          {
            range: new monaco.Range(startLine, startColumn, endLine, endColumn),
            options: {
              className: `selection-${presence.userId.replace(/[^a-z0-9]/gi, "")}`,
              stickiness:
                monaco.editor.TrackedRangeStickiness
                  .NeverGrowsWhenTypingAtEdges,
            },
          },
        ]);
      } else {
        newSelDec = editor.deltaDecorations(existing.selectionDecoration, []);
      }

      decorationsRef.current.set(presence.userId, {
        cursorDecoration: newCursorDec,
        selectionDecoration: newSelDec,
      });
    });
  }, [activeUsers, fileId, user]);

  // ── Loading state ─────────────────────────────────────────────────────────

  if (!file || localContent === undefined) {
    return (
      <div className="h-full flex items-center justify-center bg-[#1e1e1e]">
        <Loader2 className="animate-spin text-[#007acc]" size={20} />
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-[#1e1e1e] relative">
      {/* Collaborator name chips above editor */}
      {activeUsers.filter(
        (u) => u.userId !== user?.id && u.cursor?.fileId === fileId,
      ).length > 0 && (
        <div className="absolute top-2 right-3 z-10 flex gap-1.5 flex-wrap justify-end">
          {activeUsers
            .filter((u) => u.userId !== user?.id && u.cursor?.fileId === fileId)
            .map((u) => (
              <div
                key={u.userId}
                className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium text-white"
                style={{ background: u.color ?? userColor(u.userId) }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full bg-white opacity-80"
                  style={{
                    animation: u.isTyping ? "pulse 1s infinite" : "none",
                  }}
                />
                {u.userName}
                {u.isTyping && " …"}
              </div>
            ))}
        </div>
      )}

      <MonacoEditor
        height="100%"
        theme="vs-dark"
        language={file.language}
        value={localContent}
        onChange={handleChange}
        onMount={handleEditorMount}
        options={{
          fontSize: 14,
          fontFamily:
            "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
          fontLigatures: true,
          lineHeight: 22,
          minimap: { enabled: true, scale: 1 },
          scrollBeyondLastLine: false,
          automaticLayout: true,
          padding: { top: 16, bottom: 12 },
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
          guides: { bracketPairs: true, indentation: true },
          suggest: { showKeywords: true, showSnippets: true },
          scrollbar: { verticalScrollbarSize: 8, horizontalScrollbarSize: 8 },
          overviewRulerLanes: 3,
          stickyScroll: { enabled: true },
          // Extra VS Code features
          linkedEditing: true,
          showUnused: true,
          inlayHints: { enabled: "on" },
          occurrencesHighlight: "singleFile",
          selectionHighlight: true,
          codeLens: true,
          quickSuggestions: { other: true, comments: false, strings: true },
          acceptSuggestionOnCommitCharacter: true,
          snippetSuggestions: "top",
          wordBasedSuggestions: "currentDocument",
          parameterHints: { enabled: true },
          hover: { enabled: true, delay: 300 },
          find: {
            addExtraSpaceOnTop: true,
            autoFindInSelection: "multiline",
          },
          multiCursorModifier: "alt",
          columnSelection: false,
          accessibilitySupport: "auto",
        }}
      />
    </div>
  );
}
