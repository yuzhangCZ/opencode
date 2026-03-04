# OpenCode SSE 参考 / SSE Reference

## 1. 概览 / Overview

OpenCode 暴露两个 SSE 端点：

1. `GET /event`（实例级 / instance-scoped）
2. `GET /global/event`（全局级 / global-scoped）

核心能力：

- 连接确认事件：`server.connected`
- 心跳事件：`server.heartbeat`（30s）
- 业务事件透传：`{ type, properties }`
- 断开清理：`onAbort` 时解除订阅 + 停止心跳

证据 / Evidence:

- `packages/opencode/src/server/server.ts` (`GET /event`)
- `packages/opencode/src/server/routes/global.ts` (`GET /global/event`)
- `packages/opencode/src/bus/index.ts`
- `packages/opencode/src/bus/global.ts`

## 2. 协议与报文 / Protocol and Payload

### 2.1 HTTP 响应头

```http
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive
```

### 2.2 实例级 Envelope

```json
{
  "type": "event.type",
  "properties": {}
}
```

### 2.3 全局级 Envelope

```json
{
  "directory": "/path/to/project",
  "payload": {
    "type": "event.type",
    "properties": {}
  }
}
```

## 3. Endpoint: GET /event

### Summary

订阅当前目录实例事件（subscribe events for current instance context）。

### Auth / Headers / Query

- Auth: 与 REST 一致（可选 Basic Auth）
- Header:
  - `x-opencode-directory`（可选）
- Query:
  - `directory`（可选）

### cURL 示例

```bash
curl -N 'http://localhost:4096/event?directory=/Users/zy/Code/opencode/opencode'
```

### EventSource 示例

```ts
const es = new EventSource("/event")
es.onmessage = (evt) => {
  const data = JSON.parse(evt.data)
  console.log(data.type, data.properties)
}
es.onerror = (err) => {
  console.error("sse error", err)
}
```

### 报文示例 / Payload Examples

连接建立：

```json
{"type":"server.connected","properties":{}}
```

心跳：

```json
{"type":"server.heartbeat","properties":{}}
```

业务事件（示例）：

```json
{"type":"session.created","properties":{"info":{"id":"ses_xxx","title":"demo"}}}
```

## 4. Endpoint: GET /global/event

### Summary

订阅全局事件流（subscribe events across all instances）。

### Auth / Headers / Query

- Auth: 与 REST 一致
- Query/Header: 可透传目录上下文，但返回为全局广播

### cURL 示例

```bash
curl -N 'http://localhost:4096/global/event'
```

### EventSource 示例

```ts
const es = new EventSource("/global/event")
es.onmessage = (evt) => {
  const data = JSON.parse(evt.data)
  console.log(data.directory, data.payload.type)
}
```

### 报文示例 / Payload Examples

连接建立：

```json
{"directory":"/repo","payload":{"type":"server.connected","properties":{}}}
```

心跳：

```json
{"directory":"/repo","payload":{"type":"server.heartbeat","properties":{}}}
```

业务事件（示例）：

```json
{"directory":"/repo","payload":{"type":"session.status","properties":{"sessionID":"ses_xxx","status":{"active":true}}}}
```

## 5. 连接生命周期 / Connection Lifecycle

1. `streamSSE` 建立连接。
2. 首包写入 `server.connected`。
3. 注册事件订阅（`Bus.subscribeAll` 或 `GlobalBus.on("event")`）。
4. 每 30 秒写入 `server.heartbeat`。
5. 客户端断开触发 `onAbort`：
   - `clearInterval(heartbeat)`
   - 取消订阅（`unsub()` 或 `GlobalBus.off(...)`）

证据 / Evidence:

- `packages/opencode/src/server/server.ts`
- `packages/opencode/src/server/routes/global.ts`

## 6. Message 事件详解 / Message Event Details

以下事件均通过 `Bus.publish(...)` 进入实例级 `/event`，并由 `GlobalBus.emit("event", ...)` 转发到 `/global/event`。

证据 / Evidence:

- `packages/opencode/src/session/message-v2.ts` (`MessageV2.Event.*`)
- `packages/opencode/src/session/index.ts` (`updateMessage`, `removeMessage`, `updatePart`, `removePart`)
- `packages/opencode/src/bus/index.ts` (`publish` -> `GlobalBus.emit`)

### 6.1 `message.updated`

- 触发时机 / Trigger:
  - 消息信息被写入或更新时（包括 assistant 响应过程中的状态变化）。
- Properties:
  - `info`: `Message`（`UserMessage | AssistantMessage`）

实例级示例 / Instance payload:

```json
{
  "type": "message.updated",
  "properties": {
    "info": {
      "id": "msg_001",
      "sessionID": "ses_001",
      "role": "assistant",
      "parentID": "msg_user_001",
      "providerID": "anthropic",
      "modelID": "claude-3-5-sonnet",
      "cost": 0.0123
    }
  }
}
```

全局级示例 / Global payload:

```json
{
  "directory": "/repo",
  "payload": {
    "type": "message.updated",
    "properties": {
      "info": {
        "id": "msg_001",
        "sessionID": "ses_001",
        "role": "assistant"
      }
    }
  }
}
```

### 6.2 `message.removed`

- 触发时机 / Trigger:
  - 消息被删除时（例如回滚或清理流程）。
- Properties:
  - `sessionID`: string
  - `messageID`: string

实例级示例 / Instance payload:

```json
{
  "type": "message.removed",
  "properties": {
    "sessionID": "ses_001",
    "messageID": "msg_001"
  }
}
```

全局级示例 / Global payload:

```json
{
  "directory": "/repo",
  "payload": {
    "type": "message.removed",
    "properties": {
      "sessionID": "ses_001",
      "messageID": "msg_001"
    }
  }
}
```

### 6.3 `message.part.updated`

- 触发时机 / Trigger:
  - 消息片段（text/reasoning/tool 等 part）被新增或更新时。
  - 流式输出期间可能高频触发。
- Properties:
  - `part`: `MessagePart`
  - `delta?`: string（可选，流式增量文本）

实例级示例 / Instance payload:

```json
{
  "type": "message.part.updated",
  "properties": {
    "part": {
      "id": "part_001",
      "messageID": "msg_001",
      "sessionID": "ses_001",
      "type": "text",
      "text": "partial output"
    },
    "delta": " output"
  }
}
```

全局级示例 / Global payload:

```json
{
  "directory": "/repo",
  "payload": {
    "type": "message.part.updated",
    "properties": {
      "part": {
        "id": "part_001",
        "messageID": "msg_001",
        "type": "text"
      },
      "delta": " output"
    }
  }
}
```

### 6.4 `message.part.removed`

- 触发时机 / Trigger:
  - 某个 part 被删除时（例如回滚导致 part 清理）。
- Properties:
  - `sessionID`: string
  - `messageID`: string
  - `partID`: string

实例级示例 / Instance payload:

```json
{
  "type": "message.part.removed",
  "properties": {
    "sessionID": "ses_001",
    "messageID": "msg_001",
    "partID": "part_001"
  }
}
```

全局级示例 / Global payload:

```json
{
  "directory": "/repo",
  "payload": {
    "type": "message.part.removed",
    "properties": {
      "sessionID": "ses_001",
      "messageID": "msg_001",
      "partID": "part_001"
    }
  }
}
```

### 6.5 客户端消费建议 / Consumer Notes

1. `message.part.updated` 可能高频到达，建议按 `part.id` 聚合并节流渲染。
2. 遇到 `message.removed` 或 `message.part.removed` 时，应从本地状态树同步删除对象。
3. `message.updated` 与 `message.part.updated` 可能交错到达，建议按 `messageID` 维护幂等状态合并。

## 7. 重连语义 / Reconnection Semantics

OpenCode 当前实现仅写 `data:` 字段，不显式维护 `id:` 和 `retry:`；客户端应采用默认 EventSource 重连策略，并在业务层做去重。

推荐客户端策略：

1. 断连时指数退避重连。
2. 首次收到 `server.connected` 后拉取一次最新状态（如 `GET /session`）。
3. 业务事件按 `type + key fields` 做幂等处理。

## 8. 常见事件类型 / Common Event Types

- `server.connected`
- `server.heartbeat`
- `server.instance.disposed`
- `session.created`
- `session.updated`
- `session.deleted`
- `session.status`
- `session.error`
- `message.updated`
- `message.removed`
- `message.part.updated`
- `message.part.removed`

来源 / Source:

- `packages/opencode/src/server/event.ts`
- `packages/opencode/src/session/*-event.ts`
- `docs/sse-implementation.md`

## 9. 错误与故障排查 / Troubleshooting

### 无事件输出

- 检查是否连接到正确目录上下文（`directory` / `x-opencode-directory`）。
- 检查 server 日志是否有 `event connected`。

### 频繁断连

- 确认客户端允许长连接。
- 确认代理层未设置过短 idle timeout。
- 同一个 `subscription.stream` 只使用一个消费者循环；不要并发或分段重复 `for await` 消费同一流。

### 事件延迟

- 检查是否存在大量同步任务阻塞 event loop。
- 观察 `server.heartbeat` 到达间隔是否稳定。
