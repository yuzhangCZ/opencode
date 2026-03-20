# Plugin 契约 / Plugin Contract

本文档覆盖 `packages/plugin/src/index.ts` 与 `packages/plugin/src/tool.ts` 当前公开的插件契约。

## 1. `PluginInput`

### What it does

`PluginInput` 是 runtime 注入给插件初始化函数的上下文。

### Input fields

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `client` | `ReturnType<typeof createOpencodeClient>` | 当前插件直接可用的 server client |
| `project` | `Project` | 当前项目信息 |
| `directory` | `string` | 当前目录 |
| `worktree` | `string` | 当前 worktree 根目录 |
| `serverUrl` | `URL` | server 基础地址 |
| `$` | `BunShell` | shell helper |

### Example

```ts
const plugin: Plugin = async (input) => {
  console.log(input.directory)
  console.log(input.worktree)
  console.log(input.serverUrl.href)
  return {}
}
```

### Pitfalls

- `client` 当前是默认 SDK 面，不是 v2。
- 路径计算优先使用 `directory` / `worktree`，不要假设 `process.cwd()` 一定等于项目目录。

## 2. `Plugin`

### What it does

插件实现是一个异步工厂函数，返回一组 hooks。

### Trigger / Timing

- runtime 加载插件时执行一次
- 其返回值会被缓存并在后续流程中触发

### Example

```ts
const plugin: Plugin = async (input) => {
  await input.client.config.get()
  return {}
}
```

### Pitfalls

- 初始化阶段抛错会导致插件加载失败。
- 初始化里做重型长耗时操作会拖慢整个插件装载。

## 3. `ProviderContext`

### What it does

`chat.params` / `chat.headers` hook 会拿到 provider 上下文。

### Input fields

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `source` | `"env" \| "config" \| "custom" \| "api"` | provider 配置来源 |
| `info` | `Provider` | provider 信息 |
| `options` | `Record<string, any>` | provider 选项 |

## 4. `AuthHook`

### What it does

定义 provider 认证扩展能力。

### Input fields

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `provider` | `string` | provider ID |
| `loader` | `(auth, provider) => Promise<Record<string, any>>` | 可选，读取已有 auth |
| `methods` | `oauth` / `api` 方法数组 | UI 可见的认证方式 |

### Example

```ts
const auth: AuthHook = {
  provider: "demo",
  methods: [
    {
      type: "api",
      label: "API Key",
      async authorize() {
        return { type: "success", key: "demo-key" }
      },
    },
  ],
}
```

## 5. `Hooks`

## 5.1 生命周期与配置

### `event`

#### What it does

接收 runtime 总线分发的事件。

#### Trigger / Timing

- 任意 bus 事件发布后触发

#### Input fields

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `event` | `Event` | 事件联合类型 |

#### Mutable output

无。

#### Example

```ts
event: async ({ event }) => {
  if (event.type === "session.created") {
    console.log(event.properties.info.id)
  }
}
```

#### Pitfalls

- 这是消费事件的 hook，不会替代 server 原有事件处理逻辑。

### `config`

#### What it does

插件初始化后接收当前配置快照。

#### Trigger / Timing

- runtime `Plugin.init()` 时调用一次

#### Input fields

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `input` | `Config` | 当前配置对象 |

#### Mutable output

无。

#### Example

```ts
config: async (cfg) => {
  console.log(cfg.provider)
}
```

#### Pitfalls

- 这里拿到的是配置快照，不是配置 patch 钩子。

## 5.2 聊天拦截

### `chat.message`

#### What it does

在新用户消息进入 chat 链路时执行。

#### Input fields

| 字段 | 说明 |
| --- | --- |
| `sessionID` | 会话 ID |
| `agent` | agent 名称，可选 |
| `model` | `{ providerID, modelID }`，可选 |
| `messageID` | 消息 ID，可选 |
| `variant` | 变体，可选 |

#### Mutable output

| 字段 | 说明 |
| --- | --- |
| `message` | 用户消息对象 |
| `parts` | 可修改的消息 parts |

#### Example

```ts
"chat.message": async (_input, output) => {
  output.parts.push({
    type: "text",
    text: "Keep the response concise.",
  } as any)
}
```

#### Pitfalls

- 对 `parts` 的修改会直接进入后续 prompt 链路。

### `chat.params`

#### What it does

修改发给 LLM 的采样参数和 provider options。

#### Input fields

| 字段 | 说明 |
| --- | --- |
| `sessionID` | 会话 ID |
| `agent` | agent 名称 |
| `model` | 当前模型 |
| `provider` | provider 上下文 |
| `message` | 当前用户消息 |

#### Mutable output

| 字段 | 说明 |
| --- | --- |
| `temperature` | 采样温度 |
| `topP` | top-p |
| `topK` | top-k |
| `options` | provider 自定义选项 |

#### Example

```ts
"chat.params": async (_input, output) => {
  output.temperature = 0.2
  output.options.reasoning = "low"
}
```

#### Pitfalls

- 这里改的是模型调用参数，不是最终返回给用户的消息文本。

### `chat.headers`

#### What it does

追加或改写 provider 请求 headers。

#### Input fields

与 `chat.params` 相同。

#### Mutable output

| 字段 | 说明 |
| --- | --- |
| `headers` | 发送给 provider 的 header 对象 |

#### Example

```ts
"chat.headers": async (_input, output) => {
  output.headers["x-plugin-id"] = "demo"
}
```

#### Pitfalls

- header 冲突会直接影响 provider 请求。

## 5.3 工具扩展

### `tool`

#### What it does

注册自定义工具字典。

#### Example

```ts
tool: {
  echo: tool({
    description: "Echo text",
    args: { text: tool.schema.string() },
    async execute(args) {
      return args.text
    },
  }),
}
```

#### Pitfalls

- 这里定义的是“提供给模型调用的工具”，不是插件内部普通函数。

### `tool.definition`

#### What it does

修改发给模型的工具定义，而不是修改工具执行结果。

#### Input fields

| 字段 | 说明 |
| --- | --- |
| `toolID` | 工具 ID |

#### Mutable output

| 字段 | 说明 |
| --- | --- |
| `description` | 工具描述 |
| `parameters` | JSON schema 参数定义 |

#### Example

```ts
"tool.definition": async ({ toolID }, output) => {
  if (toolID === "echo") {
    output.description = "Echo text back to the user"
  }
}
```

#### Pitfalls

- 它只影响模型看到的工具契约，不会改动实际执行逻辑。

### `tool.execute.before`

#### What it does

在工具实际执行前拦截参数。

#### Input fields

| 字段 | 说明 |
| --- | --- |
| `tool` | 工具名 |
| `sessionID` | 会话 ID |
| `callID` | 调用 ID |

#### Mutable output

| 字段 | 说明 |
| --- | --- |
| `args` | 将传给执行器的参数对象 |

#### Example

```ts
"tool.execute.before": async ({ tool }, output) => {
  if (tool === "echo" && typeof output.args.text === "string") {
    output.args.text = output.args.text.trim()
  }
}
```

#### Pitfalls

- 修改后的 `args` 仍应满足工具 schema。

### `tool.execute.after`

#### What it does

在工具执行后改写展示结果。

#### Input fields

| 字段 | 说明 |
| --- | --- |
| `tool` | 工具名 |
| `sessionID` | 会话 ID |
| `callID` | 调用 ID |
| `args` | 本次执行参数 |

#### Mutable output

| 字段 | 说明 |
| --- | --- |
| `title` | 展示标题 |
| `output` | 展示文本 |
| `metadata` | 结构化元数据 |

#### Example

```ts
"tool.execute.after": async ({ tool }, output) => {
  if (tool === "echo") {
    output.title = "Echo result"
  }
}
```

#### Pitfalls

- 这里改的是展示层结果，不会撤销工具副作用。

## 5.4 权限与命令

### `permission.ask`

#### What it does

在权限请求落地前决定 `ask` / `deny` / `allow`。

#### Input fields

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `input` | `Permission` | 当前权限请求对象 |

#### Mutable output

| 字段 | 说明 |
| --- | --- |
| `status` | `"ask" \| "deny" \| "allow"` |

#### Example

```ts
"permission.ask": async (input, output) => {
  if (input.kind === "edit") {
    output.status = "allow"
  }
}
```

#### Pitfalls

- 直接 `allow` 会绕过用户确认，应只用于明确可接受的规则。

### `command.execute.before`

#### What it does

在 command 执行前注入 parts。

#### Input fields

| 字段 | 说明 |
| --- | --- |
| `command` | 命令名 |
| `sessionID` | 会话 ID |
| `arguments` | 命令参数字符串 |

#### Mutable output

| 字段 | 说明 |
| --- | --- |
| `parts` | 附加到命令上下文的 parts |

#### Example

```ts
"command.execute.before": async (_input, output) => {
  output.parts.push({ type: "text", text: "Command invoked by plugin" } as any)
}
```

#### Pitfalls

- 注入的 `parts` 会影响命令执行上下文，应保持简短且可解释。

## 5.5 Shell

### `shell.env`

#### What it does

在 shell 执行前注入环境变量。

#### Input fields

| 字段 | 说明 |
| --- | --- |
| `cwd` | 当前工作目录 |
| `sessionID` | 会话 ID，可选 |
| `callID` | 调用 ID，可选 |

#### Mutable output

| 字段 | 说明 |
| --- | --- |
| `env` | 将追加到 shell 的环境变量 |

#### Example

```ts
"shell.env": async (_input, output) => {
  output.env.PLUGIN_MODE = "demo"
}
```

#### Pitfalls

- 环境变量是追加而不是隔离执行，命名冲突会影响子进程行为。

## 5.6 `auth`

### What it does

注册 provider 认证能力。

### Mutable output

无。直接在返回对象中声明 `AuthHook`。

### Example

```ts
auth: {
  provider: "demo",
  methods: [
    {
      type: "api",
      label: "API Key",
      async authorize() {
        return { type: "success", key: "demo-key" }
      },
    },
  ],
}
```

### Pitfalls

- `auth` 适合扩展 provider 认证，不适合承载普通配置输入。

## 5.7 Experimental Hooks

#### What it does

在 shell 执行前注入环境变量。

## 5.6 Experimental Hooks

- `experimental.chat.messages.transform`
- `experimental.chat.system.transform`
- `experimental.session.compacting`
- `experimental.text.complete`

这些 hook 的共同点：

1. 都会影响 prompt 或补全链路。
2. 不是稳定对外契约。
3. 适合受控插件，不适合假设长期兼容。

## 6. Evidence

1. `packages/plugin/src/index.ts`
2. `packages/plugin/src/tool.ts`
3. `packages/opencode/src/plugin/index.ts`
