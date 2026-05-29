import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolInvocation, getFriendlyToolMessage } from "../ToolInvocation";

afterEach(() => {
  cleanup();
});

test("getFriendlyToolMessage maps str_replace_editor create to friendly text", () => {
  const msg = getFriendlyToolMessage({
    toolName: "str_replace_editor",
    state: "call",
    args: { command: "create", path: "/App.jsx" },
  });
  expect(msg.inProgress).toBe("Creating");
  expect(msg.done).toBe("Created");
  expect(msg.filename).toBe("/App.jsx");
});

test("getFriendlyToolMessage maps str_replace_editor str_replace to Editing", () => {
  const msg = getFriendlyToolMessage({
    toolName: "str_replace_editor",
    state: "call",
    args: { command: "str_replace", path: "/components/Card.jsx" },
  });
  expect(msg.inProgress).toBe("Editing");
  expect(msg.done).toBe("Edited");
  expect(msg.filename).toBe("/components/Card.jsx");
});

test("getFriendlyToolMessage maps str_replace_editor view to Reading", () => {
  const msg = getFriendlyToolMessage({
    toolName: "str_replace_editor",
    state: "call",
    args: { command: "view", path: "/App.jsx" },
  });
  expect(msg.inProgress).toBe("Reading");
  expect(msg.done).toBe("Read");
});

test("getFriendlyToolMessage maps file_manager delete", () => {
  const msg = getFriendlyToolMessage({
    toolName: "file_manager",
    state: "call",
    args: { command: "delete", path: "/old.jsx" },
  });
  expect(msg.inProgress).toBe("Deleting");
  expect(msg.done).toBe("Deleted");
  expect(msg.filename).toBe("/old.jsx");
});

test("getFriendlyToolMessage maps file_manager rename with new_path", () => {
  const msg = getFriendlyToolMessage({
    toolName: "file_manager",
    state: "call",
    args: { command: "rename", path: "/a.jsx", new_path: "/b.jsx" },
  });
  expect(msg.inProgress).toBe("Renaming /a.jsx to");
  expect(msg.done).toBe("Renamed /a.jsx to");
  expect(msg.filename).toBe("/b.jsx");
});

test("getFriendlyToolMessage humanizes unknown tool names", () => {
  const msg = getFriendlyToolMessage({
    toolName: "some_other_tool",
    state: "call",
  });
  expect(msg.inProgress).toBe("Running Some Other Tool");
  expect(msg.done).toBe("Ran Some Other Tool");
  expect(msg.filename).toBeUndefined();
});

test("ToolInvocation renders loading state with in-progress label and filename", () => {
  render(
    <ToolInvocation
      tool={{
        toolName: "str_replace_editor",
        state: "call",
        args: { command: "create", path: "/App.jsx" },
      }}
    />
  );

  expect(screen.getByText("Creating")).toBeDefined();
  expect(screen.getByText("/App.jsx")).toBeDefined();
  expect(screen.getByTestId("tool-status-loading")).toBeDefined();
  expect(screen.queryByTestId("tool-status-done")).toBeNull();
});

test("ToolInvocation renders done state with completed label and filename", () => {
  render(
    <ToolInvocation
      tool={{
        toolName: "str_replace_editor",
        state: "result",
        args: { command: "str_replace", path: "/components/Card.jsx" },
        result: "ok",
      }}
    />
  );

  expect(screen.getByText("Edited")).toBeDefined();
  expect(screen.getByText("/components/Card.jsx")).toBeDefined();
  expect(screen.getByTestId("tool-status-done")).toBeDefined();
  expect(screen.queryByTestId("tool-status-loading")).toBeNull();
});

test("ToolInvocation does not show raw tool id like str_replace_editor", () => {
  render(
    <ToolInvocation
      tool={{
        toolName: "str_replace_editor",
        state: "result",
        args: { command: "create", path: "/App.jsx" },
        result: "ok",
      }}
    />
  );

  expect(screen.queryByText("str_replace_editor")).toBeNull();
});

test("ToolInvocation falls back gracefully without a filename for unknown tools", () => {
  render(
    <ToolInvocation
      tool={{
        toolName: "mystery_tool",
        state: "call",
      }}
    />
  );

  expect(screen.getByText("Running Mystery Tool")).toBeDefined();
});
