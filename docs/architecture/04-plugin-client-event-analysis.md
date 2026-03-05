# 插件 `client.event.subscribe` 事件缺失问题分析报告（`packages/opencode` 运行时专题）/ Plugin Event Subscription Analysis (`packages/opencode` Runtime Incident)

## 1. 背景与问题定义 / Background

在插件 `event-subscription-test` 中，执行“创建会话 -> 发送 `prompt_async` -> 等待消息事件”时出现现象：

1. 服务端存在消息处理与事件发布。
2. 插件通过 `client.event.subscribe()` 的 SSE 流未观察到对应消息事件（`sseEventCount=0`）。
3. 早期版本插件还出现请求路径异常（字面 `/session/{id}`）。

本报告目标：

1. 明确根因（root cause）。
2. 给出可执行修复措施（mitigation/fix）。
3. 沉淀插件开发的兼容性建议（compatibility guidance）。

---

## 2. 复现证据 / Evidence

### 2.1 日志证据（服务端有事件发布）

- 日志文件：`/Users/zy/.local/share/opencode/log/2026-03-03T163737.log`
- 可见 `Bus` 发布了：
  - `message.updated`
  - `message.part.updated`
  - `session.idle`

结论：

- 事件生产链路正常（server-side publish is healthy）。

### 2.2 日志证据（插件 SSE 未消费）

- 同一轮日志中插件最终摘要：
  - `sseEvents=0`
  - `hookEvents>0`
  - `messageSeen=true`
  - `idleSeen=true`
  - `timedOut=false`

结论：

- 通过插件 `event` hook 能接收到消息生命周期事件；SSE 通道未成为可靠来源。

### 2.3 代码证据（SSE 链路差异）

- 旧链路（v1 gen）：
  - `packages/sdk/js/src/gen/core/serverSentEvents.gen.ts`
  - 历史实现直接调用 `fetch(url, ...)`。
- 新链路（v2 gen）：
  - `packages/sdk/js/src/v2/gen/core/serverSentEvents.gen.ts`
  - 支持 `fetch` 注入与 `onRequest`，与 client pipeline 一致。

结论：

- v1 与 v2 在 SSE 请求路径复用能力上存在实现差异。

### 2.4 代码证据（插件参数形状不兼容）

- 插件初始调用使用 `sessionID` 风格，导致请求路由变量未替换，出现字面路径：
  - `/session/{id}/prompt_async`
  - `/session/{id}`
- 修复后改为 `path/body` 风格：
  - `client.session.promptAsync({ path: { id }, body: {...} })`
  - `client.session.delete({ path: { id } })`

文件锚点：

- `.opencode/plugins/event-subscription-test.ts`
- `packages/sdk/js/example/example.ts`

---

## 3. 根因分析 / Root Cause

## 3.1 主根因：插件内 SSE 与 REST 走不同可靠路径

1. 插件发送 REST（如 `session.create` / `prompt_async`）可成功。
2. 插件 SSE 订阅在当前运行条件下未稳定复用同一请求链路。
3. 导致“服务端有事件发布，但插件 SSE 侧无消费”。

本质：

- 数据面有事件，观测面（SSE consumer）丢失。

## 3.2 次根因：插件调用参数风格与 SDK 期望不一致

1. 旧写法使用 `sessionID` 字段。
2. 运行时 SDK 期望 `path/body`。
3. 请求被发成字面 `/session/{id}`，造成发送失败或行为异常。

## 3.3 诱因与放大因素

1. 仅依赖 SSE 单通道判定任务成功。
2. 错误日志未结构化，输出 `[object Object]`，增加排障成本。
3. 缺少跨版本能力探测（feature/capability probing）。

---

## 4. 解决措施 / Resolution

## 4.1 已实施修复（当前仓库）

1. 修复插件请求参数形状（`path/body`）。
2. 增强错误日志结构化输出（`message/status/url/raw`）。
3. 增加 `event` hook 兜底消费，避免单点依赖 SSE。
4. 修正 `event.subscribe` 参数传递，确保 `signal` 可生效。

变更文件：

- `.opencode/plugins/event-subscription-test.ts`
- `packages/sdk/js/src/gen/core/serverSentEvents.gen.ts`（本地修复）

## 4.2 中期建议

1. 插件侧优先使用 `@opencode-ai/sdk/v2/client` 构造独立 client。
2. SSE 通道保留，但仅作为增强观测通道，不作为唯一完成判据。

## 4.3 长期建议

1. 平台层统一插件注入 v2 client（或提供显式版本开关）。
2. 在插件 API 文档中补充：
   - 插件内 `client` 的版本语义
   - SSE 与 REST 的链路一致性约束
   - 兼容参数形状示例

---

## 5. 插件开发注意事项与建议 / Plugin Author Guidance

## 5.1 传输与事件策略

1. `event` hook 为必选（baseline）。
2. `client.event.subscribe` 为可选增强（best-effort）。
3. 完成态使用组合事件判定：
   - `message.updated` 或 `message.part.updated`
   - `session.idle` 或 `session.status(type=idle)`

## 5.2 SDK 调用兼容策略

1. 封装 adapter，按能力探测决定参数形状。
2. `promptAsync` 不可用时回退 `prompt`。
3. 不在业务代码中散落多种调用形状。

## 5.3 可观测性与调试

1. 统一日志字段：
   - `sessionID`
   - `eventCount`
   - `lastEventType`
   - `error.status`
   - `error.url`
2. 超时日志必须包含诊断上下文（count/last event/filter info）。

## 5.4 版本治理

1. 在 `peerDependencies` 中声明可兼容范围。
2. 启动时打印能力快照：
   - 是否支持 `path/body`
   - 是否支持 `promptAsync`
   - 当前事件通道（hook/sse）

---

## 6. 验证与验收清单 / Validation Checklist

1. 触发测试后，`prompt_async` 路径应为真实 session id，不得出现 `/session/{id}`。
2. 不应出现 `Send message failed`。
3. 日志应出现 `message.updated` 与 `session.idle`（至少经 hook 可见）。
4. 最终应出现 `Test completed`，且 `timedOut=false`。

---

## 7. 相关 Issue 与文档参考 / References

GitHub（仓库已迁移到 `anomalyco/opencode`）：

1. [#8564 TUI doesn't render messages from prompt_async endpoint](https://github.com/anomalyco/opencode/issues/8564)
2. [#11424 while send ... always recv message.part.updated by SSE](https://github.com/anomalyco/opencode/issues/11424)
3. [#7451 session-level SSE listener discussion](https://github.com/anomalyco/opencode/issues/7451)
4. [#9650 Support sessionID filter for SSE subscription](https://github.com/anomalyco/opencode/issues/9650)
5. [#6686 openapi event.subscribe parameter completeness](https://github.com/anomalyco/opencode/issues/6686)

源码锚点：

1. `packages/opencode/src/plugin/index.ts`
2. `packages/opencode/src/server/server.ts`
3. `packages/opencode/src/session/index.ts`
4. `packages/sdk/js/src/gen/core/serverSentEvents.gen.ts`
5. `packages/sdk/js/src/v2/gen/core/serverSentEvents.gen.ts`
6. `.opencode/plugins/event-subscription-test.ts`
