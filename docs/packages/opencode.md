> [!NOTE]
> 历史文档保留：本页为旧平铺路径，内容保留不删除。
> 新版分组路径请优先参考：[opencode.md](./core/opencode.md)

# opencode package 架构 / `packages/opencode`

## Role
`opencode` 是核心运行时（runtime core），提供 CLI、Server、Session、Provider、Tool、MCP、Plugin 编排能力。

## Boundary
- In scope: 命令入口、服务路由、会话执行、事件总线、工具执行。
- Out of scope: 纯 UI 组件（`@opencode-ai/ui`）、网站内容（`packages/web`）。

## Entrypoints
- CLI 入口：`packages/opencode/src/index.ts`
- Server 入口：`packages/opencode/src/server/server.ts`
- Plugin 装载：`packages/opencode/src/plugin/index.ts`

## External Surface
- CLI：`opencode` 二进制（`packages/opencode/bin/opencode`）
- REST/SSE/WebSocket：`packages/opencode/src/server/routes/*`

## Dependencies
- 直接依赖：`@opencode-ai/sdk`、`@opencode-ai/plugin`、`@opencode-ai/util`
- 核心第三方：`hono`、`ai`、`@modelcontextprotocol/sdk`

## Data Flow
1. User 输入 -> CLI Command -> Session/Server -> Provider/Tool -> 事件回流（SSE/TUI）。
2. HTTP 请求 -> `Server.App` -> `Instance.provide` -> Route Handler -> Domain -> Bus。

## Error & Observability
- 日志域：`packages/opencode/src/util/log.ts`
- 错误模型：`packages/opencode/src/server/error.ts` + `@opencode-ai/util/error`

## Relations
- 上游：Desktop/App/Slack/Plugin consumers。
- 下游：`ui`、`util`、`sdk`（通过 workspace dependency 协作）。

## Evidence
1. `packages/opencode/src/index.ts`
2. `packages/opencode/src/server/server.ts`
3. `packages/opencode/src/server/routes/session.ts`
4. `packages/opencode/src/session/prompt.ts`
5. `packages/opencode/src/plugin/index.ts`
6. `packages/opencode/src/bus/index.ts`

## Limitations & Evolution
- 文档与代码演进快，建议以 `server/routes` 与 `session/*` 为事实来源定期回归。
