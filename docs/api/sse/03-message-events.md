# Message 事件

- Contract Baseline: `dev@cf425d114`
- Contract Source (v1): `packages/sdk/js/src/gen/types.gen.ts`
- Opencode Version: `1.2.18`
- Last Verified: `2026-03-23`
- Plugin Hook Note: `@opencode-ai/plugin` 的 `event` hook 入参使用 `@opencode-ai/sdk` 根导出 `Event`（v1 联合）。

## 快速导航

- 如果你只消费消息级事件，先看 [`message.updated`](#messageupdated)。
- 如果你只消费增量/工具/文件类事件，先看 [`message.part.updated`](#messagepartupdated)。
- 如果你需要字段级类型定义，再看文末的“维护者附录”。

## `message.updated`

- 稳定性: `contracted`
- 端点可见性: `/event`, `/global/event`
- payload（结构化示例，非完整字段）:

```json
{
  "type": "message.updated",
  "properties": {
    "info": "<Message>"
  }
}
```

### 消费建议

1. 先根据 `properties.info.role` 判断是 `UserMessage` 还是 `AssistantMessage`。
2. 如果你只关心消息是否完成，优先读取 `properties.info.time.completed`、`properties.info.finish` 和 `properties.info.error`。
3. `properties.info.summary`、`properties.info.tokens`、`properties.info.path` 这类复合或分支相关字段，按类型名跳转到文末“维护者附录”查看字段明细。

### 公共字段（`Message = UserMessage | AssistantMessage`）

| 字段 | 类型 | 必填性 | 说明 |
| --- | --- | --- | --- |
| `properties.info.id` | `string` | 必填 | 消息 ID |
| `properties.info.sessionID` | `string` | 必填 | 所属会话 ID |
| `properties.info.role` | `"user" | "assistant"` | 必填 | 消息角色 |
| `properties.info.time.created` | `number` | 必填 | 创建时间（毫秒） |
| `properties.info.time.completed` | `number` | 条件必填（assistant 完成态） | 完成时间（毫秒） |

### 分支字段矩阵（联合类型条件字段）

| 字段 | 分支 | 类型 | 必填性 | 说明 |
| --- | --- | --- | --- | --- |
| `properties.info.agent` | `user` | `string` | 必填 | 用户消息 agent |
| `properties.info.model` | `user` | `UserMessageModel` | 必填 | 用户消息模型对象 |
| `properties.info.summary` | `user` | `UserMessageSummary` | 可选 | 用户消息摘要对象 |
| `properties.info.system` | `user` | `string` | 可选 | 用户消息系统提示 |
| `properties.info.tools` | `user` | `Record<string, boolean>` | 可选 | 工具开关映射 |
| `properties.info.parentID` | `assistant` | `string` | 必填 | 上游消息 ID |
| `properties.info.modelID` | `assistant` | `string` | 必填 | 实际模型 ID |
| `properties.info.providerID` | `assistant` | `string` | 必填 | 提供商 ID |
| `properties.info.mode` | `assistant` | `string` | 必填 | 运行模式 |
| `properties.info.path` | `assistant` | `AssistantMessagePath` | 必填 | 路径对象 |
| `properties.info.cost` | `assistant` | `number` | 必填 | 成本 |
| `properties.info.tokens` | `assistant` | `AssistantMessageTokens` | 必填 | token 统计对象 |
| `properties.info.finish` | `assistant` | `string` | 可选 | 完成原因 |
| `properties.info.summary` | `assistant` | `boolean` | 可选 | assistant 汇总标记 |
| `properties.info.error` | `assistant` | `ProviderAuthError | UnknownError | MessageOutputLengthError | MessageAbortedError | ApiError` | 可选 | 错误联合（见下方展开） |

### 联合展开：Message（判别键 `properties.info.role`）

#### `UserMessage`（`role = "user"`）

| 字段 | 类型 | 必填性 | 说明 |
| --- | --- | --- | --- |
| `id` | `string` | 必填 | 消息 ID |
| `sessionID` | `string` | 必填 | 所属会话 ID |
| `role` | `"user"` | 必填 | 消息角色判别值 |
| `time.created` | `number` | 必填 | 创建时间（毫秒） |
| `summary` | `UserMessageSummary` | 可选 | 用户消息摘要对象 |
| `agent` | `string` | 必填 | 触发该消息的 agent |
| `model` | `UserMessageModel` | 必填 | 用户消息模型对象 |
| `system` | `string` | 可选 | 用户消息系统提示 |
| `tools` | `Record<string, boolean>` | 可选 | 工具开关映射 |

#### `AssistantMessage`（`role = "assistant"`）

| 字段 | 类型 | 必填性 | 说明 |
| --- | --- | --- | --- |
| `id` | `string` | 必填 | 消息 ID |
| `sessionID` | `string` | 必填 | 所属会话 ID |
| `role` | `"assistant"` | 必填 | 消息角色判别值 |
| `time.created` | `number` | 必填 | 创建时间（毫秒） |
| `time.completed` | `number` | 可选 | 完成时间（毫秒） |
| `error` | `ProviderAuthError | UnknownError | MessageOutputLengthError | MessageAbortedError | ApiError` | 可选 | 错误联合对象 |
| `parentID` | `string` | 必填 | 上游消息 ID |
| `modelID` | `string` | 必填 | 实际执行模型 ID |
| `providerID` | `string` | 必填 | 模型提供商 ID |
| `mode` | `string` | 必填 | 运行模式 |
| `path` | `AssistantMessagePath` | 必填 | 路径对象 |
| `summary` | `boolean` | 可选 | assistant 汇总标记 |
| `cost` | `number` | 必填 | 成本 |
| `tokens` | `AssistantMessageTokens` | 必填 | token 统计对象 |
| `finish` | `string` | 可选 | 完成原因 |

### 联合展开：AssistantMessage.error（判别键 `properties.info.error.name`）

| 成员 | `name` | 说明 |
| --- | --- | --- |
| `ProviderAuthError` | `"ProviderAuthError"` | provider 鉴权失败，`data` 含 provider 标识与错误消息 |
| `UnknownError` | `"UnknownError"` | 未分类错误，`data` 含错误消息 |
| `MessageOutputLengthError` | `"MessageOutputLengthError"` | 输出长度超限，`data` 为开放结构，建议只透传或记录日志 |
| `MessageAbortedError` | `"MessageAbortedError"` | 生成被中止，`data` 含中止原因 |
| `ApiError` | `"APIError"` | 上游 API 调用失败，`data` 含状态码、可重试标志与响应信息 |

#### `ProviderAuthError`

| 字段 | 类型 | 必填性 | 说明 |
| --- | --- | --- | --- |
| `name` | `"ProviderAuthError"` | 必填 | 错误判别值 |
| `data` | `ProviderAuthErrorData` | 必填 | 鉴权错误数据 |
| `data.providerID` | `string` | 必填 | 鉴权失败的 provider ID |
| `data.message` | `string` | 必填 | 错误消息 |

#### `UnknownError`

| 字段 | 类型 | 必填性 | 说明 |
| --- | --- | --- | --- |
| `name` | `"UnknownError"` | 必填 | 错误判别值 |
| `data` | `UnknownErrorData` | 必填 | 未知错误数据 |
| `data.message` | `string` | 必填 | 错误消息 |

#### `MessageOutputLengthError`

| 字段 | 类型 | 必填性 | 说明 |
| --- | --- | --- | --- |
| `name` | `"MessageOutputLengthError"` | 必填 | 错误判别值 |
| `data` | `Record<string, unknown>` | 必填 | 输出长度错误附加数据；调用方只应依赖 `name` 做分支，不应假设稳定键 |

#### `MessageAbortedError`

| 字段 | 类型 | 必填性 | 说明 |
| --- | --- | --- | --- |
| `name` | `"MessageAbortedError"` | 必填 | 错误判别值 |
| `data` | `MessageAbortedErrorData` | 必填 | 中止错误数据 |
| `data.message` | `string` | 必填 | 中止原因消息 |

#### `ApiError`

| 字段 | 类型 | 必填性 | 说明 |
| --- | --- | --- | --- |
| `name` | `"APIError"` | 必填 | 错误判别值 |
| `data` | `ApiErrorData` | 必填 | API 错误数据 |
| `data.message` | `string` | 必填 | API 错误消息 |
| `data.statusCode` | `number` | 可选 | HTTP 状态码 |
| `data.isRetryable` | `boolean` | 必填 | 是否可重试 |
| `data.responseHeaders` | `Record<string, string>` | 可选 | 响应头映射 |
| `data.responseBody` | `string` | 可选 | 响应体摘要 |

### 全字段示例（assistant 分支）

```json
{
  "type": "message.updated",
  "properties": {
    "info": {
      "id": "msg_001",
      "sessionID": "ses_001",
      "role": "assistant",
      "time": {
        "created": 1772593200000,
        "completed": 1772593202500
      },
      "error": {
        "name": "APIError",
        "data": {
          "message": "upstream timeout",
          "statusCode": 504,
          "isRetryable": true,
          "responseHeaders": {
            "x-request-id": "req_001"
          },
          "responseBody": "gateway timeout"
        }
      },
      "parentID": "msg_user_001",
      "modelID": "claude-3-5-sonnet",
      "providerID": "anthropic",
      "mode": "chat",
      "path": {
        "cwd": "/repo",
        "root": "/repo"
      },
      "summary": true,
      "cost": 0.0123,
      "tokens": {
        "input": 1200,
        "output": 380,
        "reasoning": 210,
        "cache": {
          "read": 80,
          "write": 0
        }
      },
      "finish": "stop"
    }
  }
}
```

### 全字段示例（user 分支）

```json
{
  "type": "message.updated",
  "properties": {
    "info": {
      "id": "msg_user_001",
      "sessionID": "ses_001",
      "role": "user",
      "time": {
        "created": 1772593199000
      },
      "summary": {
        "title": "需求澄清",
        "body": "确认 message 事件字段并生成文档修订项。",
        "diffs": [
          {
            "file": "docs/api/sse/03-message-events.md",
            "before": "old",
            "after": "new",
            "additions": 120,
            "deletions": 35
          }
        ]
      },
      "agent": "build",
      "model": {
        "providerID": "anthropic",
        "modelID": "claude-3-5-sonnet"
      },
      "system": "保持输出结构化",
      "tools": {
        "read": true,
        "edit": false
      }
    }
  }
}
```

- 触发方式: 消息创建或消息级状态更新。

## `message.removed`

- 稳定性: `contracted`
- 端点可见性: `/event`, `/global/event`
- payload:

```json
{
  "type": "message.removed",
  "properties": {
    "sessionID": "string",
    "messageID": "string"
  }
}
```

| 字段 | 类型 | 必填性 | 说明 |
| --- | --- | --- | --- |
| `properties.sessionID` | `string` | 必填 | 会话 ID |
| `properties.messageID` | `string` | 必填 | 被删除消息 ID |

全字段示例：

```json
{
  "type": "message.removed",
  "properties": {
    "sessionID": "ses_001",
    "messageID": "msg_001"
  }
}
```

## `message.part.updated`

- 稳定性: `contracted`
- 端点可见性: `/event`, `/global/event`

### 消费建议

1. 先根据 `properties.part.type` 做分支，再读取对应 part 字段。
2. 如果你处理流式文本，消费 `properties.delta` 时不要把缺失当作结束信号。
3. 如果你处理 `tool` 或 `file`，继续根据 `part.state.status` 或 `part.source.type` 做第二层分支。

### 事件壳层

```json
{
  "type": "message.part.updated",
  "properties": {
    "part": "<Part>",
    "delta": "string?"
  }
}
```

### 公共字段

| 字段 | 类型 | 必填性 | 说明 |
| --- | --- | --- | --- |
| `properties.part.id` | `string` | 必填 | part ID |
| `properties.part.sessionID` | `string` | 必填 | 所属会话 ID |
| `properties.part.messageID` | `string` | 必填 | 所属消息 ID |
| `properties.part.type` | `"text" | "subtask" | "reasoning" | "file" | "tool" | "step-start" | "step-finish" | "snapshot" | "patch" | "agent" | "retry" | "compaction"` | 必填 | part 类型判别值 |
| `properties.delta` | `string` | 可选 | v1 增量字段 |

### 联合展开：Part（判别键 `properties.part.type`）

| `part.type` | 说明 |
| --- | --- |
| `text` | 文本输出与增量内容 |
| `subtask` | 子任务派发信息 |
| `reasoning` | 推理文本与推理时间 |
| `file` | 文件附件或源码定位信息 |
| `tool` | 工具调用状态与结果 |
| `step-start` | 步骤开始标记，可选携带快照 |
| `step-finish` | 步骤结束结果、成本与 token 统计 |
| `snapshot` | 快照内容 |
| `patch` | patch 哈希与变更文件列表 |
| `agent` | agent 标识与来源文本 |
| `retry` | 重试事件与错误信息 |
| `compaction` | 压缩事件标记 |

### 分类型字段明细（每类含字段表与全字段示例）

#### `part.type = "text"`

字段：

| 字段 | 类型 | 必填性 | 说明 |
| --- | --- | --- | --- |
| `part.text` | `string` | 必填 | 当前文本快照 |
| `part.synthetic` | `boolean` | 可选 | 是否 synthetic |
| `part.ignored` | `boolean` | 可选 | 是否忽略展示 |
| `part.time` | `TextPartTime` | 可选 | 文本时间对象 |
| `part.metadata` | `Record<string, unknown>` | 可选 | 附加元信息 |
| `delta` | `string` | 可选 | 本帧增量文本 |

全字段示例：

```json
{
  "type": "message.part.updated",
  "properties": {
    "part": {
      "id": "prt_txt_1",
      "sessionID": "ses_001",
      "messageID": "msg_001",
      "type": "text",
      "text": "正在整理 message 事件文档。",
      "synthetic": false,
      "ignored": false,
      "time": {
        "start": 1772593200100,
        "end": 1772593200900
      },
      "metadata": {
        "lang": "zh-CN"
      }
    },
    "delta": "并补充全字段示例。"
  }
}
```

#### `part.type = "subtask"`

字段：

| 字段 | 类型 | 必填性 | 说明 |
| --- | --- | --- | --- |
| `part.prompt` | `string` | 必填 | 子任务 prompt |
| `part.description` | `string` | 必填 | 子任务描述 |
| `part.agent` | `string` | 必填 | 子任务 agent |

全字段示例：

```json
{
  "type": "message.part.updated",
  "properties": {
    "part": {
      "id": "prt_sub_1",
      "sessionID": "ses_001",
      "messageID": "msg_001",
      "type": "subtask",
      "prompt": "Audit SSE docs",
      "description": "Check message-part fields against v1 types",
      "agent": "reviewer"
    }
  }
}
```

#### `part.type = "reasoning"`

字段：

| 字段 | 类型 | 必填性 | 说明 |
| --- | --- | --- | --- |
| `part.text` | `string` | 必填 | 推理文本 |
| `part.time` | `ReasoningPartTime` | 必填 | 推理时间对象 |
| `part.metadata` | `Record<string, unknown>` | 可选 | 附加元信息 |

全字段示例：

```json
{
  "type": "message.part.updated",
  "properties": {
    "part": {
      "id": "prt_reason_1",
      "sessionID": "ses_001",
      "messageID": "msg_001",
      "type": "reasoning",
      "text": "先补齐 part 联合，再校验示例覆盖。",
      "metadata": {
        "trace": "r-001"
      },
      "time": {
        "start": 1772593200200,
        "end": 1772593201100
      }
    }
  }
}
```

#### `part.type = "file"`

字段：

| 字段 | 类型 | 必填性 | 说明 |
| --- | --- | --- | --- |
| `part.mime` | `string` | 必填 | MIME 类型 |
| `part.url` | `string` | 必填 | 文件 URL |
| `part.filename` | `string` | 可选 | 文件名 |
| `part.source` | `FilePartSource` | 可选 | 来源信息（联合） |

##### 联合展开：FilePart.source（判别键 `properties.part.source.type`）

###### `FileSource`

| 字段 | 类型 | 必填性 | 说明 |
| --- | --- | --- | --- |
| `type` | `"file"` | 必填 | 来源判别值 |
| `path` | `string` | 必填 | 文件路径 |
| `text` | `FilePartSourceText` | 必填 | 文本片段对象 |
| `text.value` | `string` | 必填 | 片段文本 |
| `text.start` | `number` | 必填 | 起始偏移 |
| `text.end` | `number` | 必填 | 结束偏移 |

###### `SymbolSource`

| 字段 | 类型 | 必填性 | 说明 |
| --- | --- | --- | --- |
| `type` | `"symbol"` | 必填 | 来源判别值 |
| `path` | `string` | 必填 | 文件路径 |
| `range` | `Range` | 必填 | 符号范围对象 |
| `range.start.line` | `number` | 必填 | 起始行 |
| `range.start.character` | `number` | 必填 | 起始列 |
| `range.end.line` | `number` | 必填 | 结束行 |
| `range.end.character` | `number` | 必填 | 结束列 |
| `name` | `string` | 必填 | 符号名称 |
| `kind` | `number` | 必填 | 符号 kind |
| `text` | `FilePartSourceText` | 必填 | 文本片段对象 |
| `text.value` | `string` | 必填 | 片段文本 |
| `text.start` | `number` | 必填 | 起始偏移 |
| `text.end` | `number` | 必填 | 结束偏移 |

说明：单个 JSON 无法同时表示互斥联合分支，因此以下用两段完整子示例覆盖全部字段。

全字段子示例 A（`source.type = "file"`）：

```json
{
  "type": "message.part.updated",
  "properties": {
    "part": {
      "id": "prt_file_1",
      "sessionID": "ses_001",
      "messageID": "msg_001",
      "type": "file",
      "mime": "text/markdown",
      "filename": "03-message-events.md",
      "url": "file:///repo/docs/api/sse/03-message-events.md",
      "source": {
        "type": "file",
        "path": "docs/api/sse/03-message-events.md",
        "text": {
          "value": "message.part.updated",
          "start": 120,
          "end": 140
        }
      }
    }
  }
}
```

全字段子示例 B（`source.type = "symbol"`）：

```json
{
  "type": "message.part.updated",
  "properties": {
    "part": {
      "id": "prt_file_2",
      "sessionID": "ses_001",
      "messageID": "msg_001",
      "type": "file",
      "mime": "text/typescript",
      "filename": "types.gen.ts",
      "url": "file:///repo/packages/sdk/js/src/gen/types.gen.ts",
      "source": {
        "type": "symbol",
        "path": "packages/sdk/js/src/gen/types.gen.ts",
        "name": "EventMessagePartUpdated",
        "kind": 13,
        "range": {
          "start": {
            "line": 406,
            "character": 1
          },
          "end": {
            "line": 412,
            "character": 2
          }
        },
        "text": {
          "value": "part: Part\\ndelta?: string",
          "start": 0,
          "end": 28
        }
      }
    }
  }
}
```

#### `part.type = "tool"`

字段：

| 字段 | 类型 | 必填性 | 说明 |
| --- | --- | --- | --- |
| `part.callID` | `string` | 必填 | 工具调用 ID |
| `part.tool` | `string` | 必填 | 工具名 |
| `part.state` | `ToolState` | 必填 | 工具状态联合 |
| `part.metadata` | `Record<string, unknown>` | 可选 | tool 级附加元信息 |

##### 联合展开：ToolState（判别键 `properties.part.state.status`）

###### `ToolStatePending`

| 字段 | 类型 | 必填性 | 说明 |
| --- | --- | --- | --- |
| `status` | `"pending"` | 必填 | 状态判别值 |
| `input` | `Record<string, unknown>` | 必填 | 工具输入对象 |
| `raw` | `string` | 必填 | 原始输入字符串 |

###### `ToolStateRunning`

| 字段 | 类型 | 必填性 | 说明 |
| --- | --- | --- | --- |
| `status` | `"running"` | 必填 | 状态判别值 |
| `input` | `Record<string, unknown>` | 必填 | 工具输入对象 |
| `title` | `string` | 可选 | 运行标题 |
| `metadata` | `Record<string, unknown>` | 可选 | 运行元数据 |
| `time.start` | `number` | 必填 | 开始时间 |

###### `ToolStateCompleted`

| 字段 | 类型 | 必填性 | 说明 |
| --- | --- | --- | --- |
| `status` | `"completed"` | 必填 | 状态判别值 |
| `input` | `Record<string, unknown>` | 必填 | 工具输入对象 |
| `output` | `string` | 必填 | 工具输出文本 |
| `title` | `string` | 必填 | 完成标题 |
| `metadata` | `Record<string, unknown>` | 必填 | 完成元数据 |
| `time.start` | `number` | 必填 | 开始时间 |
| `time.end` | `number` | 必填 | 结束时间 |
| `time.compacted` | `number` | 可选 | 压缩时间 |
| `attachments` | `FilePart[]` | 可选 | 附件文件 part 数组 |

###### `ToolStateError`

| 字段 | 类型 | 必填性 | 说明 |
| --- | --- | --- | --- |
| `status` | `"error"` | 必填 | 状态判别值 |
| `input` | `Record<string, unknown>` | 必填 | 工具输入对象 |
| `error` | `string` | 必填 | 错误消息 |
| `metadata` | `Record<string, unknown>` | 可选 | 错误元数据 |
| `time.start` | `number` | 必填 | 开始时间 |
| `time.end` | `number` | 必填 | 结束时间 |

说明：单个 JSON 无法同时表示互斥联合分支，因此以下用四段完整子示例覆盖全部字段。

全字段子示例 A（`state.status = "pending"`）：

```json
{
  "type": "message.part.updated",
  "properties": {
    "part": {
      "id": "prt_tool_pending_1",
      "sessionID": "ses_001",
      "messageID": "msg_001",
      "type": "tool",
      "callID": "call_001",
      "tool": "apply_patch",
      "state": {
        "status": "pending",
        "input": {
          "path": "docs/api/sse/03-message-events.md"
        },
        "raw": "{\"path\":\"docs/api/sse/03-message-events.md\"}"
      },
      "metadata": {
        "phase": "queue"
      }
    }
  }
}
```

全字段子示例 B（`state.status = "running"`）：

```json
{
  "type": "message.part.updated",
  "properties": {
    "part": {
      "id": "prt_tool_running_1",
      "sessionID": "ses_001",
      "messageID": "msg_001",
      "type": "tool",
      "callID": "call_001",
      "tool": "apply_patch",
      "state": {
        "status": "running",
        "input": {
          "path": "docs/api/sse/03-message-events.md"
        },
        "title": "Applying patch",
        "metadata": {
          "files": 1
        },
        "time": {
          "start": 1772593201200
        }
      },
      "metadata": {
        "phase": "execute"
      }
    }
  }
}
```

全字段子示例 C（`state.status = "completed"`）：

```json
{
  "type": "message.part.updated",
  "properties": {
    "part": {
      "id": "prt_tool_completed_1",
      "sessionID": "ses_001",
      "messageID": "msg_001",
      "type": "tool",
      "callID": "call_001",
      "tool": "apply_patch",
      "state": {
        "status": "completed",
        "input": {
          "path": "docs/api/sse/03-message-events.md"
        },
        "output": "updated 1 file",
        "title": "Patch applied",
        "metadata": {
          "files": 1
        },
        "time": {
          "start": 1772593201200,
          "end": 1772593201800,
          "compacted": 1772593201700
        },
        "attachments": [
          {
            "id": "prt_file_attach_1",
            "sessionID": "ses_001",
            "messageID": "msg_001",
            "type": "file",
            "mime": "text/markdown",
            "filename": "03-message-events.md",
            "url": "file:///repo/docs/api/sse/03-message-events.md",
            "source": {
              "type": "file",
              "path": "docs/api/sse/03-message-events.md",
              "text": {
                "value": "updated",
                "start": 1,
                "end": 8
              }
            }
          }
        ]
      },
      "metadata": {
        "phase": "done"
      }
    }
  }
}
```

全字段子示例 D（`state.status = "error"`）：

```json
{
  "type": "message.part.updated",
  "properties": {
    "part": {
      "id": "prt_tool_error_1",
      "sessionID": "ses_001",
      "messageID": "msg_001",
      "type": "tool",
      "callID": "call_001",
      "tool": "apply_patch",
      "state": {
        "status": "error",
        "input": {
          "path": "docs/api/sse/03-message-events.md"
        },
        "error": "permission denied",
        "metadata": {
          "errno": "EACCES"
        },
        "time": {
          "start": 1772593201200,
          "end": 1772593201900
        }
      },
      "metadata": {
        "phase": "failed"
      }
    }
  }
}
```

#### `part.type = "step-start"`

字段：

| 字段 | 类型 | 必填性 | 说明 |
| --- | --- | --- | --- |
| `part.snapshot` | `string` | 可选 | 步骤开始时附带的可选快照 |

全字段示例：

```json
{
  "type": "message.part.updated",
  "properties": {
    "part": {
      "id": "prt_step_start_1",
      "sessionID": "ses_001",
      "messageID": "msg_001",
      "type": "step-start",
      "snapshot": "snap_step_begin_001"
    }
  }
}
```

#### `part.type = "step-finish"`

字段：

| 字段 | 类型 | 必填性 | 说明 |
| --- | --- | --- | --- |
| `part.reason` | `string` | 必填 | 步骤结束原因 |
| `part.snapshot` | `string` | 可选 | 结束快照 |
| `part.cost` | `number` | 必填 | 步骤成本 |
| `part.tokens` | `StepFinishTokens` | 必填 | token 统计对象 |

全字段示例：

```json
{
  "type": "message.part.updated",
  "properties": {
    "part": {
      "id": "prt_step_finish_1",
      "sessionID": "ses_001",
      "messageID": "msg_001",
      "type": "step-finish",
      "reason": "stop",
      "snapshot": "snap_step_end_001",
      "cost": 0.0012,
      "tokens": {
        "input": 100,
        "output": 20,
        "reasoning": 5,
        "cache": {
          "read": 10,
          "write": 0
        }
      }
    }
  }
}
```

#### `part.type = "snapshot"`

字段：

| 字段 | 类型 | 必填性 | 说明 |
| --- | --- | --- | --- |
| `part.snapshot` | `string` | 必填 | 快照内容 |

全字段示例：

```json
{
  "type": "message.part.updated",
  "properties": {
    "part": {
      "id": "prt_snapshot_1",
      "sessionID": "ses_001",
      "messageID": "msg_001",
      "type": "snapshot",
      "snapshot": "snap_abc"
    }
  }
}
```

#### `part.type = "patch"`

字段：

| 字段 | 类型 | 必填性 | 说明 |
| --- | --- | --- | --- |
| `part.hash` | `string` | 必填 | patch 哈希 |
| `part.files` | `string[]` | 必填 | 变更文件列表 |

全字段示例：

```json
{
  "type": "message.part.updated",
  "properties": {
    "part": {
      "id": "prt_patch_1",
      "sessionID": "ses_001",
      "messageID": "msg_001",
      "type": "patch",
      "hash": "sha256:abc123",
      "files": [
        "docs/api/sse/03-message-events.md",
        "docs/api/sse/00-event-catalog.md"
      ]
    }
  }
}
```

#### `part.type = "agent"`

字段：

| 字段 | 类型 | 必填性 | 说明 |
| --- | --- | --- | --- |
| `part.name` | `string` | 必填 | agent 名称 |
| `part.source.value` | `string` | 条件必填（`source` 存在时） | 源文本 |
| `part.source.start` | `number` | 条件必填（`source` 存在时） | 起始偏移 |
| `part.source.end` | `number` | 条件必填（`source` 存在时） | 结束偏移 |

全字段示例：

```json
{
  "type": "message.part.updated",
  "properties": {
    "part": {
      "id": "prt_agent_1",
      "sessionID": "ses_001",
      "messageID": "msg_001",
      "type": "agent",
      "name": "reviewer",
      "source": {
        "value": "@reviewer",
        "start": 0,
        "end": 9
      }
    }
  }
}
```

#### `part.type = "retry"`

字段：

| 字段 | 类型 | 必填性 | 说明 |
| --- | --- | --- | --- |
| `part.attempt` | `number` | 必填 | 重试次数 |
| `part.error` | `ApiError` | 必填 | API 错误对象 |
| `part.time.created` | `number` | 必填 | 重试创建时间 |

全字段示例：

```json
{
  "type": "message.part.updated",
  "properties": {
    "part": {
      "id": "prt_retry_1",
      "sessionID": "ses_001",
      "messageID": "msg_001",
      "type": "retry",
      "attempt": 2,
      "error": {
        "name": "APIError",
        "data": {
          "message": "rate limited",
          "statusCode": 429,
          "isRetryable": true,
          "responseHeaders": {
            "retry-after": "1"
          },
          "responseBody": "too many requests"
        }
      },
      "time": {
        "created": 1772593202200
      }
    }
  }
}
```

#### `part.type = "compaction"`

字段：

| 字段 | 类型 | 必填性 | 说明 |
| --- | --- | --- | --- |
| `part.auto` | `boolean` | 必填 | 是否自动触发压缩 |

全字段示例：

```json
{
  "type": "message.part.updated",
  "properties": {
    "part": {
      "id": "prt_compaction_1",
      "sessionID": "ses_001",
      "messageID": "msg_001",
      "type": "compaction",
      "auto": true
    }
  }
}
```

## `message.part.updated.properties.delta`（v1 主契约）

1. 在 v1 中，增量文本通过 `message.part.updated.properties.delta?: string` 承载。
2. `delta` 缺失不代表结束；结束应结合 `message.updated` 完成帧或 part 状态判断。
3. `delta` 仅表示当前帧新增片段，不保证可独立重建全量文本。

增量全字段示例：

```json
{
  "type": "message.part.updated",
  "properties": {
    "part": {
      "id": "prt_txt_delta_1",
      "sessionID": "ses_001",
      "messageID": "msg_001",
      "type": "text",
      "text": "正在整理 message 事件文档，并补充标准时序样例。"
    },
    "delta": "，并补充标准时序样例。"
  }
}
```

## 标准时序样例（v1）

以下主序列展示 v1 场景常见 6 帧：

1. `message.updated`（assistant 初始化）
2. `message.part.updated`（`text` 首帧）
3. `message.part.updated`（`text` 进行中，带可选 `delta`）
4. `message.part.updated`（`tool` running）
5. `message.part.updated`（`tool` completed）
6. `message.updated`（完成收敛）

全局流包装示例（`/global/event`）：

```json
{
  "directory": "/repo",
  "payload": {
    "type": "message.part.updated",
    "properties": {
      "part": {
        "id": "prt_txt_1",
        "sessionID": "ses_001",
        "messageID": "msg_001",
        "type": "text",
        "text": "正在整理 message 事件文档。",
        "synthetic": false,
        "ignored": false,
        "time": {
          "start": 1772593200100,
          "end": 1772593200900
        },
        "metadata": {
          "lang": "zh-CN"
        }
      },
      "delta": "并补充全字段示例。"
    }
  }
}
```

## `message.part.removed`

- 稳定性: `contracted`
- 端点可见性: `/event`, `/global/event`
- payload:

```json
{
  "type": "message.part.removed",
  "properties": {
    "sessionID": "string",
    "messageID": "string",
    "partID": "string"
  }
}
```

| 字段 | 类型 | 必填性 | 说明 |
| --- | --- | --- | --- |
| `properties.sessionID` | `string` | 必填 | 会话 ID |
| `properties.messageID` | `string` | 必填 | 消息 ID |
| `properties.partID` | `string` | 必填 | 被移除 part ID |

全字段示例：

```json
{
  "type": "message.part.removed",
  "properties": {
    "sessionID": "ses_001",
    "messageID": "msg_001",
    "partID": "prt_txt_1"
  }
}
```

## 协议语义说明

1. `message.updated` 表达消息级快照与收敛结果。
2. `message.part.updated` 表达 part 级变化，`part.type` 决定字段形态。
3. v1 下增量语义在 `message.part.updated.properties.delta`，不是独立主事件契约。

## 维护者附录

### 类型治理约定

1. 字段类型使用 TypeScript 风格表达（如 `string`、`Record<string, unknown>`、`A | B`）。
2. 禁止使用未约束类型和裸对象占位类型。
3. 动态键对象按 v1 源码统一表达：
   `Record<string, unknown>` / `Record<string, boolean>` / `Record<string, string>`。
4. 联合类型必须单独展开：包含判别键、成员字段表、成员示例。

### 联合类型必拆白名单（v1）

1. `Message = UserMessage | AssistantMessage`
2. `AssistantMessage.error` 联合
3. `Part`（12 个 `part.type`）
4. `FilePart.source = FileSource | SymbolSource`
5. `ToolState = ToolStatePending | ToolStateRunning | ToolStateCompleted | ToolStateError`

### 类型映射（文档 -> v1 源码）

| 文档小节 | v1 类型 | 源码定位 |
| --- | --- | --- |
| `message.updated` 联合展开 | `Message` | `types.gen.ts:143` |
| `message.updated` user 分支 | `UserMessage` | `types.gen.ts:47` |
| `message.updated` assistant 分支 | `AssistantMessage` | `types.gen.ts:112` |
| `message.updated` error 联合 | `ProviderAuthError | UnknownError | MessageOutputLengthError | MessageAbortedError | ApiError` | `types.gen.ts:70,78,85,92,99` |
| `message.part.updated` 联合展开 | `Part` | `types.gen.ts:384` |
| `message.part.updated` source 联合 | `FilePartSource` | `types.gen.ts:224` |
| `message.part.updated` state 联合 | `ToolState` | `types.gen.ts:292` |

### 文档内补充类型名（derived from SDK field shape）

说明：若 v1 SDK 字段使用匿名对象结构，本文档使用稳定补充类型名表达，不代表 SDK 新增了同名导出。

| 文档类型名 | 来源 SDK 字段路径 | 说明 |
| --- | --- | --- |
| `UserMessageSummary` | `UserMessage.summary` | 用户消息摘要对象 |
| `UserMessageModel` | `UserMessage.model` | 用户消息模型对象 |
| `AssistantMessagePath` | `AssistantMessage.path` | assistant 路径对象 |
| `AssistantMessageTokens` | `AssistantMessage.tokens` | assistant token 统计对象 |
| `AssistantMessageTokenCache` | `AssistantMessage.tokens.cache` | assistant token cache 对象 |
| `SubtaskPart` | `Part` 中 `type = "subtask"` 分支 | subtask part 对象 |
| `TextPartTime` | `TextPart.time` | 文本 part 时间对象 |
| `ReasoningPartTime` | `ReasoningPart.time` | reasoning part 时间对象 |
| `StepFinishTokens` | `StepFinishPart.tokens` | step-finish token 统计对象 |
| `StepFinishTokenCache` | `StepFinishPart.tokens.cache` | step-finish token cache 对象 |
| `ProviderAuthErrorData` | `ProviderAuthError.data` | provider 鉴权错误数据 |
| `UnknownErrorData` | `UnknownError.data` | 未知错误数据 |
| `MessageAbortedErrorData` | `MessageAbortedError.data` | 中止错误数据 |
| `ApiErrorData` | `ApiError.data` | API 错误数据 |

#### `UserMessageSummary`

| 字段 | 类型 | 必填性 | 说明 |
| --- | --- | --- | --- |
| `title` | `string` | 可选 | 摘要标题 |
| `body` | `string` | 可选 | 摘要正文 |
| `diffs` | `FileDiff[]` | 必填 | 文件变更摘要数组 |
| `diffs[].file` | `string` | 必填 | 变更文件路径 |
| `diffs[].before` | `string` | 必填 | 变更前内容摘要 |
| `diffs[].after` | `string` | 必填 | 变更后内容摘要 |
| `diffs[].additions` | `number` | 必填 | 新增行数 |
| `diffs[].deletions` | `number` | 必填 | 删除行数 |

#### `UserMessageModel`

| 字段 | 类型 | 必填性 | 说明 |
| --- | --- | --- | --- |
| `providerID` | `string` | 必填 | 用户消息模型提供商 |
| `modelID` | `string` | 必填 | 用户消息模型 ID |

#### `AssistantMessagePath`

| 字段 | 类型 | 必填性 | 说明 |
| --- | --- | --- | --- |
| `cwd` | `string` | 必填 | 工作目录 |
| `root` | `string` | 必填 | 根目录 |

#### `AssistantMessageTokens`

| 字段 | 类型 | 必填性 | 说明 |
| --- | --- | --- | --- |
| `input` | `number` | 必填 | 输入 token 数 |
| `output` | `number` | 必填 | 输出 token 数 |
| `reasoning` | `number` | 必填 | reasoning token 数 |
| `cache` | `AssistantMessageTokenCache` | 必填 | token cache 对象 |
| `cache.read` | `number` | 必填 | 缓存读 token 数 |
| `cache.write` | `number` | 必填 | 缓存写 token 数 |

#### `AssistantMessageTokenCache`

| 字段 | 类型 | 必填性 | 说明 |
| --- | --- | --- | --- |
| `read` | `number` | 必填 | 缓存读 token 数 |
| `write` | `number` | 必填 | 缓存写 token 数 |

#### `SubtaskPart`

| 字段 | 类型 | 必填性 | 说明 |
| --- | --- | --- | --- |
| `id` | `string` | 必填 | part ID |
| `sessionID` | `string` | 必填 | 会话 ID |
| `messageID` | `string` | 必填 | 消息 ID |
| `type` | `"subtask"` | 必填 | part 判别值 |
| `prompt` | `string` | 必填 | 子任务 prompt |
| `description` | `string` | 必填 | 子任务描述 |
| `agent` | `string` | 必填 | 子任务 agent |

#### `TextPartTime`

| 字段 | 类型 | 必填性 | 说明 |
| --- | --- | --- | --- |
| `start` | `number` | 必填 | 文本 part 开始时间 |
| `end` | `number` | 可选 | 文本 part 结束时间 |

#### `ReasoningPartTime`

| 字段 | 类型 | 必填性 | 说明 |
| --- | --- | --- | --- |
| `start` | `number` | 必填 | reasoning part 开始时间 |
| `end` | `number` | 可选 | reasoning part 结束时间 |

#### `StepFinishTokens`

| 字段 | 类型 | 必填性 | 说明 |
| --- | --- | --- | --- |
| `input` | `number` | 必填 | 输入 token 数 |
| `output` | `number` | 必填 | 输出 token 数 |
| `reasoning` | `number` | 必填 | reasoning token 数 |
| `cache` | `StepFinishTokenCache` | 必填 | token cache 对象 |
| `cache.read` | `number` | 必填 | 缓存读 token 数 |
| `cache.write` | `number` | 必填 | 缓存写 token 数 |

#### `StepFinishTokenCache`

| 字段 | 类型 | 必填性 | 说明 |
| --- | --- | --- | --- |
| `read` | `number` | 必填 | 缓存读 token 数 |
| `write` | `number` | 必填 | 缓存写 token 数 |

#### `ProviderAuthErrorData`

| 字段 | 类型 | 必填性 | 说明 |
| --- | --- | --- | --- |
| `providerID` | `string` | 必填 | 鉴权失败的 provider ID |
| `message` | `string` | 必填 | 错误消息 |

#### `UnknownErrorData`

| 字段 | 类型 | 必填性 | 说明 |
| --- | --- | --- | --- |
| `message` | `string` | 必填 | 错误消息 |

#### `MessageAbortedErrorData`

| 字段 | 类型 | 必填性 | 说明 |
| --- | --- | --- | --- |
| `message` | `string` | 必填 | 中止原因消息 |

#### `ApiErrorData`

| 字段 | 类型 | 必填性 | 说明 |
| --- | --- | --- | --- |
| `message` | `string` | 必填 | API 错误消息 |
| `statusCode` | `number` | 可选 | HTTP 状态码 |
| `isRetryable` | `boolean` | 必填 | 是否可重试 |
| `responseHeaders` | `Record<string, string>` | 可选 | 响应头映射 |
| `responseBody` | `string` | 可选 | 响应体摘要 |

## 可机判验收（v1）

1. 类型禁用检查（排除“可机判验收”小节自身）：
   `sed '/^## 可机判验收（v1）/,/^## 版本治理规则/d' docs/api/sse/03-message-events.md | rg -n "\\bany\\b|\\| \`object\` \\|"` 结果应为 0。
2. 版本与来源检查（排除“可机判验收”小节自身）：
   `sed '/^## 可机判验收（v1）/,/^## 版本治理规则/d' docs/api/sse/03-message-events.md | rg -n "Runtime Observed Version|v2/gen/types\\.gen\\.ts|EventMessagePartDelta"` 结果应为 0。
3. Part 覆盖检查：
   `rg -n "^#### \`part.type = \\\"" docs/api/sse/03-message-events.md | wc -l` 结果应为 `12`。
4. 联合展开检查：
   文档必须包含以下标题：
   `联合展开：Message`、`联合展开：AssistantMessage.error`、`联合展开：Part`、`联合展开：FilePart.source`、`联合展开：ToolState`。
5. 联合示例数量检查：
   `FilePart.source` 子示例 = `2`（`file/symbol`），`ToolState` 子示例 = `4`（`pending/running/completed/error`）。
6. JSON 结构检查：
   文档中所有 `json` 代码块应可被逐个解析。

## 版本治理规则

当 `packages/sdk/js/src/gen/types.gen.ts` 中以下类型任意结构变化时，必须同步更新本文档：
`Message`、`AssistantMessage.error`、`Part`、`FilePartSource`、`ToolState`。同步内容包括：
`Opencode Version`、`类型映射` 表、以及对应联合展开小节与示例。

## 字段不清楚 FAQ

1. `message.part.delta` 是不是 v1 的独立事件？
   不是。v1 主契约中增量字段在 `message.part.updated.properties.delta`。
2. `message.updated.properties.info` 为什么有时字段多、有时少？
   因为 `info` 是联合类型 `Message = UserMessage | AssistantMessage`，字段取决于 `role`。
3. 插件 `event` hook 事件口径看哪一套？
   看 `@opencode-ai/sdk` 根导出的 v1 `Event` 联合。
4. `tool` 场景为什么同样是 `message.part.updated`，但字段不同？
   因为 `part.state` 是联合类型，字段要求取决于 `state.status`。
