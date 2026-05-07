// Detects language and icon from filename extension

export interface FileInfo {
  language: string; // Monaco language id
  icon: string; // emoji / text icon (fallback until vscode-icons loads)
  color: string; // icon color (tailwind class)
}

const EXT_MAP: Record<string, FileInfo> = {
  // JavaScript / TypeScript
  js: { language: "javascript", icon: "js", color: "text-yellow-400" },
  jsx: { language: "javascript", icon: "jsx", color: "text-cyan-400" },
  ts: { language: "typescript", icon: "ts", color: "text-blue-400" },
  tsx: { language: "typescript", icon: "tsx", color: "text-blue-300" },
  mjs: { language: "javascript", icon: "js", color: "text-yellow-400" },
  cjs: { language: "javascript", icon: "js", color: "text-yellow-400" },

  // Web
  html: { language: "html", icon: "html", color: "text-orange-400" },
  css: { language: "css", icon: "css", color: "text-blue-500" },
  scss: { language: "scss", icon: "scss", color: "text-pink-400" },
  sass: { language: "scss", icon: "sass", color: "text-pink-400" },
  less: { language: "less", icon: "less", color: "text-indigo-400" },
  svg: { language: "xml", icon: "svg", color: "text-orange-300" },

  // Python
  py: { language: "python", icon: "py", color: "text-blue-400" },
  pyw: { language: "python", icon: "py", color: "text-blue-400" },

  // Java / Kotlin
  java: { language: "java", icon: "java", color: "text-red-400" },
  kt: { language: "kotlin", icon: "kt", color: "text-purple-400" },
  kts: { language: "kotlin", icon: "kt", color: "text-purple-400" },

  // C / C++ / C#
  c: { language: "c", icon: "c", color: "text-blue-300" },
  h: { language: "c", icon: "h", color: "text-blue-200" },
  cpp: { language: "cpp", icon: "c++", color: "text-blue-400" },
  cc: { language: "cpp", icon: "c++", color: "text-blue-400" },
  cxx: { language: "cpp", icon: "c++", color: "text-blue-400" },
  cs: { language: "csharp", icon: "c#", color: "text-green-400" },

  // Go / Rust / Swift / Dart
  go: { language: "go", icon: "go", color: "text-cyan-400" },
  rs: { language: "rust", icon: "rs", color: "text-orange-400" },
  swift: { language: "swift", icon: "sw", color: "text-orange-300" },
  dart: { language: "dart", icon: "dart", color: "text-cyan-300" },

  // PHP / Ruby
  php: { language: "php", icon: "php", color: "text-purple-300" },
  rb: { language: "ruby", icon: "rb", color: "text-red-300" },

  // Data / Config
  json: { language: "json", icon: "{}", color: "text-yellow-300" },
  yaml: { language: "yaml", icon: "yml", color: "text-red-300" },
  yml: { language: "yaml", icon: "yml", color: "text-red-300" },
  toml: { language: "ini", icon: "toml", color: "text-orange-300" },
  xml: { language: "xml", icon: "xml", color: "text-green-300" },
  env: { language: "plaintext", icon: ".env", color: "text-yellow-200" },

  // Shell
  sh: { language: "shell", icon: "sh", color: "text-green-400" },
  bash: { language: "shell", icon: "sh", color: "text-green-400" },
  zsh: { language: "shell", icon: "sh", color: "text-green-400" },

  // Markdown / Docs
  md: { language: "markdown", icon: "md", color: "text-slate-300" },
  mdx: { language: "markdown", icon: "mdx", color: "text-slate-300" },
  txt: { language: "plaintext", icon: "txt", color: "text-slate-400" },

  // SQL
  sql: { language: "sql", icon: "sql", color: "text-blue-300" },

  // Dockerfile
  dockerfile: { language: "dockerfile", icon: "🐳", color: "text-blue-400" },
};

const FILENAME_MAP: Record<string, FileInfo> = {
  dockerfile: { language: "dockerfile", icon: "🐳", color: "text-blue-400" },
  ".gitignore": {
    language: "plaintext",
    icon: "git",
    color: "text-orange-400",
  },
  ".env": { language: "plaintext", icon: ".env", color: "text-yellow-200" },
  ".env.local": {
    language: "plaintext",
    icon: ".env",
    color: "text-yellow-200",
  },
  ".env.example": {
    language: "plaintext",
    icon: ".env",
    color: "text-yellow-200",
  },
  "package.json": { language: "json", icon: "npm", color: "text-red-400" },
  "tsconfig.json": { language: "json", icon: "ts", color: "text-blue-400" },
  "next.config.ts": {
    language: "typescript",
    icon: "next",
    color: "text-slate-200",
  },
  "next.config.js": {
    language: "javascript",
    icon: "next",
    color: "text-slate-200",
  },
  "tailwind.config.js": {
    language: "javascript",
    icon: "tw",
    color: "text-cyan-400",
  },
  "vite.config.ts": {
    language: "typescript",
    icon: "vite",
    color: "text-purple-400",
  },
  "vite.config.js": {
    language: "javascript",
    icon: "vite",
    color: "text-purple-400",
  },
};

export function getFileInfo(filename: string): FileInfo {
  const lower = filename.toLowerCase();

  // Check exact filename matches first
  if (FILENAME_MAP[lower]) return FILENAME_MAP[lower];

  // Then check extension
  const ext = lower.split(".").pop() ?? "";
  if (EXT_MAP[ext]) return EXT_MAP[ext];

  // Default
  return { language: "plaintext", icon: "file", color: "text-slate-400" };
}

export function getFolderIcon(isOpen: boolean): string {
  return isOpen ? "📂" : "📁";
}

// Returns the Monaco language id for a given filename
export function getLanguageFromFilename(filename: string): string {
  return getFileInfo(filename).language;
}
