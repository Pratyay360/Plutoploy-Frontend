import { CheckCircle2, Copy, Download, XCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "../../lib/utils";

interface LogLine {
  timestamp: string;
  message: string;
  type: "info" | "success" | "error" | "warning";
}

interface TerminalLogViewerProps {
  logs: LogLine[];
  isStreaming?: boolean;
  status?: "success" | "failed" | "building";
}

export function TerminalLogViewer({
  logs = [],
  isStreaming = false,
  status,
}: TerminalLogViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  // biome-ignore lint/correctness/useExhaustiveDependencies: auto-scroll depends on logs length to trigger on change
  useEffect(() => {
    if (autoScroll && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs.length, autoScroll]);

  const handleCopy = () => {
    const text = (logs ?? []).map((l) => `${l.timestamp} ${l.message}`).join("\n");
    navigator.clipboard.writeText(text);
  };

  const getLineColor = (type: LogLine["type"]) => {
    switch (type) {
      case "success":
        return "text-success";
      case "error":
        return "text-error";
      case "warning":
        return "text-warning";
      default:
        return "text-base-content/50";
    }
  };

  return (
    <div className="rounded-xl overflow-hidden border border-base-300/60 shadow-lg shadow-black/10">
      <div className="flex items-center justify-between px-4 py-3 border-b border-base-300/60 bg-base-200/80">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-error/60 hover:bg-error transition-colors" />
            <div className="w-3 h-3 rounded-full bg-warning/60 hover:bg-warning transition-colors" />
            <div className="w-3 h-3 rounded-full bg-success/60 hover:bg-success transition-colors" />
          </div>
          <span className="text-xs text-base-content/40 font-mono font-medium">
            Build Logs
          </span>
          {isStreaming && (
            <span className="flex items-center gap-1.5 text-xs text-primary font-medium">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Streaming...
            </span>
          )}
        </div>
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={handleCopy}
            className="btn btn-ghost btn-square btn-xs text-base-content/30 hover:text-base-content"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-square btn-xs text-base-content/30 hover:text-base-content"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div
        ref={containerRef}
        className="max-h-[400px] overflow-auto font-mono text-xs leading-relaxed bg-base-100"
        onScroll={(e) => {
          const target = e.target as HTMLDivElement;
          const isAtBottom =
            target.scrollHeight - target.scrollTop <= target.clientHeight + 50;
          setAutoScroll(isAtBottom);
        }}
      >
        {logs.map((log, index) => (
          <div
            // biome-ignore lint/suspicious/noArrayIndexKey: logs are append-only and timestamp alone may collide
            key={`${log.timestamp}-${index}`}
            className="flex gap-3 py-[3px] hover:bg-base-200/40 px-4 transition-colors"
          >
            <span className="text-base-content/20 select-none shrink-0 w-16 text-right">
              {log.timestamp}
            </span>
            <span className={cn("break-all", getLineColor(log.type))}>
              {log.message}
            </span>
          </div>
        ))}
        {isStreaming && (
          <div className="flex items-center gap-2 py-2 px-4">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-base-content/40">Waiting for logs...</span>
          </div>
        )}
      </div>

      {status && (
        <div
          className={cn(
            "px-4 py-3 border-t border-base-300/60 flex items-center gap-2 text-xs font-semibold",
            status === "success" && "text-success bg-success/5",
            status === "failed" && "text-error bg-error/5",
          )}
        >
          {status === "success" && (
            <>
              <CheckCircle2 className="w-4 h-4" />
              Build completed successfully
            </>
          )}
          {status === "failed" && (
            <>
              <XCircle className="w-4 h-4" />
              Build failed
            </>
          )}
        </div>
      )}
    </div>
  );
}
