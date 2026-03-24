# Session 事件

- Contract Baseline: `dev@0cf2ef622`
- Contract Source (v1): `packages/sdk/js/src/gen/types.gen.ts`
- Opencode Version: `1.2.18`
- Last Verified: `2026-03-23`
- Plugin Hook Note: `@opencode-ai/plugin` 的 `event` hook 入参使用 `@opencode-ai/sdk` 根导出 `Event`（v1 联合）。

## 快速导航

- 如果你只关心会话忙闲状态，先看 [`session.status`](#sessionstatus) 和 [`session.idle`](#sessionidle)。
- 如果你只关心会话实体变更，先看 [`session.created`](#sessioncreated)、[`session.updated`](#sessionupdated)、[`session.deleted`](#sessiondeleted)。
- 如果你需要理解 `Session` 对象本身的字段，直接看 [`共享类型：Session`](#共享类型session)。
- 如果你要消费错误、todo 或分支更新，再看 [`session.error`](#sessionerror)、[`todo.updated`](#todoupdated)、[`vcs.branch.updated`](#vcsbranchupdated)。
- 如果你需要字段级类型定义，再看文末的“维护者附录”。

## `session.status`

- 稳定性: `contracted`
- 端点可见性: `/event`, `/global/event`
- payload（结构化示例，非完整字段）:

```json
{
  "type": "session.status",
  "properties": {
    "sessionID": "string",
    "status": "<SessionStatus>"
  }
}
```

### 消费建议

1. 先读取 `properties.status.type`，它是 `SessionStatus` 的判别键。
2. 只有 `type = "retry"` 时，`attempt`、`message`、`next` 才存在。
3. 如果你只做忙闲 UI，同步消费 `session.status` 和 `session.idle` 即可。

### 公共字段（`EventSessionStatus`）

| 字段 | 类型 | 必填性 | 说明 |
| --- | --- | --- | --- |
| `properties.sessionID` | `string` | 必填 | 会话 ID |
| `properties.status` | `SessionStatus` | 必填 | 会话状态联合类型 |
| `properties.status.type` | `"idle" | "busy" | "retry"` | 必填 | 状态判别值 |

### 联合展开：SessionStatus（判别键 `properties.status.type`）

| 成员 | `type` | 说明 |
| --- | --- | --- |
| `SessionStatusIdle` | `"idle"` | 会话当前空闲，没有运行中的消息处理 |
| `SessionStatusBusy` | `"busy"` | 会话当前忙碌，正在处理消息或工具调用 |
| `SessionStatusRetry` | `"retry"` | 会话进入重试流程，附带重试次数、错误消息和下次重试时间 |

#### `SessionStatusIdle`

| 字段 | 类型 | 必填性 | 说明 |
| --- | --- | --- | --- |
| `type` | `"idle"` | 必填 | 空闲状态判别值 |

#### `SessionStatusBusy`

| 字段 | 类型 | 必填性 | 说明 |
| --- | --- | --- | --- |
| `type` | `"busy"` | 必填 | 忙碌状态判别值 |

#### `SessionStatusRetry`

| 字段 | 类型 | 必填性 | 说明 |
| --- | --- | --- | --- |
| `type` | `"retry"` | 必填 | 重试状态判别值 |
| `attempt` | `number` | 必填 | 当前重试次数 |
| `message` | `string` | 必填 | 本次重试关联的错误消息 |
| `next` | `number` | 必填 | 下次重试时间（毫秒时间戳） |

### 全字段示例（`busy`）

```json
{
  "type": "session.status",
  "properties": {
    "sessionID": "ses_001",
    "status": {
      "type": "busy"
    }
  }
}
```

### 全字段示例（`retry`）

```json
{
  "type": "session.status",
  "properties": {
    "sessionID": "ses_001",
    "status": {
      "type": "retry",
      "attempt": 2,
      "message": "upstream timeout",
      "next": 1772593205000
    }
  }
}
```

## `session.idle`

- 稳定性: `contracted`
- 端点可见性: `/event`, `/global/event`
- payload:

```json
{
  "type": "session.idle",
  "properties": {
    "sessionID": "string"
  }
}
```

### 消费建议

1. `session.idle` 只表示会话回到空闲态，不携带额外状态对象。
2. 如果你已经在消费 `session.status`，可以把它视为更直接的空闲通知事件。

| 字段 | 类型 | 必填性 | 说明 |
| --- | --- | --- | --- |
| `properties.sessionID` | `string` | 必填 | 会话 ID |

### 全字段示例

```json
{
  "type": "session.idle",
  "properties": {
    "sessionID": "ses_001"
  }
}
```

## `session.compacted`

- 稳定性: `contracted`
- 端点可见性: `/event`, `/global/event`
- payload:

```json
{
  "type": "session.compacted",
  "properties": {
    "sessionID": "string"
  }
}
```

### 消费建议

1. 该事件只说明“会话压缩已发生”，不携带压缩结果摘要。
2. 如果你需要压缩前后元数据，继续监听随后的 `session.updated`。

| 字段 | 类型 | 必填性 | 说明 |
| --- | --- | --- | --- |
| `properties.sessionID` | `string` | 必填 | 被压缩的会话 ID |

### 全字段示例

```json
{
  "type": "session.compacted",
  "properties": {
    "sessionID": "ses_001"
  }
}
```

## `session.created`

- 稳定性: `contracted`
- 端点可见性: `/event`, `/global/event`
- payload（结构化示例，非完整字段）:

```json
{
  "type": "session.created",
  "properties": {
    "info": "<Session>"
  }
}
```

### 消费建议

1. `properties.info` 使用 `Session` 类型，创建、更新、删除三类事件共用同一实体结构。
2. 如果你只维护会话列表，优先读取 `id`、`title`、`directory`、`time.updated`。
3. `summary`、`share`、`revert` 都是可选复合字段，字段级定义见文末附录。

### 字段说明（`EventSessionCreated`）

| 字段 | 类型 | 必填性 | 说明 |
| --- | --- | --- | --- |
| `properties.info` | `Session` | 必填 | 新建后的完整会话对象 |

### 全字段示例

```json
{
  "type": "session.created",
  "properties": {
    "info": {
      "id": "ses_001",
      "projectID": "proj_001",
      "directory": "/Users/zy/Code/opencode/opencode/packages/opencode",
      "parentID": "ses_parent_001",
      "summary": {
        "additions": 12,
        "deletions": 3,
        "files": 2,
        "diffs": [
          {
            "file": "docs/api/sse/02-session-events.md",
            "before": "old",
            "after": "new",
            "additions": 12,
            "deletions": 3
          }
        ]
      },
      "share": {
        "url": "https://app.opencode.ai/share/ses_001"
      },
      "title": "SSE session docs",
      "version": "local",
      "time": {
        "created": 1772592652074,
        "updated": 1772592652074,
        "compacting": 1772592659999
      },
      "revert": {
        "messageID": "msg_001",
        "partID": "part_001",
        "snapshot": "snap_001",
        "diff": "@@ -1 +1 @@"
      }
    }
  }
}
```

## `session.updated`

- 稳定性: `contracted`
- 端点可见性: `/event`, `/global/event`
- payload（结构化示例，非完整字段）:

```json
{
  "type": "session.updated",
  "properties": {
    "info": "<Session>"
  }
}
```

### 消费建议

1. 对消费者来说，`session.updated` 和 `session.created` 只差在事件语义，不差在 `Session` 结构。
2. 更新场景里最常变化的是 `title`、`summary`、`share`、`time.updated`、`revert`。

### 字段说明（`EventSessionUpdated`）

| 字段 | 类型 | 必填性 | 说明 |
| --- | --- | --- | --- |
| `properties.info` | `Session` | 必填 | 更新后的完整会话对象 |

### 全字段示例

```json
{
  "type": "session.updated",
  "properties": {
    "info": {
      "id": "ses_001",
      "projectID": "proj_001",
      "directory": "/Users/zy/Code/opencode/opencode/packages/opencode",
      "parentID": "ses_parent_001",
      "summary": {
        "additions": 20,
        "deletions": 5,
        "files": 3,
        "diffs": [
          {
            "file": "docs/api/sse/04-permission-question-events.md",
            "before": "old",
            "after": "new",
            "additions": 20,
            "deletions": 5
          }
        ]
      },
      "share": {
        "url": "https://app.opencode.ai/share/ses_001"
      },
      "title": "Refine SSE session docs",
      "version": "local",
      "time": {
        "created": 1772592652074,
        "updated": 1772593102000,
        "compacting": 1772593200000
      },
      "revert": {
        "messageID": "msg_002",
        "partID": "part_002",
        "snapshot": "snap_002",
        "diff": "@@ -10 +10 @@"
      }
    }
  }
}
```

## `session.deleted`

- 稳定性: `contracted`
- 端点可见性: `/event`, `/global/event`
- payload（结构化示例，非完整字段）:

```json
{
  "type": "session.deleted",
  "properties": {
    "info": "<Session>"
  }
}
```

### 消费建议

1. `session.deleted` 仍然携带完整 `Session`，不是只有 `id`。
2. 如果你做本地索引删除，可以只依赖 `properties.info.id`，但不要假设其他字段不存在。

### 字段说明（`EventSessionDeleted`）

| 字段 | 类型 | 必填性 | 说明 |
| --- | --- | --- | --- |
| `properties.info` | `Session` | 必填 | 被删除前的完整会话对象 |

### 全字段示例

```json
{
  "type": "session.deleted",
  "properties": {
    "info": {
      "id": "ses_archive_001",
      "projectID": "proj_001",
      "directory": "/Users/zy/Code/opencode/opencode/packages/opencode",
      "parentID": "ses_parent_001",
      "summary": {
        "additions": 8,
        "deletions": 1,
        "files": 1,
        "diffs": [
          {
            "file": "docs/api/sse/03-message-events.md",
            "before": "old",
            "after": "new",
            "additions": 8,
            "deletions": 1
          }
        ]
      },
      "share": {
        "url": "https://app.opencode.ai/share/ses_archive_001"
      },
      "title": "Archived SSE review",
      "version": "local",
      "time": {
        "created": 1772592000000,
        "updated": 1772592600000,
        "compacting": 1772592599000
      },
      "revert": {
        "messageID": "msg_archive_001",
        "partID": "part_archive_001",
        "snapshot": "snap_archive_001",
        "diff": "@@ -1 +0 @@"
      }
    }
  }
}
```

## 共享类型：`Session`

`session.created`、`session.updated`、`session.deleted` 的 `properties.info` 都使用同一个 `Session` 结构。
在这些事件中，`Session` 字段对应访问路径为 `properties.info.<field>`。

### 消费建议

1. 列表类 UI 一般只需要 `id`、`title`、`directory`、`time.updated`。
2. 只有在需要展示变更摘要、分享链接或回滚入口时，再读取 `summary`、`share`、`revert`。
3. `summary`、`share`、`revert` 都是可选字段，消费方不能假设一定存在。

### 字段说明（`Session`）

| 字段 | 类型 | 必填性 | 说明 |
| --- | --- | --- | --- |
| `id` | `string` | 必填 | 会话 ID |
| `projectID` | `string` | 必填 | 所属项目 ID |
| `directory` | `string` | 必填 | 会话工作目录 |
| `parentID` | `string` | 可选 | 父会话 ID |
| `summary` | `SessionSummary` | 可选 | 会话摘要对象 |
| `share` | `SessionShare` | 可选 | 会话分享信息 |
| `title` | `string` | 必填 | 会话标题 |
| `version` | `string` | 必填 | 会话版本标识 |
| `time` | `SessionTime` | 必填 | 会话时间对象 |
| `revert` | `SessionRevert` | 可选 | 最近一次回滚相关信息 |

### 复合字段说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `summary` | `SessionSummary` | 变更统计与可选 `FileDiff[]` 列表 |
| `share` | `SessionShare` | 外部分享链接 |
| `time` | `SessionTime` | 创建、更新时间与可选压缩时间 |
| `revert` | `SessionRevert` | 回滚入口关联的消息、part、快照与 diff |

## `session.diff`

- 稳定性: `contracted`
- 端点可见性: `/event`, `/global/event`
- payload（结构化示例，非完整字段）:

```json
{
  "type": "session.diff",
  "properties": {
    "sessionID": "string",
    "diff": "<FileDiff[]>"
  }
}
```

### 消费建议

1. `properties.diff` 是文件级 diff 列表，结构和消息摘要里的 `FileDiff[]` 一致。
2. 如果你只做变更计数，可以直接聚合 `additions` 和 `deletions`。

| 字段 | 类型 | 必填性 | 说明 |
| --- | --- | --- | --- |
| `properties.sessionID` | `string` | 必填 | 会话 ID |
| `properties.diff` | `FileDiff[]` | 必填 | 文件级 diff 列表 |

### 全字段示例

```json
{
  "type": "session.diff",
  "properties": {
    "sessionID": "ses_001",
    "diff": [
      {
        "file": "docs/api/sse/02-session-events.md",
        "before": "old",
        "after": "new",
        "additions": 20,
        "deletions": 3
      }
    ]
  }
}
```

## `session.error`

- 稳定性: `contracted`
- 端点可见性: `/event`, `/global/event`
- payload（结构化示例，非完整字段）:

```json
{
  "type": "session.error",
  "properties": {
    "sessionID": "string?",
    "error": "<ProviderAuthError | UnknownError | MessageOutputLengthError | MessageAbortedError | ApiError>?"
  }
}
```

### 消费建议

1. `properties.sessionID` 和 `properties.error` 都是可选字段；消费方不能假设两者一定同时存在。
2. 如果存在 `properties.error`，先读取 `properties.error.name` 进行分支。
3. `MessageOutputLengthError.data` 是开放结构，调用方只应依赖 `name` 做分支，不应假设稳定键。

### 字段说明（`EventSessionError`）

| 字段 | 类型 | 必填性 | 说明 |
| --- | --- | --- | --- |
| `properties.sessionID` | `string` | 可选 | 关联会话 ID |
| `properties.error` | `ProviderAuthError | UnknownError | MessageOutputLengthError | MessageAbortedError | ApiError` | 可选 | 会话错误联合类型 |

### 联合展开：session.error.properties.error（判别键 `properties.error.name`）

| 成员 | `name` | 说明 |
| --- | --- | --- |
| `ProviderAuthError` | `"ProviderAuthError"` | provider 鉴权失败，`data` 含 provider 标识与错误消息 |
| `UnknownError` | `"UnknownError"` | 未分类错误，`data` 含错误消息 |
| `MessageOutputLengthError` | `"MessageOutputLengthError"` | 输出长度超限，`data` 为开放结构 |
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

### 全字段示例

```json
{
  "type": "session.error",
  "properties": {
    "sessionID": "ses_001",
    "error": {
      "name": "UnknownError",
      "data": {
        "message": "Model request failed"
      }
    }
  }
}
```

## `todo.updated`

- 稳定性: `contracted`
- 端点可见性: `/event`, `/global/event`
- payload（结构化示例，非完整字段）:

```json
{
  "type": "todo.updated",
  "properties": {
    "sessionID": "string",
    "todos": "<Todo[]>"
  }
}
```

### 消费建议

1. `properties.todos` 会整体替换当前待办列表，不是增量 patch。
2. `Todo.status` 和 `Todo.priority` 在 v1 类型里是 `string`，调用方不要假设只有文档示例里的枚举值。

| 字段 | 类型 | 必填性 | 说明 |
| --- | --- | --- | --- |
| `properties.sessionID` | `string` | 必填 | 会话 ID |
| `properties.todos` | `Todo[]` | 必填 | 最新待办列表 |

### 全字段示例

```json
{
  "type": "todo.updated",
  "properties": {
    "sessionID": "ses_001",
    "todos": [
      {
        "id": "todo_1",
        "content": "Rewrite SSE session docs",
        "status": "in_progress",
        "priority": "high"
      },
      {
        "id": "todo_2",
        "content": "Validate JSON examples",
        "status": "pending",
        "priority": "medium"
      }
    ]
  }
}
```

## `vcs.branch.updated`

- 稳定性: `contracted`
- 端点可见性: `/event`, `/global/event`
- payload:

```json
{
  "type": "vcs.branch.updated",
  "properties": {
    "branch": "string?"
  }
}
```

### 消费建议

1. `properties.branch` 是可选字段；未提供时表示当前分支未知或已脱离分支上下文。
2. 如果你只做分支标签展示，收到空值时应回退到“unknown”或隐藏显示。

| 字段 | 类型 | 必填性 | 说明 |
| --- | --- | --- | --- |
| `properties.branch` | `string` | 可选 | 当前版本控制分支名 |

### 全字段示例

```json
{
  "type": "vcs.branch.updated",
  "properties": {
    "branch": "codex/sse-doc-sync"
  }
}
```

## 维护者附录

### 类型映射（文档 -> v1 源码）

| 文档小节 | 类型名 | 源码位置 |
| --- | --- | --- |
| `session.status` | `EventSessionStatus` / `SessionStatus` | `packages/sdk/js/src/gen/types.gen.ts` |
| `session.idle` | `EventSessionIdle` | `packages/sdk/js/src/gen/types.gen.ts` |
| `session.compacted` | `EventSessionCompacted` | `packages/sdk/js/src/gen/types.gen.ts` |
| `session.created` / `session.updated` / `session.deleted` | `EventSessionCreated` / `EventSessionUpdated` / `EventSessionDeleted` / `Session` | `packages/sdk/js/src/gen/types.gen.ts` |
| `session.diff` | `EventSessionDiff` / `FileDiff` | `packages/sdk/js/src/gen/types.gen.ts` |
| `session.error` | `EventSessionError` | `packages/sdk/js/src/gen/types.gen.ts` |
| `todo.updated` | `EventTodoUpdated` / `Todo` | `packages/sdk/js/src/gen/types.gen.ts` |
| `vcs.branch.updated` | `EventVcsBranchUpdated` | `packages/sdk/js/src/gen/types.gen.ts` |

### 文档内补充类型名

- 以下类型名只用于文档表达，不代表 SDK 额外导出同名类型。

| 文档类型名 | 来源 SDK 字段路径 | 说明 |
| --- | --- | --- |
| `SessionStatusIdle` | `SessionStatus` 成员 `type = "idle"` | 空闲分支 |
| `SessionStatusBusy` | `SessionStatus` 成员 `type = "busy"` | 忙碌分支 |
| `SessionStatusRetry` | `SessionStatus` 成员 `type = "retry"` | 重试分支 |
| `SessionSummary` | `Session.summary` | 会话摘要对象 |
| `SessionShare` | `Session.share` | 会话分享对象 |
| `SessionTime` | `Session.time` | 会话时间对象 |
| `SessionRevert` | `Session.revert` | 会话回滚对象 |
| `ProviderAuthErrorData` | `ProviderAuthError.data` | provider 鉴权错误数据 |
| `UnknownErrorData` | `UnknownError.data` | 未知错误数据 |
| `MessageAbortedErrorData` | `MessageAbortedError.data` | 中止错误数据 |
| `ApiErrorData` | `ApiError.data` | API 错误数据 |

### `Session`

| 字段 | 类型 | 必填性 | 说明 |
| --- | --- | --- | --- |
| `id` | `string` | 必填 | 会话 ID |
| `projectID` | `string` | 必填 | 所属项目 ID |
| `directory` | `string` | 必填 | 会话工作目录 |
| `parentID` | `string` | 可选 | 父会话 ID |
| `summary` | `SessionSummary` | 可选 | 会话摘要对象 |
| `share` | `SessionShare` | 可选 | 分享信息 |
| `title` | `string` | 必填 | 会话标题 |
| `version` | `string` | 必填 | 会话版本标识 |
| `time` | `SessionTime` | 必填 | 会话时间对象 |
| `revert` | `SessionRevert` | 可选 | 最近一次回滚相关信息 |

### `SessionSummary`

| 字段 | 类型 | 必填性 | 说明 |
| --- | --- | --- | --- |
| `additions` | `number` | 必填 | 新增行数 |
| `deletions` | `number` | 必填 | 删除行数 |
| `files` | `number` | 必填 | 受影响文件数量 |
| `diffs` | `FileDiff[]` | 可选 | 文件级 diff 列表 |

### `FileDiff`

| 字段 | 类型 | 必填性 | 说明 |
| --- | --- | --- | --- |
| `file` | `string` | 必填 | 发生变更的文件路径 |
| `before` | `string` | 必填 | 变更前内容摘要或文本 |
| `after` | `string` | 必填 | 变更后内容摘要或文本 |
| `additions` | `number` | 必填 | 新增行数 |
| `deletions` | `number` | 必填 | 删除行数 |

### `SessionShare`

| 字段 | 类型 | 必填性 | 说明 |
| --- | --- | --- | --- |
| `url` | `string` | 必填 | 可分享链接 |

### `SessionTime`

| 字段 | 类型 | 必填性 | 说明 |
| --- | --- | --- | --- |
| `created` | `number` | 必填 | 创建时间（毫秒） |
| `updated` | `number` | 必填 | 最近更新时间（毫秒） |
| `compacting` | `number` | 可选 | 压缩进行中的时间标记（毫秒） |

### `SessionRevert`

| 字段 | 类型 | 必填性 | 说明 |
| --- | --- | --- | --- |
| `messageID` | `string` | 必填 | 触发回滚的消息 ID |
| `partID` | `string` | 可选 | 触发回滚的 part ID |
| `snapshot` | `string` | 可选 | 关联快照标识 |
| `diff` | `string` | 可选 | 回滚 diff 文本 |

### `Todo`

| 字段 | 类型 | 必填性 | 说明 |
| --- | --- | --- | --- |
| `id` | `string` | 必填 | 待办项 ID |
| `content` | `string` | 必填 | 待办描述 |
| `status` | `string` | 必填 | 当前状态字符串 |
| `priority` | `string` | 必填 | 优先级字符串 |

### 版本治理规则

- 当 `packages/sdk/js/src/gen/types.gen.ts` 中的 `SessionStatus`、`Session`、`EventSessionError`、`Todo` 或 `EventVcsBranchUpdated` 结构变更时，必须同步更新本文件示例、字段表和附录。
