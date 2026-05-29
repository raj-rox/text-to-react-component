"use client";

import { Loader2 } from "lucide-react";

interface ToolInvocationLike {
  toolName: string;
  state: string;
  args?: Record<string, unknown>;
  result?: unknown;
}

interface ToolInvocationProps {
  tool: ToolInvocationLike;
}

interface FriendlyMessage {
  inProgress: string;
  done: string;
  filename?: string;
}

/**
 * Convert a raw tool invocation from the AI SDK into a human-friendly
 * description, including the affected filename where applicable.
 */
export function getFriendlyToolMessage(
  tool: ToolInvocationLike
): FriendlyMessage {
  const args = (tool.args ?? {}) as {
    command?: string;
    path?: string;
    new_path?: string;
  };

  if (tool.toolName === "str_replace_editor") {
    const path = args.path;
    switch (args.command) {
      case "view":
        return {
          inProgress: "Reading",
          done: "Read",
          filename: path,
        };
      case "create":
        return {
          inProgress: "Creating",
          done: "Created",
          filename: path,
        };
      case "str_replace":
        return {
          inProgress: "Editing",
          done: "Edited",
          filename: path,
        };
      case "insert":
        return {
          inProgress: "Updating",
          done: "Updated",
          filename: path,
        };
      default:
        return {
          inProgress: "Working on",
          done: "Updated",
          filename: path,
        };
    }
  }

  if (tool.toolName === "file_manager") {
    const path = args.path;
    if (args.command === "rename") {
      const target = args.new_path ?? path;
      return {
        inProgress: `Renaming ${path ?? "file"} to`,
        done: `Renamed ${path ?? "file"} to`,
        filename: target,
      };
    }
    if (args.command === "delete") {
      return {
        inProgress: "Deleting",
        done: "Deleted",
        filename: path,
      };
    }
    return {
      inProgress: "Managing",
      done: "Updated",
      filename: path,
    };
  }

  // Fallback for unknown tools — humanize the tool name.
  const friendlyName = tool.toolName
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
  return {
    inProgress: `Running ${friendlyName}`,
    done: `Ran ${friendlyName}`,
  };
}

/**
 * Render a single tool invocation as a friendly status pill.
 */
export function ToolInvocation({ tool }: ToolInvocationProps) {
  const isDone = tool.state === "result" && tool.result !== undefined;
  const message = getFriendlyToolMessage(tool);
  const label = isDone ? message.done : message.inProgress;

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs border border-neutral-200">
      {isDone ? (
        <div
          data-testid="tool-status-done"
          className="w-2 h-2 rounded-full bg-emerald-500"
        />
      ) : (
        <Loader2
          data-testid="tool-status-loading"
          className="w-3 h-3 animate-spin text-blue-600"
        />
      )}
      <span className="text-neutral-700">{label}</span>
      {message.filename && (
        <code className="px-1.5 py-0.5 rounded bg-white border border-neutral-200 font-mono text-[11px] text-neutral-800">
          {message.filename}
        </code>
      )}
    </div>
  );
}
