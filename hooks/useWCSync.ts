// hooks/useWCSync.ts
import { useCallback, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { readWCDirectory, langFromName, roomWorkDir } from "@/lib/webcontainer";

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
        // Read from the room's isolated directory, not from root
        const workDir = roomWorkDir(roomId);
        const files = await readWCDirectory(wc, workDir);
        const newFiles = files.filter((f) => !knownPaths.current.has(f.path));
        if (newFiles.length === 0) return;

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
          } catch {
            /* already exists */
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

  const startWatching = useCallback(
    (wc: any): (() => void) => {
      if (!wc) return () => {};

      let stopped = false;
      let lastCount = 0;
      let debounceTimer: ReturnType<typeof setTimeout> | null = null;

      const triggerSync = () => {
        if (stopped) return;
        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          if (!stopped) void syncAll(wc);
        }, 2500);
      };

      const poll = async () => {
        if (stopped) return;
        try {
          const workDir = roomWorkDir(roomId);
          const files = await readWCDirectory(wc, workDir);
          if (files.length !== lastCount) {
            lastCount = files.length;
            triggerSync();
          }
        } catch {
          /* not ready yet */
        }
        if (!stopped) setTimeout(poll, 2000);
      };

      const startTimer = setTimeout(poll, 1000);
      return () => {
        stopped = true;
        clearTimeout(startTimer);
        if (debounceTimer) clearTimeout(debounceTimer);
      };
    },
    [roomId, syncAll],
  );

  return { syncAll, startWatching };
}
