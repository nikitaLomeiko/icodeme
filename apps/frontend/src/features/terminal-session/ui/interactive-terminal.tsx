"use client";

import { useEffect, useRef } from "react";
import { FitAddon } from "@xterm/addon-fit";
import { Terminal as XTerm } from "@xterm/xterm";
import { baseUrl } from "@/shared/api";
import "@xterm/xterm/css/xterm.css";

interface IProps {
  ticket: string | null;
  initialOutput?: string;
  className?: string;
}

export const InteractiveTerminal: React.FC<IProps> = ({
  ticket,
  initialOutput = "",
  className = "h-[65vh] min-h-[560px] max-h-[780px]",
}) => {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const terminal = new XTerm({
      allowProposedApi: false,
      cursorBlink: true,
      convertEol: false,
      fontFamily: "'Geist Mono', 'JetBrains Mono', monospace",
      fontSize: 13,
      scrollback: 5000,
      theme: {
        background: "#111827",
        foreground: "#e5e7eb",
        cursor: "#93c5fd",
        selectionBackground: "#374151",
      },
    });
    const fit = new FitAddon();
    terminal.loadAddon(fit);
    terminal.open(host);

    let socket: WebSocket | null = null;
    const sendResize = () => {
      if (socket?.readyState === WebSocket.OPEN) {
        socket.send(
          JSON.stringify({
            type: "resize",
            cols: terminal.cols,
            rows: terminal.rows,
          }),
        );
      }
    };
    const fitTerminal = () => {
      try {
        fit.fit();
        sendResize();
      } catch {
        // The terminal can briefly have zero dimensions during layout.
      }
    };

    const resizeObserver = new ResizeObserver(fitTerminal);
    resizeObserver.observe(host);
    requestAnimationFrame(fitTerminal);
    terminal.onResize(sendResize);

    let connectTimer: number | undefined;
    if (ticket) {
      // A terminal ticket is single use. Strict Mode replays effects during
      // development, so the first setup must not consume the ticket.
      connectTimer = window.setTimeout(() => {
        const parsedBaseUrl = new URL(baseUrl, window.location.href);
        const basePath = parsedBaseUrl.pathname.endsWith("/")
          ? parsedBaseUrl.pathname
          : `${parsedBaseUrl.pathname}/`;
        const url = new URL(
          "ide/docker/terminal",
          `${parsedBaseUrl.origin}${basePath}`,
        );
        url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
        url.searchParams.set("ticket", ticket);
        socket = new WebSocket(url);
        socket.onopen = () => {
          fitTerminal();
          terminal.focus();
        };
        socket.onmessage = (event) => {
          if (typeof event.data === "string") terminal.write(event.data);
          else if (event.data instanceof ArrayBuffer) {
            terminal.write(new Uint8Array(event.data));
          }
        };
        socket.onerror = () => {
          terminal.write(
            "\r\n\x1b[31mНе удалось подключиться к терминалу по WebSocket.\x1b[0m\r\n",
          );
        };
        socket.onclose = (event) => {
          if (event.code !== 1000) {
            terminal.write(
              event.code === 4008
                ? "\r\n\x1b[33mВремя выполнения истекло.\x1b[0m\r\n"
                : `\r\n\x1b[33mСоединение терминала закрыто (${event.code}).\x1b[0m\r\n`,
            );
          }
        };
        terminal.onData((data) => {
          if (socket?.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ type: "input", data }));
          }
        });
      }, 0);
    } else {
      terminal.write(initialOutput || "Terminal session finished.");
    }

    return () => {
      window.clearTimeout(connectTimer);
      resizeObserver.disconnect();
      socket?.close(1000, "Terminal view closed");
      terminal.dispose();
    };
  }, [initialOutput, ticket]);

  return (
    <div className="w-full bg-[#111827] p-3">
      <div
        ref={hostRef}
        className={`w-full overflow-hidden ${className}`}
        onMouseDown={() => hostRef.current?.querySelector("textarea")?.focus()}
      />
    </div>
  );
};
