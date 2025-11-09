"use client"

import { useEffect, useRef } from "react"
import { Terminal } from "xterm"
import { FitAddon } from "xterm-addon-fit"
import "xterm/css/xterm.css"

export function TerminalPanel() {
  const terminalRef = useRef<HTMLDivElement | null>(null)
  const fitAddon = useRef(new FitAddon())

  useEffect(() => {
    if (!terminalRef.current) return

    const term = new Terminal({
      theme: {
        background: "#1e1e1e",
        foreground: "#ffffff",
        cursor: "#00ffb3",
        // TypeScript fix: remove "selection"
      },
      fontFamily: "monospace",
      fontSize: 14,
      cursorBlink: true,
    })

    term.loadAddon(fitAddon.current)
    term.open(terminalRef.current)
    fitAddon.current.fit()

    // Simple text intro
    term.writeln("Welcome to Collabo Terminal 🌿")
    term.writeln("Type 'help' to see commands.")
    term.write("\r\n$ ")

    // Keep track of user input manually
    let userInput = ""

    term.onKey(({ key, domEvent }) => {
      const printable = !domEvent.altKey && !domEvent.ctrlKey && !domEvent.metaKey

      if (domEvent.key === "Enter") {
        handleCommand(userInput, term)
        userInput = ""
        term.write("\r\n$ ")
      } else if (domEvent.key === "Backspace") {
        if (userInput.length > 0) {
          userInput = userInput.slice(0, -1)
          term.write("\b \b")
        }
      } else if (printable) {
        userInput += key
        term.write(key)
      }
    })

    const handleResize = () => fitAddon.current.fit()
    window.addEventListener("resize", handleResize)
    return () => {
      window.removeEventListener("resize", handleResize)
      term.dispose()
    }
  }, [])

  return (
    <div className="h-64 w-full bg-[#1e1e1e] border-t border-[#3e3e42] rounded-t-md overflow-hidden">
      <div ref={terminalRef} className="h-full w-full" />
    </div>
  )
}

// Handle fake commands
function handleCommand(command: string, term: Terminal) {
  switch (command.trim().toLowerCase()) {
    case "help":
      term.writeln("\r\nAvailable commands:")
      term.writeln("  help - show available commands")
      term.writeln("  clear - clear terminal")
      term.writeln("  about - show about info")
      break
    case "clear":
      term.clear()
      break
    case "about":
      term.writeln("\r\n🌿 Collabo Terminal v1.0 — Real-time code collaboration system")
      break
    default:
      term.writeln(`\r\nCommand not found: ${command}`)
  }
}
