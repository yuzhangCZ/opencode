# SSE 事件总目录

- Contract Baseline: `dev@cf425d114`
- Last Verified: `2026-03-06`
- Runtime Observed Version: `v1.2.15`
- Version Note Default: 未单独标注字段默认 `since v1.2.0`（以本文件 Contract Baseline 为准）


本目录按“事件分类 + 稳定性”列出全部 SSE 事件。

- `contracted`: 在 OpenAPI/SDK `Event` 联合中定义。
- `runtime-only`: 运行时发送但不在 `Event` 联合中。

统计：

- `contracted`: 45
- `runtime-only`: 1
- 总计：46

## 1. Server / Global / Project / Installation

- `installation.updated` (`contracted`)
- `installation.update-available` (`contracted`)
- `project.updated` (`contracted`)
- `server.instance.disposed` (`contracted`)
- `server.connected` (`contracted`)
- `server.heartbeat` (`runtime-only`)
- `global.disposed` (`contracted`)

详情见 [01-server-global-events.md](./01-server-global-events.md)

## 2. Session

- `session.status` (`contracted`)
- `session.idle` (`contracted`)
- `session.compacted` (`contracted`)
- `session.created` (`contracted`)
- `session.updated` (`contracted`)
- `session.deleted` (`contracted`)
- `session.diff` (`contracted`)
- `session.error` (`contracted`)
- `todo.updated` (`contracted`)
- `vcs.branch.updated` (`contracted`)

详情见 [02-session-events.md](./02-session-events.md)

## 3. Message

- `message.updated` (`contracted`)
- `message.removed` (`contracted`)
- `message.part.updated` (`contracted`)
- `message.part.delta` (`contracted`)
- `message.part.removed` (`contracted`)

详情见 [03-message-events.md](./03-message-events.md)

## 4. Permission / Question

- `permission.asked` (`contracted`)
- `permission.replied` (`contracted`)
- `question.asked` (`contracted`)
- `question.replied` (`contracted`)
- `question.rejected` (`contracted`)

详情见 [04-permission-question-events.md](./04-permission-question-events.md)

## 5. File / LSP

- `file.edited` (`contracted`)
- `file.watcher.updated` (`contracted`)
- `lsp.client.diagnostics` (`contracted`)
- `lsp.updated` (`contracted`)

详情见 [05-file-lsp-events.md](./05-file-lsp-events.md)

## 6. PTY / Workspace / Worktree

- `pty.created` (`contracted`)
- `pty.updated` (`contracted`)
- `pty.exited` (`contracted`)
- `pty.deleted` (`contracted`)
- `workspace.ready` (`contracted`)
- `workspace.failed` (`contracted`)
- `worktree.ready` (`contracted`)
- `worktree.failed` (`contracted`)

详情见 [06-pty-worktree-events.md](./06-pty-worktree-events.md)

## 7. TUI / MCP / Command

- `tui.prompt.append` (`contracted`)
- `tui.command.execute` (`contracted`)
- `tui.toast.show` (`contracted`)
- `tui.session.select` (`contracted`)
- `mcp.tools.changed` (`contracted`)
- `mcp.browser.open.failed` (`contracted`)
- `command.executed` (`contracted`)

详情见 [07-tui-mcp-command-events.md](./07-tui-mcp-command-events.md)

## 8. 统一字段约定

实例流 `/event`：

```json
{
  "type": "event.type",
  "properties": {}
}
```

全局流 `/global/event`：

```json
{
  "directory": "/repo",
  "payload": {
    "type": "event.type",
    "properties": {}
  }
}
```
