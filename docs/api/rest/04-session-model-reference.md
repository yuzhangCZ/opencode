# Session 数据模型字段参考

## 1. 文档范围与阅读方式

这份文档是 Session 数据模型的 reference 页面，重点回答三类问题：

- 每个核心类型有哪些字段
- 每个字段的精确类型是什么
- 每种 `Part.type` 在什么场景出现、长什么样、应该怎么消费

阅读约定：

- 字段类型优先写成精确结构，不使用泛泛的 `object` 或 `any`
- 如果源码契约本身是宽泛结构，会写成最小准确类型，并说明无法继续收敛的原因
- 示例 JSON 以最小合法结构和典型消费场景为主，不要求与真实抓包完全一致

相关文档：

- [Session 接口](./03-session-apis.md)
- [Session 数据模型](./03-session-models.md)

## 2. Session

`Session` 表示一次会话上下文。列表接口、详情接口和部分子接口都会返回它。

### 字段

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `id` | `string` | 是 | Session 主键，通常以 `ses_` 开头 |
| `slug` | `string` | 是 | 可读标识 |
| `projectID` | `string` | 是 | 所属项目 ID |
| `workspaceID` | `string` | 否 | 所属 workspace ID |
| `directory` | `string` | 是 | 当前目录上下文 |
| `parentID` | `string` | 否 | 父 session，用于 fork 关系 |
| `summary` | `SessionSummary` | 否 | diff 汇总和文件统计 |
| `share` | `SessionShare` | 否 | 分享信息 |
| `title` | `string` | 是 | 会话标题 |
| `version` | `string` | 是 | 会话版本 |
| `time` | `SessionTime` | 是 | 创建、更新时间和归档时间 |
| `permission` | `PermissionRuleset` | 否 | 会话级权限规则数组 |
| `revert` | `SessionRevert` | 否 | 当前回滚锚点 |

### `SessionSummary`

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `additions` | `number` | 是 | 新增行数 |
| `deletions` | `number` | 是 | 删除行数 |
| `files` | `number` | 是 | 变更文件数 |
| `diffs` | `FileDiff[]` | 否 | 按文件拆分的 diff 摘要 |

`FileDiff` 结构：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `file` | `string` | 是 | 文件路径 |
| `before` | `string` | 是 | 变更前快照标识 |
| `after` | `string` | 是 | 变更后快照标识 |
| `additions` | `number` | 是 | 新增行数 |
| `deletions` | `number` | 是 | 删除行数 |
| `status` | `"added" \| "deleted" \| "modified"` | 否 | 文件变更类型 |

### `SessionShare`

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `url` | `string` | 是 | 分享地址 |

### `SessionTime`

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `created` | `number` | 是 | 创建时间戳 |
| `updated` | `number` | 是 | 更新时间戳 |
| `compacting` | `number` | 否 | 正在 compacting 的时间戳 |
| `archived` | `number` | 否 | 归档时间戳 |

### `SessionRevert`

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `messageID` | `string` | 是 | 回滚锚点所在消息 |
| `partID` | `string` | 否 | 回滚锚点所在 part |
| `snapshot` | `string` | 否 | 对应 snapshot 标识 |
| `diff` | `string` | 否 | 对应 diff 标识 |

### 最小示例

```json
{
  "id": "ses_123",
  "slug": "fix-tests",
  "projectID": "prj_123",
  "directory": "/Users/zy/Code/opencode/opencode",
  "title": "Fix tests",
  "version": "1",
  "time": {
    "created": 1742340000000,
    "updated": 1742341000000
  }
}
```

### 典型示例

```json
{
  "id": "ses_123",
  "slug": "fix-tests",
  "projectID": "prj_123",
  "workspaceID": "ws_123",
  "directory": "/Users/zy/Code/opencode/opencode",
  "parentID": "ses_root_1",
  "summary": {
    "additions": 18,
    "deletions": 4,
    "files": 2,
    "diffs": [
      {
        "file": "packages/opencode/src/session/message-v2.ts",
        "before": "snap_before",
        "after": "snap_after",
        "additions": 18,
        "deletions": 4,
        "status": "modified"
      }
    ]
  },
  "share": {
    "url": "https://example.com/share/ses_123"
  },
  "title": "Fix tests",
  "version": "1",
  "time": {
    "created": 1742340000000,
    "updated": 1742341000000,
    "archived": 1742342000000
  },
  "permission": [],
  "revert": {
    "messageID": "msg_asst_1",
    "partID": "prt_patch_1",
    "snapshot": "snap_123"
  }
}
```

### 消费提示

- 列表页通常优先显示 `title`、`time.updated`、`summary`
- fork 关系通常由 `parentID` 判断
- 回滚相关能力优先读取 `revert`

## 3. Message 外层结构

绝大多数消息接口返回的是 `MessageWithParts`，也就是：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `info` | `UserMessage \| AssistantMessage` | 是 | 消息头 |
| `parts` | `Part[]` | 是 | 消息内容片段 |

### 最小示例

```json
{
  "info": {
    "id": "msg_user_1",
    "sessionID": "ses_123",
    "role": "user",
    "time": {
      "created": 1742340000000
    },
    "agent": "build",
    "model": {
      "providerID": "openai",
      "modelID": "gpt-5.4"
    }
  },
  "parts": [
    {
      "id": "prt_text_1",
      "sessionID": "ses_123",
      "messageID": "msg_user_1",
      "type": "text",
      "text": "Fix the failing tests"
    }
  ]
}
```

### 典型示例

```json
{
  "info": {
    "id": "msg_asst_1",
    "sessionID": "ses_123",
    "role": "assistant",
    "time": {
      "created": 1742340100000,
      "completed": 1742340115000
    },
    "parentID": "msg_user_1",
    "providerID": "openai",
    "modelID": "gpt-5.4",
    "mode": "build",
    "agent": "build",
    "path": {
      "cwd": "/Users/zy/Code/opencode/opencode",
      "root": "/Users/zy/Code/opencode/opencode"
    },
    "cost": 0.02,
    "tokens": {
      "input": 100,
      "output": 200,
      "reasoning": 20,
      "cache": {
        "read": 0,
        "write": 0
      }
    },
    "finish": "stop"
  },
  "parts": [
    {
      "id": "prt_reasoning_1",
      "sessionID": "ses_123",
      "messageID": "msg_asst_1",
      "type": "reasoning",
      "text": "Need to inspect tests first",
      "time": {
        "start": 1742340100100
      }
    },
    {
      "id": "prt_text_2",
      "sessionID": "ses_123",
      "messageID": "msg_asst_1",
      "type": "text",
      "text": "I fixed the tests."
    }
  ]
}
```

### 消费提示

- 列表项通常以 `info` 为主，正文展示以 `parts` 为主
- `parts` 的顺序就是消息内部片段的展示顺序

## 4. UserMessage

`UserMessage` 表示用户输入或系统代用户写入的输入消息。

### 字段

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `id` | `string` | 是 | 消息主键 |
| `sessionID` | `string` | 是 | 所属 session |
| `role` | `"user"` | 是 | 消息角色 |
| `time` | `UserMessageTime` | 是 | 只包含创建时间 |
| `format` | `OutputFormat` | 否 | 输出格式要求 |
| `summary` | `UserMessageSummary` | 否 | 该条消息的摘要和 diff 归纳 |
| `agent` | `string` | 是 | 输入交给哪个 agent |
| `model` | `UserMessageModel` | 是 | 指定 provider 和 model |
| `system` | `string` | 否 | 附加 system 指令 |
| `tools` | `Record<string, boolean>` | 否 | 旧版工具开关映射 |
| `variant` | `string` | 否 | 提示词变体标记 |

### 嵌套类型

`UserMessageTime`

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `created` | `number` | 是 | 创建时间戳 |

`UserMessageModel`

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `providerID` | `string` | 是 | provider 标识 |
| `modelID` | `string` | 是 | model 标识 |

`UserMessageSummary`

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `title` | `string` | 否 | 摘要标题 |
| `body` | `string` | 否 | 摘要正文 |
| `diffs` | `FileDiff[]` | 是 | 关联 diff 摘要 |

### 最小示例

```json
{
  "id": "msg_user_1",
  "sessionID": "ses_123",
  "role": "user",
  "time": {
    "created": 1742340000000
  },
  "agent": "build",
  "model": {
    "providerID": "openai",
    "modelID": "gpt-5.4"
  }
}
```

### 典型示例

```json
{
  "id": "msg_user_1",
  "sessionID": "ses_123",
  "role": "user",
  "time": {
    "created": 1742340000000
  },
  "format": {
    "type": "json_schema",
    "schema": {
      "type": "object",
      "properties": {
        "summary": {
          "type": "string"
        },
        "passed": {
          "type": "boolean"
        }
      },
      "required": ["summary", "passed"]
    },
    "retryCount": 2
  },
  "summary": {
    "title": "Investigate failure",
    "body": "Look at the failing test first",
    "diffs": []
  },
  "agent": "build",
  "model": {
    "providerID": "openai",
    "modelID": "gpt-5.4"
  },
  "system": "Be concise.",
  "tools": {
    "read_file": true
  },
  "variant": "default"
}
```

### 消费提示

- 排序主要看 `time.created`
- 结构化输出需求看 `format`
- 大多数场景下，真正的输入内容仍来自 `parts`

## 5. AssistantMessage

`AssistantMessage` 表示模型生成结果。

### 字段

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `id` | `string` | 是 | 消息主键 |
| `sessionID` | `string` | 是 | 所属 session |
| `role` | `"assistant"` | 是 | 消息角色 |
| `time` | `AssistantMessageTime` | 是 | 创建和完成时间 |
| `error` | `ProviderAuthError \| UnknownError \| MessageOutputLengthError \| MessageAbortedError \| StructuredOutputError \| ContextOverflowError \| APIError` | 否 | 失败或中止原因 |
| `parentID` | `string` | 是 | 对应 user message 的 ID |
| `modelID` | `string` | 是 | 实际使用的 model |
| `providerID` | `string` | 是 | 实际使用的 provider |
| `mode` | `string` | 是 | 历史兼容字段 |
| `agent` | `string` | 是 | 实际执行的 agent |
| `path` | `AssistantMessagePath` | 是 | 执行时路径上下文 |
| `summary` | `boolean` | 否 | 是否为 summary/compaction 类回复 |
| `cost` | `number` | 是 | 成本统计 |
| `tokens` | `AssistantMessageTokens` | 是 | token 用量统计 |
| `structured` | `unknown` | 否 | 结构化输出结果；具体结构由 `UserMessage.format.schema` 决定，因此不能写死 |
| `variant` | `string` | 否 | 生成变体 |
| `finish` | `string` | 否 | 完成原因 |

### 嵌套类型

`AssistantMessageTime`

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `created` | `number` | 是 | 开始生成时间 |
| `completed` | `number` | 否 | 结束生成时间 |

`AssistantMessagePath`

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `cwd` | `string` | 是 | 当前工作目录 |
| `root` | `string` | 是 | 项目根目录 |

`AssistantMessageTokens`

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `total` | `number` | 否 | token 总量 |
| `input` | `number` | 是 | 输入 token |
| `output` | `number` | 是 | 输出 token |
| `reasoning` | `number` | 是 | reasoning token |
| `cache.read` | `number` | 是 | 缓存读取 token |
| `cache.write` | `number` | 是 | 缓存写入 token |

### 最小示例

```json
{
  "id": "msg_asst_1",
  "sessionID": "ses_123",
  "role": "assistant",
  "time": {
    "created": 1742340100000
  },
  "parentID": "msg_user_1",
  "providerID": "openai",
  "modelID": "gpt-5.4",
  "mode": "build",
  "agent": "build",
  "path": {
    "cwd": "/Users/zy/Code/opencode/opencode",
    "root": "/Users/zy/Code/opencode/opencode"
  },
  "cost": 0.02,
  "tokens": {
    "input": 100,
    "output": 200,
    "reasoning": 20,
    "cache": {
      "read": 0,
      "write": 0
    }
  }
}
```

### 典型示例

```json
{
  "id": "msg_asst_1",
  "sessionID": "ses_123",
  "role": "assistant",
  "time": {
    "created": 1742340100000,
    "completed": 1742340115000
  },
  "parentID": "msg_user_1",
  "providerID": "openai",
  "modelID": "gpt-5.4",
  "mode": "build",
  "agent": "build",
  "path": {
    "cwd": "/Users/zy/Code/opencode/opencode",
    "root": "/Users/zy/Code/opencode/opencode"
  },
  "summary": false,
  "cost": 0.02,
  "tokens": {
    "total": 320,
    "input": 100,
    "output": 200,
    "reasoning": 20,
    "cache": {
      "read": 0,
      "write": 0
    }
  },
  "structured": {
    "summary": "Tests passed",
    "passed": true
  },
  "variant": "default",
  "finish": "stop"
}
```

### 消费提示

- 进行中消息通常没有 `time.completed`
- 结构化结果优先读 `structured`
- 失败时优先读 `error`

## 6. Part 公共字段

所有 `Part` 都继承以下字段：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `id` | `string` | 是 | part 主键 |
| `sessionID` | `string` | 是 | 所属 session |
| `messageID` | `string` | 是 | 所属 message |
| `type` | `"text" \| "file" \| "tool" \| "reasoning" \| "patch" \| "snapshot" \| "step-start" \| "step-finish" \| "agent" \| "subtask" \| "retry" \| "compaction"` | 是 | 决定具体结构 |

全局结论：

- 同一种 `Part.type` 不因 `user` / `assistant` 改变字段结构
- 角色差异主要体现在“常见出现场景”和“展示语义”

## 7. Part 类型详细说明

### TextPart

用途：承载普通文本正文，常见于用户输入和助手最终回复。

常见角色：`user`、`assistant`

#### 字段

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `type` | `"text"` | 是 | 类型标记 |
| `text` | `string` | 是 | 正文内容 |
| `synthetic` | `boolean` | 否 | 是否为合成文本 |
| `ignored` | `boolean` | 否 | 是否应被忽略 |
| `time` | `{ start: number, end?: number }` | 否 | 生成时间范围 |
| `metadata` | `Record<string, unknown>` | 否 | 运行时附加元数据；键和值不属于稳定契约，因此不能继续写死 |

#### 最小示例

```json
{
  "id": "prt_text_1",
  "sessionID": "ses_123",
  "messageID": "msg_user_1",
  "type": "text",
  "text": "Fix the failing tests"
}
```

#### 典型示例

```json
{
  "id": "prt_text_2",
  "sessionID": "ses_123",
  "messageID": "msg_asst_1",
  "type": "text",
  "text": "I fixed the tests and updated the parser.",
  "synthetic": false,
  "time": {
    "start": 1742340100200,
    "end": 1742340101200
  },
  "metadata": {
    "source": "assistant"
  }
}
```

#### 使用建议

- UI 正文通常直接渲染 `text`
- `synthetic` 和 `ignored` 更适合辅助调试或高级展示

### FilePart

用途：表示文件附件、文件引用或外部资源片段。

常见角色：`user`

#### 字段

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `type` | `"file"` | 是 | 类型标记 |
| `mime` | `string` | 是 | MIME 类型 |
| `filename` | `string` | 否 | 文件名 |
| `url` | `string` | 是 | 文件或资源地址 |
| `source` | `FileSource \| SymbolSource \| ResourceSource` | 否 | 片段来源 |

#### 最小示例

```json
{
  "id": "prt_file_1",
  "sessionID": "ses_123",
  "messageID": "msg_user_1",
  "type": "file",
  "mime": "text/plain",
  "url": "file:///tmp/input.txt"
}
```

#### 典型示例

```json
{
  "id": "prt_file_2",
  "sessionID": "ses_123",
  "messageID": "msg_user_1",
  "type": "file",
  "mime": "text/x-typescript",
  "filename": "message-v2.ts",
  "url": "file:///Users/zy/Code/opencode/opencode/packages/opencode/src/session/message-v2.ts",
  "source": {
    "type": "file",
    "path": "packages/opencode/src/session/message-v2.ts",
    "text": {
      "value": "export const Format = z.discriminatedUnion(...)",
      "start": 0,
      "end": 52
    }
  }
}
```

#### 使用建议

- 有 `source` 时优先展示来源上下文
- 预览逻辑通常依赖 `mime`

### ToolPart

用途：记录工具调用过程和工具执行结果。

常见角色：`assistant`

#### 字段

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `type` | `"tool"` | 是 | 类型标记 |
| `callID` | `string` | 是 | 本次工具调用 ID |
| `tool` | `string` | 是 | 工具名称 |
| `state` | `ToolStatePending \| ToolStateRunning \| ToolStateCompleted \| ToolStateError` | 是 | 工具状态 |
| `metadata` | `Record<string, unknown>` | 否 | 工具级附加元数据；结构由运行时决定，因此不能继续写死 |

#### 最小示例

```json
{
  "id": "prt_tool_1",
  "sessionID": "ses_123",
  "messageID": "msg_asst_1",
  "type": "tool",
  "callID": "call_1",
  "tool": "read_file",
  "state": {
    "status": "pending",
    "input": {
      "path": "src/index.ts"
    },
    "raw": "{\"path\":\"src/index.ts\"}"
  }
}
```

#### 典型示例

```json
{
  "id": "prt_tool_2",
  "sessionID": "ses_123",
  "messageID": "msg_asst_1",
  "type": "tool",
  "callID": "call_1",
  "tool": "read_file",
  "state": {
    "status": "completed",
    "input": {
      "path": "src/index.ts"
    },
    "output": "Read 120 lines",
    "title": "Read file",
    "metadata": {},
    "time": {
      "start": 1742340200200,
      "end": 1742340200400
    }
  }
}
```

#### 使用建议

- 列表状态看 `state.status`
- 完成结果优先读 `state.output`
- 失败结果优先读 `state.error`

### ReasoningPart

用途：记录推理过程片段。

常见角色：`assistant`

#### 字段

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `type` | `"reasoning"` | 是 | 类型标记 |
| `text` | `string` | 是 | 推理文本 |
| `metadata` | `Record<string, unknown>` | 否 | 运行时附加元数据；不属于稳定契约 |
| `time` | `{ start: number, end?: number }` | 是 | 推理时间范围 |

#### 最小示例

```json
{
  "id": "prt_reasoning_1",
  "sessionID": "ses_123",
  "messageID": "msg_asst_1",
  "type": "reasoning",
  "text": "Need to inspect tests first",
  "time": {
    "start": 1742340100100
  }
}
```

#### 典型示例

```json
{
  "id": "prt_reasoning_2",
  "sessionID": "ses_123",
  "messageID": "msg_asst_1",
  "type": "reasoning",
  "text": "The failing assertion comes from the parser setup.",
  "metadata": {
    "step": "analysis"
  },
  "time": {
    "start": 1742340100100,
    "end": 1742340100500
  }
}
```

#### 使用建议

- 默认 UI 可以折叠展示
- 排查 agent 行为时，`time` 很有用

### PatchPart

用途：表示代码修改结果摘要。

常见角色：`assistant`

#### 字段

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `type` | `"patch"` | 是 | 类型标记 |
| `hash` | `string` | 是 | 补丁哈希 |
| `files` | `string[]` | 是 | 受影响文件列表 |

#### 最小示例

```json
{
  "id": "prt_patch_1",
  "sessionID": "ses_123",
  "messageID": "msg_asst_1",
  "type": "patch",
  "hash": "abc123",
  "files": ["packages/opencode/src/session/message-v2.ts"]
}
```

#### 典型示例

```json
{
  "id": "prt_patch_2",
  "sessionID": "ses_123",
  "messageID": "msg_asst_1",
  "type": "patch",
  "hash": "def456",
  "files": [
    "packages/opencode/src/session/message-v2.ts",
    "docs/api/rest/04-session-model-reference.md"
  ]
}
```

#### 使用建议

- UI 里通常把 `files` 作为变更摘要入口
- 真实 diff 内容需要结合 snapshot 或其他接口读取

### SnapshotPart

用途：引用某个快照标识。

常见角色：`assistant`

#### 字段

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `type` | `"snapshot"` | 是 | 类型标记 |
| `snapshot` | `string` | 是 | 快照标识 |

#### 最小示例

```json
{
  "id": "prt_snapshot_1",
  "sessionID": "ses_123",
  "messageID": "msg_asst_1",
  "type": "snapshot",
  "snapshot": "snap_123"
}
```

#### 典型示例

```json
{
  "id": "prt_snapshot_2",
  "sessionID": "ses_123",
  "messageID": "msg_asst_1",
  "type": "snapshot",
  "snapshot": "snap_after_patch"
}
```

#### 使用建议

- 本身不适合直接展示给终端用户
- 更适合调试、回滚或差异查看入口

### StepStartPart

用途：表示一个执行步骤开始。

常见角色：`assistant`

#### 字段

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `type` | `"step-start"` | 是 | 类型标记 |
| `snapshot` | `string` | 否 | 开始时的快照标识 |

#### 最小示例

```json
{
  "id": "prt_step_start_1",
  "sessionID": "ses_123",
  "messageID": "msg_asst_1",
  "type": "step-start"
}
```

#### 典型示例

```json
{
  "id": "prt_step_start_2",
  "sessionID": "ses_123",
  "messageID": "msg_asst_1",
  "type": "step-start",
  "snapshot": "snap_before_fix"
}
```

#### 使用建议

- 可作为时间线节点
- 与 `StepFinishPart` 配对时更有价值

### StepFinishPart

用途：表示一个执行步骤结束，并附带统计。

常见角色：`assistant`

#### 字段

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `type` | `"step-finish"` | 是 | 类型标记 |
| `reason` | `string` | 是 | 结束原因 |
| `snapshot` | `string` | 否 | 结束时快照标识 |
| `cost` | `number` | 是 | 本步骤成本 |
| `tokens` | `{ total?: number, input: number, output: number, reasoning: number, cache: { read: number, write: number } }` | 是 | 本步骤 token 统计 |

#### 最小示例

```json
{
  "id": "prt_step_finish_1",
  "sessionID": "ses_123",
  "messageID": "msg_asst_1",
  "type": "step-finish",
  "reason": "completed",
  "cost": 0.01,
  "tokens": {
    "input": 40,
    "output": 80,
    "reasoning": 10,
    "cache": {
      "read": 0,
      "write": 0
    }
  }
}
```

#### 典型示例

```json
{
  "id": "prt_step_finish_2",
  "sessionID": "ses_123",
  "messageID": "msg_asst_1",
  "type": "step-finish",
  "reason": "completed",
  "snapshot": "snap_after_fix",
  "cost": 0.02,
  "tokens": {
    "total": 150,
    "input": 50,
    "output": 90,
    "reasoning": 10,
    "cache": {
      "read": 0,
      "write": 0
    }
  }
}
```

#### 使用建议

- 统计面板优先读 `cost` 和 `tokens`
- 时间线 UI 可和 `step-start` 配对展示

### AgentPart

用途：记录 agent 选择或 agent 名称。

常见角色：`user`

#### 字段

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `type` | `"agent"` | 是 | 类型标记 |
| `name` | `string` | 是 | agent 名称 |
| `source` | `{ value: string, start: number, end: number }` | 否 | 名称来源片段 |

#### 最小示例

```json
{
  "id": "prt_agent_1",
  "sessionID": "ses_123",
  "messageID": "msg_user_1",
  "type": "agent",
  "name": "build"
}
```

#### 典型示例

```json
{
  "id": "prt_agent_2",
  "sessionID": "ses_123",
  "messageID": "msg_user_1",
  "type": "agent",
  "name": "build",
  "source": {
    "value": "@build",
    "start": 0,
    "end": 6
  }
}
```

#### 使用建议

- UI 上通常展示 `name`
- `source` 更适合高亮原始输入位置

### SubtaskPart

用途：记录子任务定义。

常见角色：`user`

#### 字段

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `type` | `"subtask"` | 是 | 类型标记 |
| `prompt` | `string` | 是 | 子任务提示词 |
| `description` | `string` | 是 | 子任务说明 |
| `agent` | `string` | 是 | 负责 agent |
| `model` | `{ providerID: string, modelID: string }` | 否 | 指定模型 |
| `command` | `string` | 否 | 关联命令 |

#### 最小示例

```json
{
  "id": "prt_subtask_1",
  "sessionID": "ses_123",
  "messageID": "msg_user_1",
  "type": "subtask",
  "prompt": "Inspect the parser",
  "description": "Check why the test fails",
  "agent": "build"
}
```

#### 典型示例

```json
{
  "id": "prt_subtask_2",
  "sessionID": "ses_123",
  "messageID": "msg_user_1",
  "type": "subtask",
  "prompt": "Inspect the parser and update the failing test",
  "description": "Focus on parser setup first",
  "agent": "build",
  "model": {
    "providerID": "openai",
    "modelID": "gpt-5.4"
  },
  "command": "npm test"
}
```

#### 使用建议

- `prompt` 更适合开发者调试
- UI 对终端用户通常展示 `description`

### RetryPart

用途：记录一次重试。

常见角色：`assistant`

#### 字段

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `type` | `"retry"` | 是 | 类型标记 |
| `attempt` | `number` | 是 | 第几次重试 |
| `error` | `APIError` | 是 | 触发重试的 API 错误 |
| `time` | `{ created: number }` | 是 | 重试创建时间 |

#### 最小示例

```json
{
  "id": "prt_retry_1",
  "sessionID": "ses_123",
  "messageID": "msg_asst_1",
  "type": "retry",
  "attempt": 1,
  "error": {
    "name": "APIError",
    "data": {
      "message": "Rate limit exceeded",
      "isRetryable": true
    }
  },
  "time": {
    "created": 1742340105000
  }
}
```

#### 典型示例

```json
{
  "id": "prt_retry_2",
  "sessionID": "ses_123",
  "messageID": "msg_asst_1",
  "type": "retry",
  "attempt": 2,
  "error": {
    "name": "APIError",
    "data": {
      "message": "Rate limit exceeded",
      "statusCode": 429,
      "isRetryable": true,
      "responseBody": "Too many requests"
    }
  },
  "time": {
    "created": 1742340108000
  }
}
```

#### 使用建议

- 时间线可展示重试次数
- 错误原因优先读 `error.data.message`

### CompactionPart

用途：标记上下文压缩或摘要切换。

常见角色：`assistant`

#### 字段

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `type` | `"compaction"` | 是 | 类型标记 |
| `auto` | `boolean` | 是 | 是否自动触发 |
| `overflow` | `boolean` | 否 | 是否因上下文溢出触发 |

#### 最小示例

```json
{
  "id": "prt_compaction_1",
  "sessionID": "ses_123",
  "messageID": "msg_asst_1",
  "type": "compaction",
  "auto": true
}
```

#### 典型示例

```json
{
  "id": "prt_compaction_2",
  "sessionID": "ses_123",
  "messageID": "msg_asst_1",
  "type": "compaction",
  "auto": true,
  "overflow": true
}
```

#### 使用建议

- 更适合展示成状态标签而不是正文
- `overflow` 有助于解释为什么发生压缩

## 8. 二级对象和联合类型

### ToolState

`ToolPart.state` 的精确类型是：

`ToolStatePending | ToolStateRunning | ToolStateCompleted | ToolStateError`

#### ToolStatePending

用途：工具已排队但尚未开始。

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `status` | `"pending"` | 是 | discriminator |
| `input` | `Record<string, unknown>` | 是 | 工具输入；具体键值由工具定义，因此不能继续写死 |
| `raw` | `string` | 是 | 原始工具入参文本 |

最小示例：

```json
{
  "status": "pending",
  "input": {
    "path": "src/index.ts"
  },
  "raw": "{\"path\":\"src/index.ts\"}"
}
```

#### ToolStateRunning

用途：工具执行中。

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `status` | `"running"` | 是 | discriminator |
| `input` | `Record<string, unknown>` | 是 | 工具输入；结构由具体工具决定 |
| `title` | `string` | 否 | 展示标题 |
| `metadata` | `Record<string, unknown>` | 否 | 运行时元数据；不属于稳定契约 |
| `time.start` | `number` | 是 | 开始时间 |

最小示例：

```json
{
  "status": "running",
  "input": {
    "path": "src/index.ts"
  },
  "time": {
    "start": 1742340200200
  }
}
```

#### ToolStateCompleted

用途：工具成功完成。

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `status` | `"completed"` | 是 | discriminator |
| `input` | `Record<string, unknown>` | 是 | 工具输入；结构由具体工具决定 |
| `output` | `string` | 是 | 输出结果文本 |
| `title` | `string` | 是 | 展示标题 |
| `metadata` | `Record<string, unknown>` | 是 | 运行时元数据；不属于稳定契约 |
| `time.start` | `number` | 是 | 开始时间 |
| `time.end` | `number` | 是 | 结束时间 |
| `time.compacted` | `number` | 否 | 被 compacting 的时间 |
| `attachments` | `FilePart[]` | 否 | 附件列表 |

最小示例：

```json
{
  "status": "completed",
  "input": {
    "path": "src/index.ts"
  },
  "output": "Read 120 lines",
  "title": "Read file",
  "metadata": {},
  "time": {
    "start": 1742340200200,
    "end": 1742340200400
  }
}
```

#### ToolStateError

用途：工具执行失败。

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `status` | `"error"` | 是 | discriminator |
| `input` | `Record<string, unknown>` | 是 | 工具输入；结构由具体工具决定 |
| `error` | `string` | 是 | 错误信息 |
| `metadata` | `Record<string, unknown>` | 否 | 运行时元数据；不属于稳定契约 |
| `time.start` | `number` | 是 | 开始时间 |
| `time.end` | `number` | 是 | 结束时间 |

最小示例：

```json
{
  "status": "error",
  "input": {
    "path": "src/index.ts"
  },
  "error": "File not found",
  "time": {
    "start": 1742340200200,
    "end": 1742340200300
  }
}
```

### FilePartSource

`FilePart.source` 的精确类型是：

`FileSource | SymbolSource | ResourceSource`

#### FilePartSourceText

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `value` | `string` | 是 | 截取文本 |
| `start` | `number` | 是 | 起始偏移 |
| `end` | `number` | 是 | 结束偏移 |

#### FileSource

用途：直接来自文件内容。

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `type` | `"file"` | 是 | discriminator |
| `path` | `string` | 是 | 文件路径 |
| `text` | `FilePartSourceText` | 是 | 截取文本 |

最小示例：

```json
{
  "type": "file",
  "path": "src/index.ts",
  "text": {
    "value": "export const foo = 1",
    "start": 0,
    "end": 20
  }
}
```

#### SymbolSource

用途：来自某个符号范围。

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `type` | `"symbol"` | 是 | discriminator |
| `path` | `string` | 是 | 文件路径 |
| `range.start.line` | `number` | 是 | 起始行 |
| `range.start.character` | `number` | 是 | 起始列 |
| `range.end.line` | `number` | 是 | 结束行 |
| `range.end.character` | `number` | 是 | 结束列 |
| `name` | `string` | 是 | 符号名 |
| `kind` | `number` | 是 | LSP symbol kind |
| `text` | `FilePartSourceText` | 是 | 截取文本 |

最小示例：

```json
{
  "type": "symbol",
  "path": "src/index.ts",
  "range": {
    "start": {
      "line": 10,
      "character": 0
    },
    "end": {
      "line": 20,
      "character": 1
    }
  },
  "name": "foo",
  "kind": 12,
  "text": {
    "value": "export function foo() {}",
    "start": 120,
    "end": 145
  }
}
```

#### ResourceSource

用途：来自 MCP 资源。

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `type` | `"resource"` | 是 | discriminator |
| `clientName` | `string` | 是 | MCP 客户端名 |
| `uri` | `string` | 是 | 资源 URI |
| `text` | `FilePartSourceText` | 是 | 截取文本 |

最小示例：

```json
{
  "type": "resource",
  "clientName": "docs",
  "uri": "mcp://docs/message-v2",
  "text": {
    "value": "Message schema reference",
    "start": 0,
    "end": 24
  }
}
```

### APIError

`APIError` 常见于 `AssistantMessage.error` 和 `RetryPart.error`。

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `name` | `"APIError"` | 是 | 错误类型名 |
| `data.message` | `string` | 是 | 面向人读的错误信息 |
| `data.statusCode` | `number` | 否 | 上游 HTTP 状态码 |
| `data.isRetryable` | `boolean` | 是 | 是否适合重试 |
| `data.responseHeaders` | `Record<string, string>` | 否 | 上游响应头 |
| `data.responseBody` | `string` | 否 | 上游响应体 |
| `data.metadata` | `Record<string, string>` | 否 | 附加上下文；只保证字符串键值映射 |

最小示例：

```json
{
  "name": "APIError",
  "data": {
    "message": "Rate limit exceeded",
    "isRetryable": true
  }
}
```

### time

不同对象会复用时间对象，但字段并不完全相同：

- `UserMessage.time = { created: number }`
- `AssistantMessage.time = { created: number, completed?: number }`
- `TextPart.time = { start: number, end?: number }`
- `ReasoningPart.time = { start: number, end?: number }`
- `RetryPart.time = { created: number }`
- `ToolStateRunning.time = { start: number }`
- `ToolStateCompleted.time = { start: number, end: number, compacted?: number }`
- `ToolStateError.time = { start: number, end: number }`

### path

`AssistantMessage.path` 的结构固定为：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `cwd` | `string` | 是 | 当前工作目录 |
| `root` | `string` | 是 | 项目根目录 |

### tokens

`AssistantMessage.tokens` 和 `StepFinishPart.tokens` 结构一致：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `total` | `number` | 否 | token 总量 |
| `input` | `number` | 是 | 输入 token |
| `output` | `number` | 是 | 输出 token |
| `reasoning` | `number` | 是 | reasoning token |
| `cache.read` | `number` | 是 | 缓存读取 token |
| `cache.write` | `number` | 是 | 缓存写入 token |

## 9. OutputFormat、structured、StructuredOutputError

### OutputFormat

`UserMessage.format` 的精确类型是：

`OutputFormatText | OutputFormatJsonSchema`

#### OutputFormatText

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `type` | `"text"` | 是 | 普通文本输出 |

示例：

```json
{
  "type": "text"
}
```

#### OutputFormatJsonSchema

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `type` | `"json_schema"` | 是 | 结构化输出 |
| `schema` | `JSONSchema` | 是 | 调用方要求模型遵守的输出结构；其范围就是通用 JSON Schema，所以不在本页继续展开完整规范 |
| `retryCount` | `number` | 否 | 结构化输出失败时的重试次数，默认值为 `2` |

示例：

```json
{
  "type": "json_schema",
  "schema": {
    "type": "object",
    "properties": {
      "summary": {
        "type": "string"
      },
      "passed": {
        "type": "boolean"
      }
    },
    "required": ["summary", "passed"]
  },
  "retryCount": 2
}
```

### structured

`AssistantMessage.structured` 的类型写作 `unknown`。

原因：

- 它的具体结构由 `UserMessage.format.schema` 决定
- 同一个接口下，不同调用方可以传入不同的 schema
- 因此文档不能写死统一字段

调用建议：

- 当 `format.type = "json_schema"` 且成功时，优先读取 `structured`
- 只有当你自己知道提交了什么 schema，才能安全地进一步断言其内部结构

### StructuredOutputError

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `name` | `"StructuredOutputError"` | 是 | 错误类型名 |
| `data.message` | `string` | 是 | 错误信息 |
| `data.retries` | `number` | 是 | 实际重试次数 |

失败示例：

```json
{
  "name": "StructuredOutputError",
  "data": {
    "message": "Model did not produce structured output",
    "retries": 2
  }
}
```

## 10. 完整实例

### 多 Part AssistantMessage

```json
{
  "info": {
    "id": "msg_asst_2",
    "sessionID": "ses_123",
    "role": "assistant",
    "time": {
      "created": 1742340200000,
      "completed": 1742340215000
    },
    "parentID": "msg_user_2",
    "providerID": "openai",
    "modelID": "gpt-5.4",
    "mode": "build",
    "agent": "build",
    "path": {
      "cwd": "/Users/zy/Code/opencode/opencode",
      "root": "/Users/zy/Code/opencode/opencode"
    },
    "cost": 0.03,
    "tokens": {
      "input": 120,
      "output": 240,
      "reasoning": 30,
      "cache": {
        "read": 0,
        "write": 0
      }
    },
    "finish": "stop"
  },
  "parts": [
    {
      "id": "prt_r1",
      "sessionID": "ses_123",
      "messageID": "msg_asst_2",
      "type": "reasoning",
      "text": "Need to inspect the failing test first",
      "time": {
        "start": 1742340200100
      }
    },
    {
      "id": "prt_t1",
      "sessionID": "ses_123",
      "messageID": "msg_asst_2",
      "type": "tool",
      "callID": "call_1",
      "tool": "read_file",
      "state": {
        "status": "completed",
        "input": {
          "path": "packages/opencode/src/session/message-v2.ts"
        },
        "output": "Read 220 lines",
        "title": "Read file",
        "metadata": {},
        "time": {
          "start": 1742340200200,
          "end": 1742340200400
        }
      }
    },
    {
      "id": "prt_p1",
      "sessionID": "ses_123",
      "messageID": "msg_asst_2",
      "type": "patch",
      "hash": "abc123",
      "files": ["packages/opencode/src/session/message-v2.ts"]
    },
    {
      "id": "prt_x1",
      "sessionID": "ses_123",
      "messageID": "msg_asst_2",
      "type": "text",
      "text": "I fixed the failing test and updated the parser."
    }
  ]
}
```

### 结构化输出成功

```json
{
  "info": {
    "id": "msg_asst_3",
    "sessionID": "ses_123",
    "role": "assistant",
    "time": {
      "created": 1742340300000,
      "completed": 1742340302000
    },
    "parentID": "msg_user_3",
    "providerID": "openai",
    "modelID": "gpt-5.4",
    "mode": "build",
    "agent": "build",
    "path": {
      "cwd": "/Users/zy/Code/opencode/opencode",
      "root": "/Users/zy/Code/opencode/opencode"
    },
    "cost": 0.01,
    "tokens": {
      "input": 40,
      "output": 60,
      "reasoning": 5,
      "cache": {
        "read": 0,
        "write": 0
      }
    },
    "structured": {
      "summary": "Tests passed",
      "passed": true
    },
    "finish": "stop"
  },
  "parts": [
    {
      "id": "prt_text_3",
      "sessionID": "ses_123",
      "messageID": "msg_asst_3",
      "type": "text",
      "text": "Tests passed."
    }
  ]
}
```
