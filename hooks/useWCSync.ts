// hooks/useWCSync.ts
import { useCallback, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { readWCDirectory, langFromName } from "@/lib/webcontainer";

export function useWCSync(roomId: string) {
  const createFile = useMutation(api.room.createFile);
  const knownPaths = useRef<Set<string>>(new Set());
  const isSyncing = useRef(false);

  const syncAll = useCallback(
    async (wc: any) => {
      if (!wc || !roomId) return;
      if (isSyncing.current) return;
      isSyncing.current = true;

      try {
        const files = await readWCDirectory(wc, "/");

        // Only process files we haven't seen yet
        const newFiles = files.filter((f) => !knownPaths.current.has(f.path));
        if (newFiles.length === 0) return;

        // Create files sequentially to avoid rate-limit hammering
        for (const file of newFiles) {
          knownPaths.current.add(file.path);
          const name = file.path.split("/").pop() ?? file.path;
          try {
            await createFile({
              roomId,
              name: file.path,
              language: file.isFolder ? "folder" : langFromName(name),
              isFolder: file.isFolder,
              content: file.content,
              parentId: undefined,
            });
          } catch (e) {
            // If already exists, just skip it
            console.warn("[WCSync] skipped:", file.path, e);
          }
        }
      } catch (e) {
        console.error("[WCSync] error:", e);
      } finally {
        isSyncing.current = false;
      }
    },
    [roomId, createFile],
  );

  /**
   * Start watching the WC filesystem.
   * Returns a cleanup function to stop watching.
   */
  const startWatching = useCallback(
    (wc: any): (() => void) => {
      if (!wc) return () => {};

      let stopped = false;
      let debounceTimer: ReturnType<typeof setTimeout> | null = null;

      const triggerSync = () => {
        if (stopped) return;
        if (debounceTimer) clearTimeout(debounceTimer);
        // Debounce 2s — Vite scaffolding writes many files in rapid succession
        debounceTimer = setTimeout(() => {
          if (!stopped) void syncAll(wc);
        }, 2000);
      };

      // Try native wc.fs.watch first (supported in newer WC versions)
      let watcher: any = null;
      try {
        watcher = wc.fs.watch(
          "/",
          { recursive: true },
          (event: string, filename: string) => {
            if (!filename) return;
            // Ignore node_modules and hidden
            if (filename.includes("node_modules") || filename.includes("/."))
              return;
            console.log("[WCSync] fs event:", event, filename);
            triggerSync();
          },
        );
      } catch {
        // wc.fs.watch not available — fall back to polling
        console.log("[WCSync] fs.watch unavailable, using polling");
        const POLL_INTERVAL = 3000; // poll every 3s
        let lastCount = 0;

        const poll = async () => {
          if (stopped) return;
          try {
            const files = await readWCDirectory(wc, "/");
            const newCount = files.length;
            if (newCount !== lastCount) {
              lastCount = newCount;
              triggerSync();
            }
          } catch {}
          if (!stopped) setTimeout(poll, POLL_INTERVAL);
        };

        // Start polling after a short delay to let WC settle
        setTimeout(poll, 3000);
      }

      return () => {
        stopped = true;
        if (debounceTimer) clearTimeout(debounceTimer);
        try {
          watcher?.close();
        } catch {}
      };
    },
    [syncAll],
  );

  return { syncAll, startWatching };
}
