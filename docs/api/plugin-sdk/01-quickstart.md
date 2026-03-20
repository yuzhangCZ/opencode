# Plugin SDK 快速开始

## 1. 你会拿到什么

插件初始化时，runtime 会调用：

```ts
type Plugin = (input: PluginInput) => Promise<Hooks>
```

`PluginInput` 里最重要的字段：

| 字段 | 类型 | 用途 |
| --- | --- | --- |
| `client` | `createOpencodeClient()` 返回值 | 调用 OpenCode server API |
| `project` | `Project` | 当前项目信息 |
| `directory` | `string` | 当前项目目录 |
| `worktree` | `string` | 当前 worktree 根目录 |
| `serverUrl` | `URL` | 当前 server 地址 |
| `$` | `BunShell` | 执行 shell |

## 2. 最小文件结构

假设你在 `.opencode/plugin/demo.ts` 中编写插件：

```ts
import type { Plugin } from "@opencode-ai/plugin"
import { tool } from "@opencode-ai/plugin/tool"

const demo: Plugin = async (input) => {
  return {
    event: async ({ event }) => {
      if (event.type === "server.connected") {
        console.log("connected to", input.serverUrl.href)
      }
    },
    tool: {
      echo: tool({
        description: "Echo back text",
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

## 3. 最常用的 `client.session.*` 调用

```ts
import type { Plugin } from "@opencode-ai/plugin"

const demo: Plugin = async (input) => {
  const ses = await input.client.session.create({
    body: { title: "plugin-sdk quickstart" },
  })

  await input.client.session.prompt({
    path: { id: ses.data.id },
    body: {
      parts: [{ type: "text", text: "Summarize the current project." }],
    },
  })

  return {}
}

export default demo
```

## 4. 最小事件监听示例

```ts
import type { Plugin } from "@opencode-ai/plugin"

const demo: Plugin = async () => {
  return {
    event: async ({ event }) => {
      if (event.type === "message.updated") {
        console.log("message updated", event.properties.info.id)
      }
    },
  }
}

export default demo
```

这里的 `event` hook 由 runtime 直接分发，通常比插件内自建 SSE 订阅更适合作为基础事件通道。

## 5. 常见坑

### 坑 1：把 v2 示例直接复制到插件里

插件当前默认拿到的是 v1 client。下面这种 v2 写法在当前插件 runtime 里不能直接假设成立：

```ts
client.session.get({ sessionID: "ses_xxx" })
```

当前插件默认应该写成：

```ts
client.session.get({ path: { id: "ses_xxx" } })
```

### 坑 2：只依赖 `client.event.subscribe()`

插件里更稳妥的做法是：

1. 用 `event` hook 做基线事件监听
2. 把 `client.event.subscribe()` 当增强观测通道

## 6. 下一步

1. 想看 hooks 全量说明：去 [02-plugin-contract.md](./02-plugin-contract.md)
2. 想写自定义工具：去 [03-tool-api.md](./03-tool-api.md)
3. 想查 `session.*` / `file.*` / `provider.*`：去 [04-sdk-overview.md](./04-sdk-overview.md)
