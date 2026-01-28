"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { dockerColors } from "../../_config/colors";

export interface LogEntry {
  id: string;
  message: string;
  color: keyof typeof dockerColors.logger;
  timestamp: number;
}

interface DockerLoggerProps {
  logs: LogEntry[];
  className?: string;
}

export function DockerLogger({ logs, className }: DockerLoggerProps) {
  const consoleRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new logs are added
  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div
      ref={consoleRef}
      className={cn(
        "absolute bottom-4 left-4 right-4",
        dockerColors.logger.bg,
        "bg-opacity-90 rounded p-3",
        "font-mono text-xs md:text-sm",
        "h-32 overflow-y-auto",
        "shadow-inner border",
        dockerColors.logger.border,
        className
      )}
    >
      {logs.length === 0 ? (
        <div className={dockerColors.logger.gray}>
          // System ready. Waiting for command...
        </div>
      ) : (
        logs.map((log) => (
          <div
            key={log.id}
            className={cn(dockerColors.logger[log.color], "mb-1")}
          >
            &gt; {log.message}
          </div>
        ))
      )}
    </div>
  );
}

/**
 * Helper hook to manage log state
 */
export function useDockerLogs(maxEntries: number = 50) {
  const [logs, setLogs] = React.useState<LogEntry[]>([]);

  const addLog = (message: string, color: keyof typeof dockerColors.logger = "text") => {
    setLogs((prev) => {
      const newLog: LogEntry = {
        id: `log-${Date.now()}-${Math.random()}`,
        message,
        color,
        timestamp: Date.now(),
      };

      const updated = [...prev, newLog];
      return updated.slice(-maxEntries); // Keep only last N entries
    });
  };

  const clearLogs = () => setLogs([]);

  return { logs, addLog, clearLogs };
}

// For React import
import * as React from "react";
