"use client";

import { useEffect, useState } from "react";
import Editor, { useMonaco } from "@monaco-editor/react";

// A list of many languages Monaco supports out of the box
const AVAILABLE_LANGUAGES = [
  "javascript",
  "typescript",
  "python",
  "java",
  "c",
  "cpp",
  "csharp",
  "go",
  "rust",
  "php",
  "ruby",
  "swift",
  "kotlin",
  "r",
  "sql",
  "json",
  "html",
  "css",
  "xml",
  "markdown",
  "shell",
  "powershell",
  "yaml",
];

export function CodeEditor() {
  const monaco = useMonaco();
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState("// Write your code here...\n");

  // Optional: dynamically load extra languages if needed
  useEffect(() => {
    if (!monaco) return;

    // Example: register plain-text fallback if language not found
    if (!AVAILABLE_LANGUAGES.includes(language)) {
      monaco.languages.register({ id: language });
    }
  }, [language, monaco]);

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] rounded-lg overflow-hidden border border-[#3e3e42]">
      {/* Top toolbar */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#252526] border-b border-[#3e3e42]">
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="bg-transparent text-sm text-white border-none focus:outline-none"
        >
          {AVAILABLE_LANGUAGES.map((lang) => (
            <option key={lang} value={lang}>
              {lang.toUpperCase()}
            </option>
          ))}
        </select>

        <button
          onClick={() => navigator.clipboard.writeText(code)}
          className="text-xs px-2 py-1 bg-[#3e3e42] hover:bg-[#4a4a4f] rounded text-gray-300"
        >
          Copy
        </button>
      </div>

      {/* Monaco Editor */}
      <Editor
        height="100%"
        language={language}
        value={code}
        theme="vs-dark"
        onChange={(value) => setCode(value || "")}
        options={{
          fontSize: 14,
          minimap: { enabled: true },
          automaticLayout: true,
          scrollBeyondLastLine: false,
          wordWrap: "on",
          contextmenu: true,
          fontFamily: "JetBrains Mono, monospace",
          smoothScrolling: true,
        }}
      />
    </div>
  );
}
