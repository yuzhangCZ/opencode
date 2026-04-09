# Session 与 Message API

本文档按插件最常见的会话链路组织 v1 默认 client 能力。类型说明只以 `packages/sdk/js/src/gen/types.gen.ts` 为准；如果 REST 文档和本页冲突，以本页为准。

## 1. `session.create`

### What it does

创建新会话。

### Server mapping

- SDK method: `client.session.create`
- `operationId`: `session.create`
- HTTP: `POST /session`

### Parameters

| 字段              | 类型     | 位置  | 必填 | 说明                               |
| ----------------- | -------- | ----- | ---- | ---------------------------------- |
| `body.parentID`   | `string` | body  | 否   | 父 session ID，用于从已有会话分叉  |
| `body.title`      | `string` | body  | 否   | 会话标题                           |
| `query.directory` | `string` | query | 否   | 目录上下文；runtime 通常会自动注入 |

### Returns

返回 `Session`：

| 字段        | 类型             | 必填 | 说明           |
| ----------- | ---------------- | ---- | -------------- |
| `id`        | `string`         | 是   | session 主键   |
| `projectID` | `string`         | 是   | 所属项目 ID    |
| `directory` | `string`         | 是   | 当前目录上下文 |
| `parentID`  | `string`         | 否   | 父 session ID  |
| `summary`   | `SessionSummary` | 否   | 变更摘要       |
| `share`     | `SessionShare`   | 否   | 分享信息       |
| `title`     | `string`         | 是   | 会话标题       |
| `version`   | `string`         | 是   | 会话版本       |
| `time`      | `SessionTime`    | 是   | 时间字段       |
| `revert`    | `SessionRevert`  | 否   | 当前回滚锚点   |

### Complex types

`SessionSummary`

| 字段        | 类型         | 必填 | 说明                   |
| ----------- | ------------ | ---- | ---------------------- |
| `additions` | `number`     | 是   | 新增行数               |
| `deletions` | `number`     | 是   | 删除行数               |
| `files`     | `number`     | 是   | 变更文件数             |
| `diffs`     | `FileDiff[]` | 否   | 按文件拆分的 diff 摘要 |

`FileDiff`

| 字段        | 类型     | 必填 | 说明           |
| ----------- | -------- | ---- | -------------- |
| `file`      | `string` | 是   | 文件路径       |
| `before`    | `string` | 是   | 变更前快照标识 |
| `after`     | `string` | 是   | 变更后快照标识 |
| `additions` | `number` | 是   | 新增行数       |
| `deletions` | `number` | 是   | 删除行数       |

`SessionShare`

| 字段  | 类型     | 必填 | 说明     |
| ----- | -------- | ---- | -------- |
| `url` | `string` | 是   | 分享地址 |

`SessionTime`

| 字段         | 类型     | 必填 | 说明                  |
| ------------ | -------- | ---- | --------------------- |
| `created`    | `number` | 是   | 创建时间戳            |
| `updated`    | `number` | 是   | 更新时间戳            |
| `compacting` | `number` | 否   | 正在 compact 的时间戳 |

`SessionRevert`

| 字段        | 类型     | 必填 | 说明               |
| ----------- | -------- | ---- | ------------------ |
| `messageID` | `string` | 是   | 回滚锚点所在消息   |
| `partID`    | `string` | 否   | 回滚锚点所在 part  |
| `snapshot`  | `string` | 否   | 对应 snapshot 标识 |
| `diff`      | `string` | 否   | 对应 diff 标识     |

### Request example

```json
{
  "body": {
    "title": "plugin demo"
  }
}
```

### Response example

```json
{
  "id": "ses_demo",
  "projectID": "proj_demo",
  "directory": "/repo",
  "title": "plugin demo",
  "version": "1",
  "time": {
    "created": 1742371200000,
    "updated": 1742371200000
  }
}
```

### Errors / Pitfalls

- `400 BadRequestError`: body 不合法。

### v2 Differences

v2 改为把主要字段直接展开到一个参数对象中，不再区分 `body` 和 `query`。

## 2. `session.get` / `session.update` / `session.delete`

### `session.get`

#### What it does

获取单个会话详情。

#### Server mapping

- SDK method: `client.session.get`
- `operationId`: `session.get`
- HTTP: `GET /session/{sessionID}`

#### Parameters

| 字段              | 类型     | 位置  | 必填 | 说明       |
| ----------------- | -------- | ----- | ---- | ---------- |
| `path.id`         | `string` | path  | 是   | 会话 ID    |
| `query.directory` | `string` | query | 否   | 目录上下文 |

#### Returns

返回 `Session`。字段结构同 [`session.create`](#1-sessioncreate)。

#### Request example

```json
{
  "path": {
    "id": "ses_demo"
  }
}
```

#### Errors / Pitfalls

- 当前 v1 path key 叫 `id`，不是 `sessionID`。

### `session.update`

#### What it does

更新会话标题。

#### Server mapping

- SDK method: `client.session.update`
- `operationId`: `session.update`
- HTTP: `PATCH /session/{sessionID}`

#### Parameters

| 字段              | 类型     | 位置  | 必填 | 说明       |
| ----------------- | -------- | ----- | ---- | ---------- |
| `path.id`         | `string` | path  | 是   | 会话 ID    |
| `body.title`      | `string` | body  | 否   | 新标题     |
| `query.directory` | `string` | query | 否   | 目录上下文 |

#### Returns

返回更新后的 `Session`。字段结构同 [`session.create`](#1-sessioncreate)。

#### Request example

```json
{
  "path": {
    "id": "ses_demo"
  },
  "body": {
    "title": "new title"
  }
}
```

#### Errors / Pitfalls

- `body` 里当前只有 `title` 一个稳定字段。

### `session.delete`

#### What it does

删除会话。

#### Server mapping

- SDK method: `client.session.delete`
- `operationId`: `session.delete`
- HTTP: `DELETE /session/{sessionID}`

#### Parameters

| 字段              | 类型     | 位置  | 必填 | 说明       |
| ----------------- | -------- | ----- | ---- | ---------- |
| `path.id`         | `string` | path  | 是   | 会话 ID    |
| `query.directory` | `string` | query | 否   | 目录上下文 |

#### Returns

返回 `boolean`：

- `true` 表示删除成功。

#### Errors / Pitfalls

- 如果把 v2 风格直接写进插件，容易请求到字面 `/session/{id}`。
- `404 NotFoundError`: 会话不存在。

## 3. `session.list` / `session.status` / `session.children` / `session.todo` / `session.messages`

### `session.list`

#### What it does

列出当前目录上下文下的会话。

#### Server mapping

- SDK method: `client.session.list`
- `operationId`: `session.list`
- HTTP: `GET /session`

#### Parameters

| 字段              | 类型     | 位置  | 必填 | 说明       |
| ----------------- | -------- | ----- | ---- | ---------- |
| `query.directory` | `string` | query | 否   | 目录上下文 |

#### Returns

返回 `Session[]`。单个元素结构同 [`session.create`](#1-sessioncreate)。

### `session.status`

#### What it does

拉取所有会话的当前运行状态。

#### Server mapping

- SDK method: `client.session.status`
- `operationId`: `session.status`
- HTTP: `GET /session/status`

#### Parameters

| 字段              | 类型     | 位置  | 必填 | 说明       |
| ----------------- | -------- | ----- | ---- | ---------- |
| `query.directory` | `string` | query | 否   | 目录上下文 |

#### Returns

返回 `Record<string, SessionStatus>`，key 通常是 session ID。

`SessionStatus`

| 类型                                        | 字段              | 说明           |
| ------------------------------------------- | ----------------- | -------------- |
| `{ type: "idle" }`                          | `type`            | 当前空闲       |
| `{ type: "busy" }`                          | `type`            | 当前正在执行   |
| `{ type: "retry", attempt, message, next }` | `attempt: number` | 当前重试次数   |
| `{ type: "retry", attempt, message, next }` | `message: string` | 重试原因或提示 |
| `{ type: "retry", attempt, message, next }` | `next: number`    | 下次重试时间戳 |

#### Response example

```json
{
  "ses_demo": {
    "type": "busy"
  },
  "ses_retry": {
    "type": "retry",
    "attempt": 2,
    "message": "provider temporarily unavailable",
    "next": 1742371205000
  }
}
```

### `session.children`

#### What it does

列出某个会话的子会话。

#### Server mapping

- SDK method: `client.session.children`
- `operationId`: `session.children`
- HTTP: `GET /session/{sessionID}/children`

#### Parameters

| 字段              | 类型     | 位置  | 必填 | 说明       |
| ----------------- | -------- | ----- | ---- | ---------- |
| `path.id`         | `string` | path  | 是   | 会话 ID    |
| `query.directory` | `string` | query | 否   | 目录上下文 |

#### Returns

返回 `Session[]`。单个元素结构同 [`session.create`](#1-sessioncreate)。

### `session.todo`

#### What it does

读取会话的 todo 列表。

#### Server mapping

- SDK method: `client.session.todo`
- `operationId`: `session.todo`
- HTTP: `GET /session/{sessionID}/todo`

#### Parameters

| 字段              | 类型     | 位置  | 必填 | 说明       |
| ----------------- | -------- | ----- | ---- | ---------- |
| `path.id`         | `string` | path  | 是   | 会话 ID    |
| `query.directory` | `string` | query | 否   | 目录上下文 |

#### Returns

返回 `Todo[]`。

`Todo`

| 字段       | 类型     | 必填 | 说明                                                              |
| ---------- | -------- | ---- | ----------------------------------------------------------------- |
| `id`       | `string` | 是   | todo 项唯一 ID                                                    |
| `content`  | `string` | 是   | 任务内容                                                          |
| `status`   | `string` | 是   | 当前状态，例如 `pending`、`in_progress`、`completed`、`cancelled` |
| `priority` | `string` | 是   | 优先级，例如 `high`、`medium`、`low`                              |

#### Response example

```json
[
  {
    "id": "todo_1",
    "content": "Inspect failing tests",
    "status": "in_progress",
    "priority": "high"
  }
]
```

### `session.messages`

#### What it does

列出会话内的消息和消息 parts。

#### Server mapping

- SDK method: `client.session.messages`
- `operationId`: `session.messages`
- HTTP: `GET /session/{sessionID}/message`

#### Parameters

| 字段              | 类型     | 位置  | 必填 | 说明               |
| ----------------- | -------- | ----- | ---- | ------------------ |
| `path.id`         | `string` | path  | 是   | 会话 ID            |
| `query.directory` | `string` | query | 否   | 目录上下文         |
| `query.limit`     | `number` | query | 否   | 返回的消息条数上限 |

#### Returns

返回 `MessageWithParts[]`。

`MessageWithParts`

| 字段    | 类型                              | 必填 | 说明                           |
| ------- | --------------------------------- | ---- | ------------------------------ |
| `info`  | `UserMessage \| AssistantMessage` | 是   | 消息头信息                     |
| `parts` | `Part[]`                          | 是   | 消息正文片段，顺序就是展示顺序 |

`UserMessage`

| 字段        | 类型                                                   | 必填 | 说明                         |
| ----------- | ------------------------------------------------------ | ---- | ---------------------------- |
| `id`        | `string`                                               | 是   | 消息 ID                      |
| `sessionID` | `string`                                               | 是   | 所属 session                 |
| `role`      | `"user"`                                               | 是   | 固定为用户消息               |
| `time`      | `{ created: number }`                                  | 是   | 创建时间                     |
| `summary`   | `{ title?: string, body?: string, diffs: FileDiff[] }` | 否   | 对该条输入的摘要和 diff 归纳 |
| `agent`     | `string`                                               | 是   | 输入交给哪个 agent           |
| `model`     | `{ providerID: string, modelID: string }`              | 是   | 指定的 provider 和 model     |
| `system`    | `string`                                               | 否   | 附加 system 指令             |
| `tools`     | `Record<string, boolean>`                              | 否   | 旧版工具开关映射             |

`AssistantMessage`

| 字段         | 类型                                                                                               | 必填 | 说明                    |
| ------------ | -------------------------------------------------------------------------------------------------- | ---- | ----------------------- |
| `id`         | `string`                                                                                           | 是   | 消息 ID                 |
| `sessionID`  | `string`                                                                                           | 是   | 所属 session            |
| `role`       | `"assistant"`                                                                                      | 是   | 固定为助手消息          |
| `time`       | `{ created: number, completed?: number }`                                                          | 是   | 开始生成和完成时间      |
| `error`      | `ProviderAuthError \| UnknownError \| MessageOutputLengthError \| MessageAbortedError \| ApiError` | 否   | 失败或中止原因          |
| `parentID`   | `string`                                                                                           | 是   | 对应 user message 的 ID |
| `modelID`    | `string`                                                                                           | 是   | 实际使用的 model        |
| `providerID` | `string`                                                                                           | 是   | 实际使用的 provider     |
| `mode`       | `string`                                                                                           | 是   | 历史兼容字段            |
| `path`       | `{ cwd: string, root: string }`                                                                    | 是   | 执行时路径上下文        |
| `summary`    | `boolean`                                                                                          | 否   | 是否为 summary 类回复   |
| `cost`       | `number`                                                                                           | 是   | 成本统计                |
| `tokens`     | `AssistantTokens`                                                                                  | 是   | token 用量统计          |
| `finish`     | `string`                                                                                           | 否   | 完成原因                |

`AssistantTokens`

| 字段          | 类型     | 必填 | 说明            |
| ------------- | -------- | ---- | --------------- |
| `input`       | `number` | 是   | 输入 token      |
| `output`      | `number` | 是   | 输出 token      |
| `reasoning`   | `number` | 是   | reasoning token |
| `cache.read`  | `number` | 是   | 缓存读取 token  |
| `cache.write` | `number` | 是   | 缓存写入 token  |

`Part`

| `type`          | 关键字段                                               | 说明               |
| --------------- | ------------------------------------------------------ | ------------------ |
| `"text"`        | `text`, `synthetic?`, `ignored?`, `time?`, `metadata?` | 普通文本正文       |
| `"reasoning"`   | `text`, `time`, `metadata?`                            | 中间推理片段       |
| `"file"`        | `mime`, `filename?`, `url`, `source?`                  | 文件附件或文件引用 |
| `"tool"`        | `callID`, `tool`, `state`, `metadata?`                 | 工具调用状态       |
| `"step-start"`  | `snapshot?`                                            | 一个执行步骤开始   |
| `"step-finish"` | `reason`, `snapshot?`, `cost`, `tokens`                | 一个执行步骤完成   |
| `"snapshot"`    | `snapshot`                                             | 快照标识           |
| `"patch"`       | `hash`, `files`                                        | 补丁摘要           |
| `"agent"`       | `name`, `source?`                                      | agent 片段         |
| `"subtask"`     | `prompt`, `description`, `agent`                       | 子任务片段         |
| `"retry"`       | `attempt`, `error`, `time`                             | 重试信息           |
| `"compaction"`  | `auto`                                                 | compact 相关片段   |

#### Field notes

- `parts` 的顺序就是消息内部的展示顺序。
- `ToolPart.state` 是判别联合，至少会区分 `pending`、`running`、`completed`、`error` 四种状态。
- `metadata` 和部分工具输入使用 `Record<string, unknown>`，因为 v1 契约没有再细化。

#### Request example

```json
{
  "path": {
    "id": "ses_demo"
  },
  "query": {
    "limit": 20
  }
}
```

#### Response example

```json
[
  {
    "info": {
      "id": "msg_user",
      "sessionID": "ses_demo",
      "role": "user",
      "time": {
        "created": 1742371200000
      },
      "agent": "default",
      "model": {
        "providerID": "openai",
        "modelID": "gpt-5.4"
      }
    },
    "parts": [
      {
        "id": "part_text",
        "sessionID": "ses_demo",
        "messageID": "msg_user",
        "type": "text",
        "text": "Summarize the repo."
      }
    ]
  }
]
```

## 4. `session.prompt`

### What it does

发送消息并等待响应完成。

### Server mapping

- SDK method: `client.session.prompt`
- `operationId`: `session.prompt`
- HTTP: `POST /session/{sessionID}/message`

### Parameters

| 字段              | 类型                                      | 位置  | 必填 | 说明           |
| ----------------- | ----------------------------------------- | ----- | ---- | -------------- |
| `path.id`         | `string`                                  | path  | 是   | 会话 ID        |
| `query.directory` | `string`                                  | query | 否   | 目录上下文     |
| `body.messageID`  | `string`                                  | body  | 否   | 父消息 ID      |
| `body.model`      | `{ providerID: string, modelID: string }` | body  | 否   | 指定模型       |
| `body.agent`      | `string`                                  | body  | 否   | 指定 agent     |
| `body.noReply`    | `boolean`                                 | body  | 否   | 不等待完整回复 |
| `body.system`     | `string`                                  | body  | 否   | system prompt  |
| `body.tools`      | `Record<string, boolean>`                 | body  | 否   | 工具可用性映射 |
| `body.parts`      | `PartInput[]`                             | body  | 是   | 输入 parts     |

### Complex types

`PartInput` 只允许以下 4 种输入：

`TextPartInput`

| 字段        | 类型                              | 必填 | 说明             |
| ----------- | --------------------------------- | ---- | ---------------- |
| `id`        | `string`                          | 否   | 自定义 part ID   |
| `type`      | `"text"`                          | 是   | 类型标记         |
| `text`      | `string`                          | 是   | 输入文本         |
| `synthetic` | `boolean`                         | 否   | 是否为合成文本   |
| `ignored`   | `boolean`                         | 否   | 是否应被忽略     |
| `time`      | `{ start: number, end?: number }` | 否   | 时间范围         |
| `metadata`  | `Record<string, unknown>`         | 否   | 运行时附加元数据 |

`FilePartInput`

| 字段       | 类型             | 必填 | 说明           |
| ---------- | ---------------- | ---- | -------------- |
| `id`       | `string`         | 否   | 自定义 part ID |
| `type`     | `"file"`         | 是   | 类型标记       |
| `mime`     | `string`         | 是   | MIME 类型      |
| `filename` | `string`         | 否   | 文件名         |
| `url`      | `string`         | 是   | 文件或资源地址 |
| `source`   | `FilePartSource` | 否   | 文件来源信息   |

`FilePartSource`

| 类型           | 关键字段                                                  | 说明         |
| -------------- | --------------------------------------------------------- | ------------ |
| `FileSource`   | `type: "file"`, `path`, `text`                            | 直接文件片段 |
| `SymbolSource` | `type: "symbol"`, `path`, `range`, `name`, `kind`, `text` | 符号级片段   |

`AgentPartInput`

| 字段     | 类型                                            | 必填 | 说明           |
| -------- | ----------------------------------------------- | ---- | -------------- |
| `id`     | `string`                                        | 否   | 自定义 part ID |
| `type`   | `"agent"`                                       | 是   | 类型标记       |
| `name`   | `string`                                        | 是   | agent 名称     |
| `source` | `{ value: string, start: number, end: number }` | 否   | 来源文本片段   |

`SubtaskPartInput`

| 字段          | 类型        | 必填 | 说明                 |
| ------------- | ----------- | ---- | -------------------- |
| `id`          | `string`    | 否   | 自定义 part ID       |
| `type`        | `"subtask"` | 是   | 类型标记             |
| `prompt`      | `string`    | 是   | 子任务提示词         |
| `description` | `string`    | 是   | 子任务描述           |
| `agent`       | `string`    | 是   | 执行该子任务的 agent |

### Returns

返回 `MessageWithParts`，形状为：

```ts
{
  info: AssistantMessage
  parts: Part[]
}
```

`info` 和 `parts` 的字段定义同 [`session.messages`](#3-sessionlist--sessionstatus--sessionchildren--sessiontodo--sessionmessages)。

### Request example

```json
{
  "path": {
    "id": "ses_demo"
  },
  "body": {
    "parts": [
      {
        "type": "text",
        "text": "Summarize the current repository."
      }
    ]
  }
}
```

### Response example

```json
{
  "info": {
    "id": "msg_assistant",
    "sessionID": "ses_demo",
    "role": "assistant",
    "parentID": "msg_user",
    "providerID": "openai",
    "modelID": "gpt-5.4",
    "mode": "chat",
    "path": {
      "cwd": "/repo",
      "root": "/repo"
    },
    "cost": 0,
    "tokens": {
      "input": 120,
      "output": 30,
      "reasoning": 0,
      "cache": {
        "read": 0,
        "write": 0
      }
    },
    "time": {
      "created": 1742371201000
    }
  },
  "parts": [
    {
      "id": "part_out",
      "sessionID": "ses_demo",
      "messageID": "msg_assistant",
      "type": "text",
      "text": "This repository contains..."
    }
  ]
}
```

### Errors / Pitfalls

- `parts` 是必填，而且只能传 `TextPartInput`、`FilePartInput`、`AgentPartInput`、`SubtaskPartInput`。
- v1 参数形态必须写成 `path` + `body`。

### v2 Differences

v2 把 `path` 和 `body` 展平到一个参数对象中。

## 5. `session.promptAsync`

### What it does

异步发消息，立即返回。

### Server mapping

- SDK method: `client.session.promptAsync`
- `operationId`: `session.prompt_async`
- HTTP: `POST /session/{sessionID}/prompt_async`

### Parameters

字段结构与 [`session.prompt`](#4-sessionprompt) 相同：

| 字段              | 类型                                      | 位置  | 必填 | 说明           |
| ----------------- | ----------------------------------------- | ----- | ---- | -------------- |
| `path.id`         | `string`                                  | path  | 是   | 会话 ID        |
| `query.directory` | `string`                                  | query | 否   | 目录上下文     |
| `body.messageID`  | `string`                                  | body  | 否   | 父消息 ID      |
| `body.model`      | `{ providerID: string, modelID: string }` | body  | 否   | 指定模型       |
| `body.agent`      | `string`                                  | body  | 否   | 指定 agent     |
| `body.noReply`    | `boolean`                                 | body  | 否   | 不等待完整回复 |
| `body.system`     | `string`                                  | body  | 否   | system prompt  |
| `body.tools`      | `Record<string, boolean>`                 | body  | 否   | 工具可用性映射 |
| `body.parts`      | `PartInput[]`                             | body  | 是   | 输入 parts     |

### Returns

返回 `204 No Content`：

- 没有响应体。
- 类型上等价于 `void`。

### Request example

```json
{
  "path": {
    "id": "ses_demo"
  },
  "body": {
    "parts": [
      {
        "type": "text",
        "text": "Index the repository in the background."
      }
    ]
  }
}
```

### Response example

以下为关键行为说明；实际 HTTP 状态为 `204 No Content`，没有 JSON body。

### Errors / Pitfalls

- 不要把“没有 body”误解成“没有开始执行”。
- 完成态应通过 `event` hook 或状态回拉判断。

### v2 Differences

v2 参数名是 `sessionID`，而不是 `path.id`。

## 6. `session.message`

### What it does

按 message ID 获取单条消息及其 parts。

### Server mapping

- SDK method: `client.session.message`
- `operationId`: `session.message`
- HTTP: `GET /session/{sessionID}/message/{messageID}`

### Parameters

| 字段              | 类型     | 位置  | 必填 | 说明       |
| ----------------- | -------- | ----- | ---- | ---------- |
| `path.id`         | `string` | path  | 是   | 会话 ID    |
| `path.messageID`  | `string` | path  | 是   | 消息 ID    |
| `query.directory` | `string` | query | 否   | 目录上下文 |

### Returns

返回 `MessageWithParts`，形状为：

```ts
{
  info: Message
  parts: Part[]
}
```

字段定义同 [`session.messages`](#3-sessionlist--sessionstatus--sessionchildren--sessiontodo--sessionmessages)。

### Request example

```json
{
  "path": {
    "id": "ses_demo",
    "messageID": "msg_user"
  }
}
```

### Response example

```json
{
  "info": {
    "id": "msg_user",
    "sessionID": "ses_demo",
    "role": "user",
    "time": {
      "created": 1742371200000
    },
    "agent": "default",
    "model": {
      "providerID": "openai",
      "modelID": "gpt-5.4"
    }
  },
  "parts": [
    {
      "id": "part_text",
      "sessionID": "ses_demo",
      "messageID": "msg_user",
      "type": "text",
      "text": "Summarize the repo."
    }
  ]
}
```

## 7. `session.command` / `session.shell`

### `session.command`

#### What it does

执行预定义 command，并返回生成的消息。

#### Server mapping

- SDK method: `client.session.command`
- `operationId`: `session.command`
- HTTP: `POST /session/{sessionID}/command`

#### Parameters

| 字段              | 类型     | 位置  | 必填 | 说明                   |
| ----------------- | -------- | ----- | ---- | ---------------------- |
| `path.id`         | `string` | path  | 是   | 会话 ID                |
| `query.directory` | `string` | query | 否   | 目录上下文             |
| `body.messageID`  | `string` | body  | 否   | 父消息 ID              |
| `body.agent`      | `string` | body  | 否   | 指定 agent             |
| `body.model`      | `string` | body  | 否   | command 使用的模型标识 |
| `body.arguments`  | `string` | body  | 是   | 命令参数字符串         |
| `body.command`    | `string` | body  | 是   | command 名称           |

#### Returns

返回 `MessageWithParts`，形状为：

```ts
{
  info: AssistantMessage
  parts: Part[]
}
```

#### Request example

```json
{
  "path": {
    "id": "ses_demo"
  },
  "body": {
    "command": "review",
    "arguments": "--file README.md"
  }
}
```

### `session.shell`

#### What it does

执行 shell 命令，并返回助手消息头。

#### Server mapping

- SDK method: `client.session.shell`
- `operationId`: `session.shell`
- HTTP: `POST /session/{sessionID}/shell`

#### Parameters

| 字段              | 类型                                      | 位置  | 必填 | 说明               |
| ----------------- | ----------------------------------------- | ----- | ---- | ------------------ |
| `path.id`         | `string`                                  | path  | 是   | 会话 ID            |
| `query.directory` | `string`                                  | query | 否   | 目录上下文         |
| `body.agent`      | `string`                                  | body  | 是   | 执行该命令的 agent |
| `body.model`      | `{ providerID: string, modelID: string }` | body  | 否   | 指定模型           |
| `body.command`    | `string`                                  | body  | 是   | shell 命令         |

#### Returns

返回 `AssistantMessage`，不是 `{ info, parts }`。

#### Request example

```json
{
  "path": {
    "id": "ses_demo"
  },
  "body": {
    "agent": "default",
    "command": "git status --short"
  }
}
```

#### Response example

```json
{
  "id": "msg_shell",
  "sessionID": "ses_demo",
  "role": "assistant",
  "parentID": "msg_user",
  "providerID": "openai",
  "modelID": "gpt-5.4",
  "mode": "shell",
  "path": {
    "cwd": "/repo",
    "root": "/repo"
  },
  "cost": 0,
  "tokens": {
    "input": 0,
    "output": 0,
    "reasoning": 0,
    "cache": {
      "read": 0,
      "write": 0
    }
  },
  "time": {
    "created": 1742371201000
  }
}
```

#### Errors / Pitfalls

- `session.shell` body 中当前 v1 `agent` 是必填。
- `session.command.body.model` 是 `string`，但 `session.shell.body.model` 是 `{ providerID, modelID }`。

## 8. 其他常用 session 方法

### `session.fork`

- SDK method: `client.session.fork`
- `operationId`: `session.fork`
- HTTP: `POST /session/{sessionID}/fork`

Parameters

| 字段              | 类型     | 位置  | 必填 | 说明               |
| ----------------- | -------- | ----- | ---- | ------------------ |
| `path.id`         | `string` | path  | 是   | 会话 ID            |
| `query.directory` | `string` | query | 否   | 目录上下文         |
| `body.messageID`  | `string` | body  | 否   | 从哪条消息开始分叉 |

Returns

- `Session`

### `session.abort`

- SDK method: `client.session.abort`
- `operationId`: `session.abort`
- HTTP: `POST /session/{sessionID}/abort`

Parameters

| 字段              | 类型     | 位置  | 必填 | 说明       |
| ----------------- | -------- | ----- | ---- | ---------- |
| `path.id`         | `string` | path  | 是   | 会话 ID    |
| `query.directory` | `string` | query | 否   | 目录上下文 |

Returns

- `boolean`

### `session.share`

- SDK method: `client.session.share`
- `operationId`: `session.share`
- HTTP: `POST /session/{sessionID}/share`

Parameters

| 字段              | 类型     | 位置  | 必填 | 说明       |
| ----------------- | -------- | ----- | ---- | ---------- |
| `path.id`         | `string` | path  | 是   | 会话 ID    |
| `query.directory` | `string` | query | 否   | 目录上下文 |

Returns

- `Session`

### `session.unshare`

- SDK method: `client.session.unshare`
- `operationId`: `session.unshare`
- HTTP: `DELETE /session/{sessionID}/share`

Parameters

| 字段              | 类型     | 位置  | 必填 | 说明       |
| ----------------- | -------- | ----- | ---- | ---------- |
| `path.id`         | `string` | path  | 是   | 会话 ID    |
| `query.directory` | `string` | query | 否   | 目录上下文 |

Returns

- `Session`

### `session.diff`

- SDK method: `client.session.diff`
- `operationId`: `session.diff`
- HTTP: `GET /session/{sessionID}/diff`

Parameters

| 字段              | 类型     | 位置  | 必填 | 说明                      |
| ----------------- | -------- | ----- | ---- | ------------------------- |
| `path.id`         | `string` | path  | 是   | 会话 ID                   |
| `query.directory` | `string` | query | 否   | 目录上下文                |
| `query.messageID` | `string` | query | 否   | 只拉取某条消息关联的 diff |

Returns

- `FileDiff[]`

### `session.summarize`

- SDK method: `client.session.summarize`
- `operationId`: `session.summarize`
- HTTP: `POST /session/{sessionID}/summarize`

Parameters

| 字段              | 类型     | 位置  | 必填 | 说明          |
| ----------------- | -------- | ----- | ---- | ------------- |
| `path.id`         | `string` | path  | 是   | 会话 ID       |
| `query.directory` | `string` | query | 否   | 目录上下文    |
| `body.providerID` | `string` | body  | 是   | provider 标识 |
| `body.modelID`    | `string` | body  | 是   | model 标识    |

Returns

- `boolean`

### `session.revert`

- SDK method: `client.session.revert`
- `operationId`: `session.revert`
- HTTP: `POST /session/{sessionID}/revert`

Parameters

| 字段              | 类型     | 位置  | 必填 | 说明              |
| ----------------- | -------- | ----- | ---- | ----------------- |
| `path.id`         | `string` | path  | 是   | 会话 ID           |
| `query.directory` | `string` | query | 否   | 目录上下文        |
| `body.messageID`  | `string` | body  | 是   | 回滚锚点所在消息  |
| `body.partID`     | `string` | body  | 否   | 回滚锚点所在 part |

Returns

- `Session`

### `session.unrevert`

- SDK method: `client.session.unrevert`
- `operationId`: `session.unrevert`
- HTTP: `POST /session/{sessionID}/unrevert`

Parameters

| 字段              | 类型     | 位置  | 必填 | 说明       |
| ----------------- | -------- | ----- | ---- | ---------- |
| `path.id`         | `string` | path  | 是   | 会话 ID    |
| `query.directory` | `string` | query | 否   | 目录上下文 |

Returns

- `Session`

## 9. Evidence

1. `packages/sdk/js/src/gen/sdk.gen.ts`
2. `packages/sdk/js/src/gen/types.gen.ts`
3. `packages/sdk/js/src/v2/gen/sdk.gen.ts`
4. `packages/opencode/src/server/routes/session.ts`
