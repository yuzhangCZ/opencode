# Tool API

本文档只讲 `tool()`、`tool.schema` 与 `ToolContext`。

## 1. `tool()`

### What it does

`tool()` 用来定义插件自定义工具。

### Input fields

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `description` | `string` | 给模型看的工具描述 |
| `args` | `z.ZodRawShape` | 参数 schema |
| `execute` | `(args, context) => Promise<string>` | 执行函数 |

### Example

```ts
import { tool } from "@opencode-ai/plugin/tool"

const echo = tool({
  description: "Echo text",
  args: {
    text: tool.schema.string().describe("text to echo"),
  },
  async execute(args) {
    return args.text
  },
})
```

### Pitfalls

- `execute` 必须返回 `Promise<string>`。
- `args` 的校验依赖 `zod` schema，描述不清会直接影响模型调用质量。

## 2. `tool.schema`

### What it does

`tool.schema` 直接暴露 `zod`，用于声明参数 schema。

### Example

```ts
args: {
  path: tool.schema.string().describe("absolute file path"),
  recursive: tool.schema.boolean().optional(),
}
```

## 3. `ToolContext`

## 3.1 基础字段

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `sessionID` | `string` | 当前会话 ID |
| `messageID` | `string` | 当前消息 ID |
| `agent` | `string` | 当前 agent |
| `directory` | `string` | 当前项目目录 |
| `worktree` | `string` | 当前 worktree 根目录 |
| `abort` | `AbortSignal` | 取消信号 |

### Example

```ts
async execute(args, ctx) {
  if (ctx.abort.aborted) return "aborted"
  return `${ctx.sessionID}:${args.text}`
}
```

## 3.2 `metadata()`

### What it does

为当前工具调用追加展示 metadata。

### Input fields

| 字段 | 说明 |
| --- | --- |
| `title` | 可选，UI 标题 |
| `metadata` | 可选，结构化元数据对象 |

### Example

```ts
async execute(args, ctx) {
  ctx.metadata({
    title: "Scanning files",
    metadata: { query: args.text },
  })
  return "done"
}
```

## 3.3 `ask()`

### What it does

向 runtime 发起权限申请。

### Input fields

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `permission` | `string` | 权限类别 |
| `patterns` | `string[]` | 受影响模式 |
| `always` | `string[]` | 可持久授权模式 |
| `metadata` | `Record<string, any>` | 额外上下文 |

### Example

```ts
async execute(args, ctx) {
  await ctx.ask({
    permission: "file.write",
    patterns: [args.path],
    always: [args.path],
    metadata: { reason: "write output file" },
  })
  return "approved"
}
```

## 4. 完整示例

```ts
import { tool } from "@opencode-ai/plugin/tool"

export const writeNote = tool({
  description: "Create a short note file in the project directory",
  args: {
    name: tool.schema.string().describe("file name"),
    body: tool.schema.string().describe("file content"),
  },
  async execute(args, ctx) {
    await ctx.ask({
      permission: "file.write",
      patterns: [`${ctx.directory}/${args.name}`],
      always: [`${ctx.directory}/${args.name}`],
      metadata: { source: "plugin-sdk-doc" },
    })

    ctx.metadata({
      title: "Preparing note",
      metadata: { file: args.name, cwd: ctx.directory },
    })

    return `Would write ${args.name} in ${ctx.directory}`
  },
})
```

## 5. 常见误用

### 误用 1：把 `metadata()` 当返回值

`metadata()` 只补充展示信息，工具最终仍然要返回字符串。

### 误用 2：忽略 `abort`

长任务若不检查 `abort.aborted`，插件在取消时可能继续做无意义工作。

### 误用 3：依赖 `process.cwd()`

工具运行环境不应假设当前工作目录稳定，优先使用 `ctx.directory` / `ctx.worktree`。

## 6. Evidence

1. `packages/plugin/src/tool.ts`
2. `packages/plugin/src/example.ts`
3. `packages/opencode/src/tool/batch.ts`
