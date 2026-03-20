# OpenCode Plugin SDK 参考 / Plugin SDK Reference

- Contract Baseline: `dev`
- Last Verified: `2026-03-19`
- Runtime Focus: `packages/opencode/src/plugin/index.ts` 当前注入的 `@opencode-ai/sdk` 默认 client（v1）
- Version Note: `@opencode-ai/sdk/v2` 已在仓库其他模块使用，但当前插件 runtime 默认并未注入 v2 client

## 1. 这组文档解决什么问题

本组文档面向插件作者，回答四个问题：

1. 插件 runtime 当前到底注入了哪些能力。
2. `@opencode-ai/plugin` 的 hooks / tool 契约怎么用。
3. 插件内 `client` 能直接调用哪些 server API。
4. SDK 方法和 OpenCode server route / `operationId` 的对应关系是什么。

## 2. 适用对象与范围

适用对象：

- 在 `.opencode/plugin/*.ts` 或独立 npm plugin 中编写 OpenCode 插件的开发者
- 需要同时使用 hooks、tool 和 server API 的插件作者

本文档范围：

- `@opencode-ai/plugin` 公开契约
- 插件 runtime 当前注入的 `PluginInput`
- 插件内 `client` 当前直接可见的 API 范围
- 与 server route / `operationId` 的映射关系

本文档不覆盖：

- 插件装载实现细节
- 非插件场景下的完整 SDK 用法
- 推测中的未来 API

## 3. 能力边界 / Compatibility Notes

> [!IMPORTANT]
> 当前插件 runtime 注入的是 `@opencode-ai/sdk` 默认 client，不是 `@opencode-ai/sdk/v2`。

这意味着：

1. 插件里可以直接拿到 `PluginInput.client`，但它的接口形态以 v1 generated client 为准。
2. 仓库里很多 TUI / ACP 代码已经在用 `@opencode-ai/sdk/v2`，这些示例不能直接照搬到插件。
3. `event` hook 是 runtime 直接推送的事件入口，可靠性基线高于 `client.event.subscribe()`。
4. `tui.*` 和 `experimental.*` 在插件里可以看见部分能力，但不适合作为通用插件主路径。
5. v2 中新增的 `permission` / `question` 分组和更友好的参数形态，不等于当前插件注入 client 默认具备这些分组。

## 4. 3 分钟快速开始

### 最小插件示例

```ts
import type { Plugin } from "@opencode-ai/plugin"
import { tool } from "@opencode-ai/plugin/tool"

const demo: Plugin = async (input) => {
  return {
    event: async ({ event }) => {
      if (event.type === "session.created") {
        console.log("new session", event.properties.info.id)
      }
    },
    tool: {
      echo: tool({
        description: "Return the input text as-is",
        args: {
          text: tool.schema.string().describe("text to echo"),
        },
        async execute(args) {
          return args.text
        },
      }),
    },
  }
}

export default demo
```

### 一次最常用 `client.session.*` 调用

```ts
const ses = await input.client.session.create({
  body: { title: "plugin demo" },
})

await input.client.session.prompt({
  path: { id: ses.data.id },
  body: {
    parts: [{ type: "text", text: "Summarize this repository." }],
  },
})
```

## 5. 常见任务入口

1. 定义新工具：见 [03-tool-api.md](./plugin-sdk/03-tool-api.md)
2. 修改对话参数或 header：见 [02-plugin-contract.md](./plugin-sdk/02-plugin-contract.md)
3. 监听运行时事件：见 [08-events-and-compat.md](./plugin-sdk/08-events-and-compat.md)
4. 调用 session / file / provider API：见 [05-session-and-message.md](./plugin-sdk/05-session-and-message.md)、[06-file-project-config.md](./plugin-sdk/06-file-project-config.md)、[07-provider-auth-and-mcp.md](./plugin-sdk/07-provider-auth-and-mcp.md)
5. 快速查 route 映射：见 [09-server-mapping.md](./plugin-sdk/09-server-mapping.md)

## 6. 文档导航

1. [总目录](./plugin-sdk/00-catalog.md)
2. [快速开始](./plugin-sdk/01-quickstart.md)
3. [插件契约](./plugin-sdk/02-plugin-contract.md)
4. [Tool API](./plugin-sdk/03-tool-api.md)
5. [SDK 总览](./plugin-sdk/04-sdk-overview.md)
6. [Session 与 Message](./plugin-sdk/05-session-and-message.md)
7. [File / Project / Config](./plugin-sdk/06-file-project-config.md)
8. [Provider / Auth / MCP](./plugin-sdk/07-provider-auth-and-mcp.md)
9. [事件与兼容性](./plugin-sdk/08-events-and-compat.md)
10. [Server 映射索引](./plugin-sdk/09-server-mapping.md)

## 7. 相关 API 文档

- REST 接口参考：[01-rest-reference.md](./01-rest-reference.md)
- SSE 事件参考：[02-sse-reference.md](./02-sse-reference.md)

## 8. Evidence

1. `packages/opencode/src/plugin/index.ts`
2. `packages/plugin/src/index.ts`
3. `packages/plugin/src/tool.ts`
4. `packages/sdk/js/src/client.ts`
5. `packages/sdk/js/src/gen/sdk.gen.ts`
6. `packages/sdk/js/src/gen/types.gen.ts`
7. `packages/sdk/js/src/v2/gen/sdk.gen.ts`
