// lib/webcontainer.ts
// WebContainer singleton + filesystem sync to Convex

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

// ─── Filesystem helpers ───────────────────────────────────────────────────────

export interface FSFile {
  path: string; // full path e.g. "my-app/src/main.tsx"
  content: string;
  isFolder: boolean;
}

/**
 * Recursively read all files from a WebContainer directory.
 * Returns a flat list of { path, content, isFolder } entries.
 */
export async function readWCDirectory(
  wc: any,
  dirPath: string = "/",
  base: string = "",
): Promise<FSFile[]> {
  const results: FSFile[] = [];

  try {
    const entries = await wc.fs.readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      // Skip node_modules, .git, hidden dirs
      if (
        entry.name === "node_modules" ||
        entry.name === ".git" ||
        entry.name.startsWith(".")
      )
        continue;

      const fullPath =
        dirPath === "/" ? `/${entry.name}` : `${dirPath}/${entry.name}`;
      const relativePath = base ? `${base}/${entry.name}` : entry.name;

      if (entry.isDirectory()) {
        results.push({ path: relativePath, content: "", isFolder: true });
        const children = await readWCDirectory(wc, fullPath, relativePath);
        results.push(...children);
      } else {
        try {
          const raw = await wc.fs.readFile(fullPath, "utf-8");
          results.push({
            path: relativePath,
            content: raw ?? "",
            isFolder: false,
          });
        } catch {
          // Binary file or unreadable — skip
        }
      }
    }
  } catch {
    // Directory doesn't exist or unreadable
  }

  return results;
}

/**
 * Detect language from filename for Monaco
 */
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
