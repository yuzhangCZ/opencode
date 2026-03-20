# Plugin 内 SDK 总览

## 1. `client` 从哪里来

插件 runtime 在 `packages/opencode/src/plugin/index.ts` 中调用：

```ts
const client = createOpencodeClient({
  baseUrl: "http://localhost:4096",
  directory: Instance.directory,
  fetch: async (...args) => Server.App().fetch(...args),
})
```

所以插件内 `input.client` 具备两层默认上下文：

1. 已绑定当前 server `baseUrl`
2. 已通过 `x-opencode-directory` 注入当前目录上下文

## 2. 当前默认可直接见到的 client 分组

`@opencode-ai/sdk` 默认 v1 client 当前包含：

| 分组 | 当前默认可见 |
| --- | --- |
| `global` | 是 |
| `project` | 是 |
| `pty` | 是 |
| `config` | 是 |
| `tool` | 是 |
| `instance` | 是 |
| `path` | 是 |
| `vcs` | 是 |
| `session` | 是 |
| `command` | 是 |
| `provider` | 是 |
| `find` | 是 |
| `file` | 是 |
| `app` | 是 |
| `mcp` | 是 |
| `auth` | 是 |
| `event` | 是 |
| `tui` | 是 |
| `permission` | 否，v1 默认 client 无该分组 |
| `question` | 否，v1 默认 client 无该分组 |
| `experimental` | 否，v1 默认 client 无该分组 |

## 3. 推荐使用 vs 谨慎使用

### 推荐使用

- `session.*`
- `find.*`
- `file.*`
- `project.list` / `project.current`
- `config.*`
- `provider.*`
- `mcp.*`
- `auth.set`

### 谨慎使用

- `tool.*`
  - 路径在 v1 中属于 `/experimental/tool*`
- `tui.*`
  - 主要服务 TUI 控制面，不适合普通插件主流程
- `event.subscribe()`
  - 可用，但应作为增强事件通道

## 4. 参数形态：v1 vs v2

### v1 当前主线

v1 使用 generated client 的 `path` / `query` / `body` 包装形式：

```ts
await client.session.get({
  path: { id: "ses_xxx" },
})
```

### v2 推荐阅读方式

v2 更偏扁平参数：

```ts
await client.session.get({
  sessionID: "ses_xxx",
})
```

## 5. 能力边界 / Compatibility Notes

> [!IMPORTANT]
> 当前插件文档正文只写 v1 默认可直接使用的形态。

必须明确的边界：

1. v2 的 `permission.reply()`、`question.reply()` 等分组，不等于当前插件直接注入可见。
2. `project.update` 路由已经存在，但 v1 默认 client 没有同名分组方法。
3. `workspace` / `worktree` / `experimental.resource` 等能力在 v2 中更完整，当前插件默认不应假设存在。
4. `event` hook 与 `client.event.subscribe()` 不在同一层，二者都应视为不同接口。

## 6. 示例来源规则

本组 plugin-sdk 文档中的字段、方法和示例遵循以下规则：

1. 插件契约字段以 `packages/plugin/src/index.ts`、`packages/plugin/src/tool.ts` 为准。
2. v1 SDK 方法与字段以 `packages/sdk/js/src/gen/sdk.gen.ts`、`packages/sdk/js/src/gen/types.gen.ts` 为准。
3. v2 差异以 `packages/sdk/js/src/v2/gen/sdk.gen.ts`、`packages/sdk/js/src/v2/gen/types.gen.ts` 为准。
4. route 与 `operationId` 以 `packages/opencode/src/server/routes/*.ts` 为准。
5. JSON 示例只裁剪真实字段，不补不存在的想象字段。

## 7. 下一步

1. 要看 `session.*`：去 [05-session-and-message.md](./05-session-and-message.md)
2. 要看 `file.*` / `provider.*`：去 [06-file-project-config.md](./06-file-project-config.md) 和 [07-provider-auth-and-mcp.md](./07-provider-auth-and-mcp.md)
3. 要看事件差异：去 [08-events-and-compat.md](./08-events-and-compat.md)
