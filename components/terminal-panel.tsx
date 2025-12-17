"use client";

import { useEffect, useRef } from "react";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import "xterm/css/xterm.css";
import { getWebContainer } from "@/lib/webcontainer";

/**
 * Minimal xterm + WebContainer terminal panel.
 *
 * Goals:
 * - Keep a single terminal + process per mount.
 * - Make input piping robust and clean up resources on unmount.
 * - Stay simple and readable for the MVP.
 */
export default function TerminalPanel() {
  const terminalRef = useRef<HTMLDivElement>(null);

  // Track the active WebContainer process and writer so we can clean them up.
  const processRef = useRef<any | null>(null);
  const writerRef = useRef<WritableStreamDefaultWriter<string> | null>(null);

  // We keep connectTerminal inside the component but outside useEffect so the logic
  // is clear and testable, while still only being called once by the effect.
  async function connectTerminal(terminal: Terminal) {
    try {
      const wc = await getWebContainer();

      const process = await wc.spawn("jsh", {
        terminal: {
          cols: terminal.cols,
          rows: terminal.rows,
        },
      });

      processRef.current = process;

      // Shell → Terminal
      if (typeof WritableStream !== "undefined") {
        await process.output.pipeTo(
          new WritableStream({
            write(data) {
              terminal.write(data);
            },
          })
        );
      } else {
        terminal.writeln("Your browser does not support streams.");
      }

      // Terminal → Shell
      const writer = process.input.getWriter();
      writerRef.current = writer;

      terminal.onData((data) => {
        // If the process has exited for any reason, avoid writing to a closed stream.
        if (!writerRef.current) return;
        writerRef.current.write(data);
      });
    } catch (error) {
      console.error("Failed to start terminal process", error);
      terminal.writeln("\r\nFailed to start shell process.\r\n");
    }
  }

  useEffect(() => {
    if (!terminalRef.current) return;

    const terminal = new Terminal({
      cursorBlink: true,
      convertEol: true,
      theme: {
        background: "#1e1e1e",
        foreground: "#ffffff",
      },
    });

    const fitAddon = new FitAddon();
    terminal.loadAddon(fitAddon);

    terminal.open(terminalRef.current);
    fitAddon.fit();
    terminal.focus();

    // Connect once for this mount.
    void connectTerminal(terminal);

    // Clean up terminal + any active WebContainer process.
    return () => {
      try {
        if (writerRef.current) {
          writerRef.current.close?.();
          writerRef.current = null;
        }
        if (processRef.current) {
          processRef.current.kill?.();
          processRef.current = null;
        }
      } catch (error) {
        console.error("Error cleaning up terminal process", error);
      } finally {
        terminal.dispose();
      }
    };
  }, []);

  return (
    <div className="h-48 bg-black border-t border-[#333]">
      <div ref={terminalRef} className="h-full w-full" />
    </div>
  );
}
