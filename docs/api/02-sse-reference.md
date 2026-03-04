# OpenCode SSE 参考 / SSE Reference

## 1. 概览

OpenCode 暴露两个 SSE 端点：

1. `GET /event`（实例级）
2. `GET /global/event`（全局级）

`/event` 返回实例事件 envelope：

```json
{
  "type": "event.type",
  "properties": {}
}
```

`/global/event` 返回全局事件 envelope：

```json
{
  "directory": "/path/to/project",
  "payload": {
    "type": "event.type",
    "properties": {}
  }
}
```

## 2. 协议

响应头：

```http
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive
```

服务端行为：

1. 连接建立后发送 `server.connected`。
2. 每 30 秒发送一次 `server.heartbeat`（实现存在，当前未进入 OpenAPI/SDK 事件联合）。
3. 业务事件通过总线推送。
4. 客户端断开时停止心跳并清理订阅。

## 3. 重连语义

当前实现仅写 `data:`，不维护 `id:` 与 `retry:`。建议客户端：

1. 使用默认 EventSource 重连策略并做指数退避。
2. 首次收到 `server.connected` 后执行一次状态回拉。
3. 按 `type + 业务主键` 做幂等去重。

## 4. 文档目录（按事件分类）

1. [事件总目录](./sse/00-event-catalog.md)
2. [Server / Global / Project / Installation 事件](./sse/01-server-global-events.md)
3. [Session 事件](./sse/02-session-events.md)
4. [Message 事件](./sse/03-message-events.md)
5. [Permission / Question 事件](./sse/04-permission-question-events.md)
6. [File / LSP 事件](./sse/05-file-lsp-events.md)
7. [PTY / Worktree 事件](./sse/06-pty-worktree-events.md)
8. [TUI / MCP / Command 事件](./sse/07-tui-mcp-command-events.md)

## 5. 契约差异总览

- `contracted`：在 OpenAPI/SDK `Event` 联合中定义（当前 42 个）。
- `runtime-only`：运行时会发送但未纳入 OpenAPI/SDK 联合。

当前已确认差异：

- `server.heartbeat`: `runtime-only`

证据：

- `packages/opencode/src/server/server.ts`
- `packages/opencode/src/server/routes/global.ts`
- `packages/sdk/js/src/v2/gen/types.gen.ts`
