# 实现地图 / Implementation Map

## 1. 入口实现 / Entry Implementation

### CLI 入口

- 文件：`packages/opencode/src/index.ts`
- 关键点：
  - yargs command 注册（`RunCommand`, `ServeCommand`, `McpCommand` ...）
  - 全局错误处理（`unhandledRejection`, `uncaughtException`）
  - 统一日志初始化（`Log.init`）

结论 / Conclusion:

- CLI 作为 orchestration entry，不直接承载 domain 逻辑。
- Evidence: `packages/opencode/src/index.ts`

### Server 入口

- 文件：`packages/opencode/src/server/server.ts`
- 关键点：
  - `Server.App` 聚合 middleware + route modules
  - `onError` 将 `NamedError` 映射为 HTTP 响应
  - `/doc` 通过 `openAPIRouteHandler` 暴露 OpenAPI

结论 / Conclusion:

- `server.ts` 是 API 面统一组装点（single composition root）。
- Evidence: `packages/opencode/src/server/server.ts`

## 2. 路由实现锚点 / Route Anchors

- `routes/global.ts`: `/global/health`, `/global/event`, `/global/config`, `/global/dispose`
- `routes/session.ts`: session lifecycle, message flow, fork/share/summarize/revert
- `routes/file.ts`: `/find`, `/find/file`, `/find/symbol`, `/file`, `/file/content`, `/file/status`
- `routes/project.ts`: `/project`, `/project/current`, `/project/:projectID`
- `routes/pty.ts`: PTY lifecycle + websocket connect endpoint
- `routes/config.ts`: `/config`, `/config/providers`
- `routes/provider.ts`: provider and model listing/auth flows
- `routes/mcp.ts`: mcp server CRUD + oauth/connect/disconnect
- `routes/permission.ts`: permission queue and reply
- `routes/question.ts`: question queue/reply/reject
- `routes/tui.ts`: TUI remote control commands

证据 / Evidence:

- `packages/opencode/src/server/routes/*.ts`

## 3. 关键调用链 / Key Call Chains

### 3.1 请求到实例上下文

1. 请求进入 `Server.App`。
2. 解析 `directory`（query/header/cwd fallback）。
3. `Instance.provide` 注入上下文。
4. 路由 handler 执行业务逻辑。

Evidence:

- `packages/opencode/src/server/server.ts` (`.use(async (c, next) => ...)` with `Instance.provide`)

### 3.2 SSE 事件链路

1. Client 连接 `/event` 或 `/global/event`。
2. server 发送 `server.connected`。
3. 订阅 `Bus.subscribeAll` 或 `GlobalBus.on("event")`。
4. 周期发送 `server.heartbeat`。
5. `onAbort` 清理 timer 与订阅。

Evidence:

- `packages/opencode/src/server/server.ts` (`GET /event`)
- `packages/opencode/src/server/routes/global.ts` (`GET /event` under `/global`)
- `packages/opencode/src/bus/index.ts`
- `packages/opencode/src/bus/global.ts`

### 3.3 错误处理链路

1. Route/Domain 抛出 `NamedError` 或其它异常。
2. `onError` 捕获并映射 status code。
3. 返回标准 JSON 错误对象。

Evidence:

- `packages/opencode/src/server/server.ts` (`.onError(...)`)
- `packages/opencode/src/server/error.ts`

## 4. 状态管理与持久化 / State and Persistence

- Session/Message/Todo 等状态由 `session` 与 `storage` 目录协作维护。
- Project 和 instance 相关状态由 `project` 模块聚合。
- 全局事件转发由 `Bus` -> `GlobalBus` 完成。

Evidence:

- `packages/opencode/src/session/*`
- `packages/opencode/src/storage/*`
- `packages/opencode/src/project/*`
- `packages/opencode/src/bus/index.ts`

## 5. 差距清单模板 / Gap List Template

```md
## [Gap-ID]
- 现状 / Current:
- 预期 / Expected:
- 影响 / Impact:
- 建议 / Recommendation:
- 优先级 / Priority: High | Medium | Low
- 证据 / Evidence:
```

## 6. 关联文档 / Related Documents

- 架构层：[`02-system-design.md`](./02-system-design.md)
- REST 接口：[`../api/01-rest-reference.md`](../api/01-rest-reference.md)
- SSE 接口：[`../api/02-sse-reference.md`](../api/02-sse-reference.md)
