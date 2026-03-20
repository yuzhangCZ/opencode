# OpenCode Server REST 参考

- Contract Baseline: `dev`
- Last Verified: `2026-03-19`
- Source of Truth:
  - `packages/opencode/src/server/server.ts`
  - `packages/opencode/src/server/routes/*.ts`
  - `packages/sdk/openapi.json`

相关文档：

- [02-sse-reference.md](./02-sse-reference.md)
- [03-plugin-sdk-reference.md](./03-plugin-sdk-reference.md)

## 1. 文档范围

本文档现在是 REST 入口页，不再把全部接口堆在一个文件中。

- 目标读者：第一次接入 `opencode server` 的调用方、需要查接口的 SDK/自动化脚本作者、需要核对实际 API 范围的维护者。
- 覆盖范围：当前服务实际注册的 JSON HTTP 接口。
- 不在正文展开的端点：
  - `GET /event`
  - `GET /global/event`
  - `GET /pty/{ptyID}/connect`

流式接口请转到 [02-sse-reference.md](./02-sse-reference.md) 和下文附录说明。

## 2. 通用约定

### Base URL

默认地址：

```text
http://localhost:4096
```

### Auth

当服务设置了以下环境变量时，请使用 Basic Auth：

- `OPENCODE_SERVER_USERNAME`
- `OPENCODE_SERVER_PASSWORD`

示例：

```bash
curl -u opencode:secret http://localhost:4096/global/health
```

### 上下文选择

大多数实例级接口都受“当前目录 / 当前 workspace”影响。服务端会按以下优先级解析上下文：

1. Query: `?workspace=...`
2. Header: `x-opencode-workspace`
3. Query: `?directory=...`
4. Header: `x-opencode-directory`
5. 进程当前工作目录 `process.cwd()`

推荐做法：

- 调试单仓库时优先传 `directory`
- 使用控制面 workspace 时优先传 `workspace`
- 对脚本调用保持每次请求都显式带上下文，避免依赖服务进程启动目录

示例：

```bash
curl -s 'http://localhost:4096/session?directory=%2Fabs%2Frepo'
curl -s -H 'x-opencode-directory: /abs/repo' http://localhost:4096/config
```

### Content-Type

- 普通 REST 接口：`application/json`
- SSE：`text/event-stream`
- PTY 交互：WebSocket

### 通用错误报文

服务端使用 `NamedError` / `HTTPException` 返回错误。最常见的验证错误结构如下：

```json
{
  "data": {},
  "errors": [
    {
      "path": ["field"],
      "message": "Invalid input"
    }
  ],
  "success": false
}
```

常见状态码：

- `400`: 参数或请求体非法
- `404`: 资源不存在
- `500`: 服务内部错误

## 3. 稳定性标记

- `Stable`: 常规 JSON HTTP 接口，适合作为公开接入面
- `Experimental`: `/experimental/*`，行为和字段仍可能调整
- `Internal`: `/tui/*` 等偏内部控制面接口，不建议当作长期稳定契约
- `Streaming`: SSE / WebSocket，仅在附录说明，不并入 REST 详情页

## 4. REST 分类目录

1. [REST 接口总目录](./rest/00-endpoint-catalog.md)
2. [Global / App 元信息接口](./rest/01-global-app-apis.md)
3. [Project / Config / Provider 接口](./rest/02-project-config-provider-apis.md)
4. [Session 接口](./rest/03-session-apis.md)
5. [Session 数据模型](./rest/03-session-models.md)
6. [Session 数据模型字段参考](./rest/04-session-model-reference.md)
7. [Permission / Question 接口](./rest/04-permission-question-apis.md)
8. [File / LSP / Formatter 接口](./rest/05-file-lsp-formatter-apis.md)
9. [MCP / PTY 接口](./rest/06-mcp-pty-apis.md)
10. [Experimental / TUI 接口](./rest/07-experimental-tui-apis.md)

## 5. 如何查阅

- 想先知道服务到底暴露了哪些 JSON 端点：看 [00-endpoint-catalog.md](./rest/00-endpoint-catalog.md)
- 想按能力域找接口：直接进入 `rest/` 下的分类文档
- 想调 Session 接口：看 [03-session-apis.md](./rest/03-session-apis.md)
- 想快速理解 Session 返回结构：看 [03-session-models.md](./rest/03-session-models.md)
- 想查 Session 字段和实例：看 [04-session-model-reference.md](./rest/04-session-model-reference.md)
- 想看事件流：看 [02-sse-reference.md](./02-sse-reference.md)
- 想看运行时是否真的注册了这些接口：对照 `packages/sdk/openapi.json`

## 6. 流式接口附录

以下端点属于流式协议，不放在 REST 分类文档里展开字段表：

### `GET /event`

- Protocol: SSE
- 用途：订阅当前实例的总线事件
- 参考： [02-sse-reference.md](./02-sse-reference.md)

### `GET /global/event`

- Protocol: SSE
- 用途：订阅全局事件，事件外层会带 `directory`
- 参考： [02-sse-reference.md](./02-sse-reference.md)

### `GET /pty/{ptyID}/connect`

- Protocol: WebSocket
- 用途：连接 PTY 会话进行实时输入输出
- 备注：可带 `cursor` query 参数以补拉历史输出

## 7. 维护规则

- 变更 `packages/opencode/src/server/routes/*.ts` 后，应同步检查对应分类文档
- 新增 JSON HTTP path 时，至少更新：
  - [00-endpoint-catalog.md](./rest/00-endpoint-catalog.md)
  - 对应分类子文档
- 新增 SSE 事件时，更新 [02-sse-reference.md](./02-sse-reference.md) 和 `docs/api/sse/`
