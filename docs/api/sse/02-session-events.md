# Session 事件

- Contract Baseline: `dev@cf425d114`
- Last Verified: `2026-03-06`
- Runtime Observed Version: `v1.2.15`
- Version Note Default: 未单独标注字段默认 `since v1.2.0`（以本文件 Contract Baseline 为准）


## `session.status`

- 稳定性: `contracted`
- 端点可见性: `/event`, `/global/event`
- payload 结构:

```json
{
  "type": "session.status",
  "properties": {
    "sessionID": "string",
    "status": {
      "type": "idle|busy|retry"
    }
  }
}
```

- 字段说明:

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `properties.sessionID` | `string` | 会话 ID |
| `properties.status.type` | `string` | `idle`/`busy`/`retry` |
| `properties.status.attempt` | `number?` | 重试次数（`retry` 时） |
| `properties.status.next` | `number?` | 下次重试时间戳（`retry` 时） |

- 真实报文示例:

```json
{
  "type": "session.status",
  "properties": {
    "sessionID": "ses_3493ea0d5ffeyIpkiiH9FYGHFt",
    "status": {
      "type": "busy"
    }
  }
}
```

- 触发方式: 消息执行进入/退出忙碌状态（`session/status.ts`）。

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

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `properties.sessionID` | `string` | 会话 ID |

- 真实报文示例:

```json
{
  "type": "session.idle",
  "properties": {
    "sessionID": "ses_3493ea0d5ffeyIpkiiH9FYGHFt"
  }
}
```

- 触发方式: 会话回到空闲状态。

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

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `properties.sessionID` | `string` | 被压缩会话 ID |

- 真实报文示例:

```json
{
  "type": "session.compacted",
  "properties": {
    "sessionID": "ses_3493ea0d5ffeyIpkiiH9FYGHFt"
  }
}
```

- 触发方式: 执行会话压缩。

## `session.created`

- 稳定性: `contracted`
- 端点可见性: `/event`, `/global/event`
- payload 结构:

```json
{
  "type": "session.created",
  "properties": {
    "info": {
      "id": "string",
      "title": "string",
      "time": {
        "created": 0,
        "updated": 0
      }
    }
  }
}
```

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `properties.info.id` | `string` | 会话 ID |
| `properties.info.title` | `string` | 会话标题 |
| `properties.info.directory` | `string` | 工作目录 |
| `properties.info.time` | `object` | 创建/更新时间 |

- 真实报文示例（本地抓流，2026-03-04）:

```text
data: {"type":"session.created","properties":{"info":{"id":"ses_3493ea0d5ffeyIpkiiH9FYGHFt","slug":"silent-island","version":"local","projectID":"4b0ea68d7af9a6031a7ffda7ad66e0cb83315750","directory":"/Users/zy/Code/opencode/opencode/packages/opencode","title":"New session - 2026-03-04T02:50:52.074Z","time":{"created":1772592652074,"updated":1772592652074}}}}
```

- 触发方式: 新建会话。

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

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `properties.info` | `Session` | 更新后的会话对象 |

- 真实报文示例:

```json
{
  "type": "session.updated",
  "properties": {
    "info": {
      "id": "ses_3493ea0d5ffeyIpkiiH9FYGHFt",
      "title": "Refactor SSE docs",
      "time": {
        "created": 1772592652074,
        "updated": 1772593102000
      }
    }
  }
}
```

- 触发方式: 会话元数据变化。

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

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `properties.info.id` | `string` | 被删除会话 ID |

- 真实报文示例:

```json
{
  "type": "session.deleted",
  "properties": {
    "info": {
      "id": "ses_archive_01",
      "title": "Old Session"
    }
  }
}
```

- 触发方式: 删除/归档流程。

## `session.diff`

- 稳定性: `contracted`
- 端点可见性: `/event`, `/global/event`
- payload: 

```json
{
  "type": "session.diff",
  "properties": {
    "sessionID": "string",
    "diff": [
      {
        "file": "string",
        "before": "string",
        "after": "string",
        "additions": 0,
        "deletions": 0
      }
    ]
  }
}
```

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `properties.sessionID` | `string` | 会话 ID |
| `properties.diff` | `FileDiff[]` | 文件级 diff 列表 |

- 真实报文示例:

```json
{
  "type": "session.diff",
  "properties": {
    "sessionID": "ses_3493ea0d5ffeyIpkiiH9FYGHFt",
    "diff": [
      {
        "file": "docs/api/02-sse-reference.md",
        "before": "...",
        "after": "...",
        "additions": 20,
        "deletions": 3
      }
    ]
  }
}
```

- 触发方式: 回滚或摘要路径产出 diff。

## `session.error`

- 稳定性: `contracted`
- 端点可见性: `/event`, `/global/event`
- payload: 

```json
{
  "type": "session.error",
  "properties": {
    "sessionID": "string?",
    "error": {
      "name": "UnknownError",
      "data": {
        "message": "string"
      }
    }
  }
}
```

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `properties.sessionID` | `string?` | 关联会话 |
| `properties.error` | `ErrorUnion?` | Provider/上下文/通用错误 |

- 真实报文示例:

```json
{
  "type": "session.error",
  "properties": {
    "sessionID": "ses_3493ea0d5ffeyIpkiiH9FYGHFt",
    "error": {
      "name": "UnknownError",
      "data": {
        "message": "Model request failed"
      }
    }
  }
}
```

- 触发方式: 推理/工具/配置等异常路径。

## `todo.updated`

- 稳定性: `contracted`
- 端点可见性: `/event`, `/global/event`
- payload: 

```json
{
  "type": "todo.updated",
  "properties": {
    "sessionID": "string",
    "todos": [
      {
        "id": "string",
        "content": "string",
        "status": "string",
        "priority": "string"
      }
    ]
  }
}
```

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `properties.sessionID` | `string` | 会话 ID |
| `properties.todos` | `Todo[]` | 待办列表 |

- 真实报文示例:

```json
{
  "type": "todo.updated",
  "properties": {
    "sessionID": "ses_3493ea0d5ffeyIpkiiH9FYGHFt",
    "todos": [
      {
        "id": "todo_1",
        "content": "Split SSE docs",
        "status": "in_progress",
        "priority": "high"
      }
    ]
  }
}
```

- 触发方式: todo 工具更新计划。

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

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `properties.branch` | `string?` | 当前分支名 |

- 真实报文示例:

```json
{
  "type": "vcs.branch.updated",
  "properties": {
    "branch": "codex/sse-doc-split"
  }
}
```

- 触发方式: 分支切换或监听更新。
