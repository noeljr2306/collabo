// lib/webcontainer.ts
// WebContainer singleton. Each room gets its own isolated directory: /rooms/<roomId>/
// This prevents cross-room contamination — commands in one room don't affect another.

let instance: any = null;
let bootPromise: Promise<any> | null = null;

export async function getWebContainer(): Promise<any> {
  if (instance) return instance;
  if (bootPromise) return bootPromise;
  bootPromise = (async () => {
    const { WebContainer } = await import("@webcontainer/api");
    instance = await WebContainer.boot();
    return instance;
  })();
  return bootPromise;
}

/** Get the isolated working directory path for a room */
export function roomWorkDir(roomId: string): string {
  return `/rooms/${roomId}`;
}

/** Ensure the room's working directory exists */
export async function ensureRoomDir(wc: any, roomId: string): Promise<void> {
  const path = roomWorkDir(roomId);
  try {
    await wc.fs.mkdir(path, { recursive: true });
  } catch {
    // Already exists — fine
  }
}

// ─── Filesystem helpers ───────────────────────────────────────────────────────

export interface FSFile {
  path: string;
  content: string;
  isFolder: boolean;
}

/**
 * Recursively read all files from a directory inside WebContainer.
 * Returns flat list of { path, content, isFolder }.
 * path is relative to the starting dirPath.
 */
export async function readWCDirectory(
  wc: any,
  dirPath: string,
  base: string = "",
): Promise<FSFile[]> {
  const results: FSFile[] = [];
  try {
    const entries = await wc.fs.readdir(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      if (
        entry.name === "node_modules" ||
        entry.name === ".git" ||
        entry.name.startsWith(".")
      )
        continue;

      const fullPath = `${dirPath}/${entry.name}`;
      const relativePath = base ? `${base}/${entry.name}` : entry.name;

      if (entry.isDirectory()) {
        results.push({ path: relativePath, content: "", isFolder: true });
        results.push(...(await readWCDirectory(wc, fullPath, relativePath)));
      } else {
        try {
          const raw = await wc.fs.readFile(fullPath, "utf-8");
          results.push({
            path: relativePath,
            content: raw ?? "",
            isFolder: false,
          });
        } catch {
          /* binary or unreadable */
        }
      }
    }
  } catch {
    /* dir doesn't exist */
  }
  return results;
}

export function langFromName(name: string): string {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  const map: Record<string, string> = {
    ts: "typescript",
    tsx: "typescript",
    js: "javascript",
    jsx: "javascript",
    mjs: "javascript",
    cjs: "javascript",
    py: "python",
    java: "java",
    html: "html",
    css: "css",
    scss: "scss",
    json: "json",
    md: "markdown",
    go: "go",
    rs: "rust",
    cpp: "cpp",
    c: "c",
    cs: "csharp",
    rb: "ruby",
    sh: "shell",
    yaml: "yaml",
    yml: "yaml",
    toml: "ini",
    xml: "xml",
    sql: "sql",
    dart: "dart",
    kt: "kotlin",
    swift: "swift",
    php: "php",
  };
  return map[ext] ?? "plaintext";
}
