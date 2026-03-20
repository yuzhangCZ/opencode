# 事件与兼容性 / Events and Compatibility

## 1. 两条事件路径

插件当前有两种主要事件消费方式：

1. `event` hook
2. `client.event.subscribe()`

它们不是同一抽象层。

## 2. `event` hook

### What it does

由 runtime 直接把 bus 事件推给插件。

### Why it matters

这是插件最稳妥的基础事件入口。

### Example

```ts
event: async ({ event }) => {
  if (event.type === "session.idle") {
    console.log("session idle", event.properties.sessionID)
  }
}
```

## 3. `client.event.subscribe()`

### What it does

通过 `GET /event` 订阅实例级 SSE。

### Server mapping

- SDK method: `client.event.subscribe`
- `operationId`: `event.subscribe`
- HTTP: `GET /event`

### Parameters

v1 默认 client：

```json
{
  "query": {
    "directory": "/repo"
  }
}
```

### Event envelope

```json
{
  "type": "message.updated",
  "properties": {}
}
```

### Minimal example

```ts
const events = await input.client.event.subscribe()

for await (const evt of events.stream) {
  console.log(evt)
}
```

### Pitfalls

- 这是增强观测通道，不建议作为唯一完成判据。
- 兼容性上，插件内 SSE 与 runtime hook 的可靠性不应视为完全等价。
- 返回值是 `{ stream }`，不是 `{ data }`。

## 4. 推荐策略

推荐组合：

1. 用 `event` hook 作为基线
2. 用 `client.event.subscribe()` 做附加观测
3. 完成态结合 `session.idle`、`message.updated`、状态回拉一起判断

## 5. 为什么不要只依赖 SSE

已有仓库内分析指出：

1. 插件内 REST 与 SSE 可能不总是走同一可靠路径。
2. `event` hook 已能覆盖大多数消息生命周期事件。
3. 单独依赖 SSE 容易把“未观察到事件”误判成“服务端未处理”。

详见：

- `docs/architecture/04-plugin-client-event-analysis.md`

## 6. Fallback 策略

如果你希望后台发送消息并等待结果，建议：

1. 先发 `session.promptAsync`
2. 用 `event` hook 监听 `message.updated` / `session.idle`
3. 超时后再调用 `session.status()` 或 `session.messages()` 回拉

## 7. v2 Differences

v2 `event.subscribe()` 额外支持：

- `directory`
- `workspace`

并使用更一致的参数构造方式。

## 8. 相关 SSE 文档

- 事件总览：[../sse/00-event-catalog.md](../sse/00-event-catalog.md)
- SSE 参考：[../02-sse-reference.md](../02-sse-reference.md)

## 9. Evidence

1. `packages/plugin/src/index.ts`
2. `packages/sdk/js/src/gen/sdk.gen.ts`
3. `packages/sdk/js/src/gen/types.gen.ts`
4. `packages/sdk/js/src/v2/gen/sdk.gen.ts`
5. `packages/opencode/src/server/routes/global.ts`
6. `packages/opencode/src/server/server.ts`
7. `docs/architecture/04-plugin-client-event-analysis.md`
