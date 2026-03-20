# Session 接口

## 1. 分类说明

本页覆盖所有 `/session*` JSON HTTP 接口。

- 默认稳定性：`Stable`
- 备注：`POST /session/{sessionID}/message` 会以 `application/json` 方式返回结果，但实现上使用 stream 写出；`POST /session/{sessionID}/prompt_async` 返回 `204`
- 相关流式能力：实例事件流见 [../02-sse-reference.md](../02-sse-reference.md)

## 2. 接口列表

| Method | Path | 说明 |
| --- | --- | --- |
| `GET` | `/session` | 列出 session |
| `POST` | `/session` | 创建 session |
| `GET` | `/session/status` | 获取状态映射 |
| `GET` | `/session/{sessionID}` | 获取 session |
| `DELETE` | `/session/{sessionID}` | 删除 session |
| `PATCH` | `/session/{sessionID}` | 更新 session |
| `GET` | `/session/{sessionID}/children` | 列出子 session |
| `GET` | `/session/{sessionID}/todo` | 获取 todo |
| `POST` | `/session/{sessionID}/init` | 初始化 |
| `POST` | `/session/{sessionID}/fork` | fork |
| `POST` | `/session/{sessionID}/abort` | 中止 |
| `POST` | `/session/{sessionID}/share` | 分享 |
| `DELETE` | `/session/{sessionID}/share` | 取消分享 |
| `GET` | `/session/{sessionID}/diff` | 获取 diff |
| `POST` | `/session/{sessionID}/summarize` | 总结 |
| `GET` | `/session/{sessionID}/message` | 列消息 |
| `POST` | `/session/{sessionID}/message` | 发送 prompt |
| `GET` | `/session/{sessionID}/message/{messageID}` | 获取单条消息 |
| `DELETE` | `/session/{sessionID}/message/{messageID}` | 删除消息 |
| `DELETE` | `/session/{sessionID}/message/{messageID}/part/{partID}` | 删除 part |
| `PATCH` | `/session/{sessionID}/message/{messageID}/part/{partID}` | 更新 part |
| `POST` | `/session/{sessionID}/prompt_async` | 异步 prompt |
| `POST` | `/session/{sessionID}/command` | 发送命令 |
| `POST` | `/session/{sessionID}/shell` | 执行 shell |
| `POST` | `/session/{sessionID}/revert` | 回滚 |
| `POST` | `/session/{sessionID}/unrevert` | 取消回滚 |
| `POST` | `/session/{sessionID}/permissions/{permissionID}` | 已弃用权限回复 |

## 3. 相关数据模型文档

本页只说明 `/session*` 接口如何调用。返回对象的结构请看以下文档：

- [Session 数据模型](./03-session-models.md)
- [Session 数据模型字段参考](./04-session-model-reference.md)

职责边界：

- API 页回答“怎么调接口”
- 模型导读页回答“怎么理解返回结构”
- 字段参考页回答“字段和类型到底长什么样”

## 4. 接口详情

### `GET /session`

- 用途：按更新时间倒序列出 session。

**Query 参数**

| 名称 | 类型 | 说明 |
| --- | --- | --- |
| `directory` | `string` | 按项目目录过滤 |
| `roots` | `boolean` | 只看根 session |
| `start` | `number` | 仅返回更新时间大于等于此时间戳的 session |
| `search` | `string` | 按标题模糊匹配 |
| `limit` | `number` | 数量上限 |

**response JSON**

```json
[
  {
    "id": "ses_123",
    "slug": "demo",
    "projectID": "prj_123",
    "directory": "/Users/zy/Code/opencode/opencode",
    "title": "Fix bug",
    "version": "1",
    "time": {
      "created": 1742340000000,
      "updated": 1742341000000
    }
  }
]
```

**curl**

```bash
curl -s 'http://localhost:4096/session?directory=%2Fabs%2Frepo&limit=20&roots=true'
```

### `POST /session`

- 用途：创建 session。

**请求体**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `parentID` | `string` | 否 | 父 session |
| `title` | `string` | 否 | 标题 |
| `permission` | `PermissionRuleset` | 否 | 会话级权限 |

**request JSON**

```json
{
  "title": "Investigate test failure"
}
```

**curl**

```bash
curl -s -X POST 'http://localhost:4096/session?directory=%2Fabs%2Frepo' \
  -H 'content-type: application/json' \
  -d '{"title":"Investigate test failure"}'
```

### `GET /session/status`

- 用途：返回 sessionID 到状态的映射。

**response JSON**

```json
{
  "ses_123": {
    "type": "idle"
  }
}
```

**curl**

```bash
curl -s 'http://localhost:4096/session/status?directory=%2Fabs%2Frepo'
```

### `GET /session/{sessionID}`

- 用途：读取单个 session。

**response JSON**

```json
{
  "id": "ses_123",
  "slug": "demo",
  "projectID": "prj_123",
  "directory": "/Users/zy/Code/opencode/opencode",
  "title": "Fix bug",
  "version": "1",
  "time": {
    "created": 1742340000000,
    "updated": 1742341000000
  }
}
```

**curl**

```bash
curl -s 'http://localhost:4096/session/ses_123?directory=%2Fabs%2Frepo'
```

### `DELETE /session/{sessionID}`

- 用途：永久删除 session。

**response JSON**

```json
true
```

**curl**

```bash
curl -s -X DELETE 'http://localhost:4096/session/ses_123?directory=%2Fabs%2Frepo'
```

### `PATCH /session/{sessionID}`

- 用途：更新标题或归档时间。

**请求体**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `title` | `string` | 新标题 |
| `time.archived` | `number` | 归档时间戳 |

**request JSON**

```json
{
  "title": "Renamed session",
  "time": {
    "archived": 1742343000000
  }
}
```

**response JSON**

```json
{
  "id": "ses_123",
  "title": "Renamed session",
  "time": {
    "created": 1742340000000,
    "updated": 1742342000000,
    "archived": 1742343000000
  }
}
```

**curl**

```bash
curl -s -X PATCH 'http://localhost:4096/session/ses_123?directory=%2Fabs%2Frepo' \
  -H 'content-type: application/json' \
  -d '{"title":"Renamed session","time":{"archived":1742343000000}}'
```

### `GET /session/{sessionID}/children`

- 用途：列出 fork 出来的子 session。

**response JSON**

```json
[
  {
    "id": "ses_child_1",
    "parentID": "ses_123",
    "title": "Forked branch",
    "directory": "/Users/zy/Code/opencode/opencode",
    "version": "1",
    "time": {
      "created": 1742342000000,
      "updated": 1742342000000
    }
  }
]
```

**curl**

```bash
curl -s 'http://localhost:4096/session/ses_123/children?directory=%2Fabs%2Frepo'
```

### `GET /session/{sessionID}/todo`

- 用途：返回 todo 列表。

**response JSON**

```json
[
  {
    "content": "Reproduce the bug",
    "status": "in_progress",
    "priority": "high"
  }
]
```

**curl**

```bash
curl -s 'http://localhost:4096/session/ses_123/todo?directory=%2Fabs%2Frepo'
```

### `POST /session/{sessionID}/init`

- 用途：分析项目并生成初始化内容，如 `AGENTS.md`。

**请求体**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `providerID` | `string` | 是 | 模型 provider |
| `modelID` | `string` | 是 | 模型 ID |
| `messageID` | `string` | 是 | 触发消息 ID |

**request JSON**

```json
{
  "providerID": "openai",
  "modelID": "gpt-5.4",
  "messageID": "msg_123"
}
```

**response JSON**

```json
true
```

**curl**

```bash
curl -s -X POST 'http://localhost:4096/session/ses_123/init?directory=%2Fabs%2Frepo' \
  -H 'content-type: application/json' \
  -d '{"providerID":"openai","modelID":"gpt-5.4","messageID":"msg_123"}'
```

### `POST /session/{sessionID}/fork`

- 用途：从指定消息位置 fork。

**请求体**

```json
{
  "messageID": "msg_123"
}
```

**response JSON**

```json
{
  "id": "ses_fork_1",
  "parentID": "ses_123",
  "title": "Fix bug",
  "directory": "/Users/zy/Code/opencode/opencode",
  "version": "1",
  "time": {
    "created": 1742342000000,
    "updated": 1742342000000
  }
}
```

**curl**

```bash
curl -s -X POST 'http://localhost:4096/session/ses_123/fork?directory=%2Fabs%2Frepo' \
  -H 'content-type: application/json' \
  -d '{"messageID":"msg_123"}'
```

### `POST /session/{sessionID}/abort`

- 用途：中止当前生成循环。

**response JSON**

```json
true
```

**curl**

```bash
curl -s -X POST 'http://localhost:4096/session/ses_123/abort?directory=%2Fabs%2Frepo'
```

### `POST /session/{sessionID}/share`

- 用途：生成分享链接。

**response JSON**

```json
{
  "id": "ses_123",
  "share": {
    "url": "https://app.opencode.ai/s/abc"
  }
}
```

**curl**

```bash
curl -s -X POST 'http://localhost:4096/session/ses_123/share?directory=%2Fabs%2Frepo'
```

### `DELETE /session/{sessionID}/share`

- 用途：撤销分享链接。

**response JSON**

```json
{
  "id": "ses_123",
  "title": "Fix bug",
  "version": "1",
  "time": {
    "created": 1742340000000,
    "updated": 1742342500000
  }
}
```

**curl**

```bash
curl -s -X DELETE 'http://localhost:4096/session/ses_123/share?directory=%2Fabs%2Frepo'
```

### `GET /session/{sessionID}/diff`

- 用途：返回某条消息导致的文件 diff。

**Query 参数**

| 名称 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `messageID` | `string` | 是 | 用户消息 ID |

**response JSON**

```json
[
  {
    "path": "src/index.ts",
    "added": 12,
    "removed": 2
  }
]
```

**curl**

```bash
curl -s 'http://localhost:4096/session/ses_123/diff?directory=%2Fabs%2Frepo&messageID=msg_123'
```

### `POST /session/{sessionID}/summarize`

- 用途：触发 compaction/summarize。

**请求体**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `providerID` | `string` | 是 | provider |
| `modelID` | `string` | 是 | model |
| `auto` | `boolean` | 否 | 是否自动触发 |

**request JSON**

```json
{
  "providerID": "openai",
  "modelID": "gpt-5.4",
  "auto": false
}
```

**response JSON**

```json
true
```

**curl**

```bash
curl -s -X POST 'http://localhost:4096/session/ses_123/summarize?directory=%2Fabs%2Frepo' \
  -H 'content-type: application/json' \
  -d '{"providerID":"openai","modelID":"gpt-5.4","auto":false}'
```

### `GET /session/{sessionID}/message`

- 用途：获取消息列表。

**Query 参数**

| 名称 | 类型 | 说明 |
| --- | --- | --- |
| `limit` | `number` | 返回条数上限 |

**response JSON**

```json
[
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
        "id": "prt_1",
        "type": "text",
        "text": "Fix the failing tests"
      }
    ]
  }
]
```

### `POST /session/{sessionID}/message`

- 用途：发送 prompt 并返回 assistant message 结果。

**请求体**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `parts` | `PartInput[]` | 是 | 输入内容 |
| `messageID` | `string` | 否 | 指定消息 ID |
| `model.providerID` | `string` | 否 | 指定 provider |
| `model.modelID` | `string` | 否 | 指定 model |
| `agent` | `string` | 否 | 指定 agent |
| `noReply` | `boolean` | 否 | 只写入不回复 |
| `format` | `OutputFormat` | 否 | 结构化输出 |
| `system` | `string` | 否 | 额外 system prompt |
| `variant` | `string` | 否 | 变体 |

`parts` 常见输入：

- `{"type":"text","text":"..."}`
- `{"type":"file","mime":"text/plain","url":"file:///..."}`
- `{"type":"agent","name":"build"}`
- `{"type":"subtask","prompt":"...","description":"...","agent":"build"}`

**request JSON**

```json
{
  "agent": "build",
  "parts": [
    {
      "type": "text",
      "text": "Fix the failing tests"
    }
  ]
}
```

**response JSON**

```json
{
  "info": {
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
      "reasoning": 0,
      "cache": {
        "read": 0,
        "write": 0
      }
    }
  },
  "parts": [
    {
      "id": "prt_2",
      "sessionID": "ses_123",
      "messageID": "msg_asst_1",
      "type": "text",
      "text": "I fixed the tests."
    }
  ]
}
```

**curl**

```bash
curl -s -X POST 'http://localhost:4096/session/ses_123/message?directory=%2Fabs%2Frepo' \
  -H 'content-type: application/json' \
  -d '{"agent":"build","parts":[{"type":"text","text":"Fix the failing tests"}]}'
```

### `GET /session/{sessionID}/message/{messageID}`

- 用途：读取单条消息和全部 parts。

**response JSON**

```json
{
  "info": {
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
      "reasoning": 0,
      "cache": {
        "read": 0,
        "write": 0
      }
    }
  },
  "parts": [
    {
      "id": "prt_2",
      "sessionID": "ses_123",
      "messageID": "msg_asst_1",
      "type": "text",
      "text": "I fixed the tests."
    }
  ]
}
```

**curl**

```bash
curl -s 'http://localhost:4096/session/ses_123/message/msg_asst_1?directory=%2Fabs%2Frepo'
```

### `DELETE /session/{sessionID}/message/{messageID}`

- 用途：删除消息，不自动回滚文件变更。

**response JSON**

```json
true
```

**curl**

```bash
curl -s -X DELETE 'http://localhost:4096/session/ses_123/message/msg_asst_1?directory=%2Fabs%2Frepo'
```

### `DELETE /session/{sessionID}/message/{messageID}/part/{partID}`

- 用途：删除消息中的单个 part。

**response JSON**

```json
true
```

**curl**

```bash
curl -s -X DELETE 'http://localhost:4096/session/ses_123/message/msg_asst_1/part/prt_2?directory=%2Fabs%2Frepo'
```

### `PATCH /session/{sessionID}/message/{messageID}/part/{partID}`

- 用途：更新整个 part 对象。

**请求体**

请求体必须是完整 `Part`，且 `id` / `messageID` / `sessionID` 必须与 path 对齐。

**request JSON**

```json
{
  "id": "prt_2",
  "sessionID": "ses_123",
  "messageID": "msg_asst_1",
  "type": "text",
  "text": "Updated content"
}
```

**response JSON**

```json
{
  "id": "prt_2",
  "sessionID": "ses_123",
  "messageID": "msg_asst_1",
  "type": "text",
  "text": "Updated content"
}
```

**curl**

```bash
curl -s -X PATCH 'http://localhost:4096/session/ses_123/message/msg_asst_1/part/prt_2?directory=%2Fabs%2Frepo' \
  -H 'content-type: application/json' \
  -d '{"id":"prt_2","sessionID":"ses_123","messageID":"msg_asst_1","type":"text","text":"Updated content"}'
```

### `POST /session/{sessionID}/prompt_async`

- 用途：异步提交 prompt，立即返回 `204 No Content`。

**请求体**

与 `POST /session/{sessionID}/message` 相同。

**curl**

```bash
curl -i -X POST 'http://localhost:4096/session/ses_123/prompt_async?directory=%2Fabs%2Frepo' \
  -H 'content-type: application/json' \
  -d '{"parts":[{"type":"text","text":"Run in background"}]}'
```

### `POST /session/{sessionID}/command`

- 用途：执行命令型 prompt。

**请求体**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `command` | `string` | 是 | 命令名 |
| `arguments` | `string` | 是 | 命令参数文本 |
| `agent` | `string` | 否 | 指定 agent |
| `model` | `string` | 否 | 指定模型字符串 |
| `variant` | `string` | 否 | 变体 |
| `parts` | `file-part[]` | 否 | 文件附件 |

**request JSON**

```json
{
  "command": "fix",
  "arguments": "tests in packages/opencode",
  "agent": "build"
}
```

**response JSON**

```json
{
  "info": {
    "id": "msg_asst_2",
    "sessionID": "ses_123",
    "role": "assistant",
    "parentID": "msg_user_2",
    "providerID": "openai",
    "modelID": "gpt-5.4",
    "mode": "build",
    "agent": "build",
    "path": {
      "cwd": "/Users/zy/Code/opencode/opencode",
      "root": "/Users/zy/Code/opencode/opencode"
    },
    "time": {
      "created": 1742340200000
    },
    "cost": 0.01,
    "tokens": {
      "input": 50,
      "output": 100,
      "reasoning": 0,
      "cache": {
        "read": 0,
        "write": 0
      }
    }
  },
  "parts": []
}
```

**curl**

```bash
curl -s -X POST 'http://localhost:4096/session/ses_123/command?directory=%2Fabs%2Frepo' \
  -H 'content-type: application/json' \
  -d '{"command":"fix","arguments":"tests in packages/opencode","agent":"build"}'
```

### `POST /session/{sessionID}/shell`

- 用途：执行 shell 命令并生成 assistant 回复。

**请求体**

```json
{
  "agent": "build",
  "command": "bun test",
  "model": {
    "providerID": "openai",
    "modelID": "gpt-5.4"
  }
}
```

**response JSON**

```json
{
  "id": "msg_asst_3",
  "sessionID": "ses_123",
  "role": "assistant",
  "parentID": "msg_user_3",
  "providerID": "openai",
  "modelID": "gpt-5.4",
  "mode": "build",
  "agent": "build",
  "path": {
    "cwd": "/Users/zy/Code/opencode/opencode",
    "root": "/Users/zy/Code/opencode/opencode"
  },
  "time": {
    "created": 1742340300000
  },
  "cost": 0.01,
  "tokens": {
    "input": 40,
    "output": 80,
    "reasoning": 0,
    "cache": {
      "read": 0,
      "write": 0
    }
  }
}
```

**curl**

```bash
curl -s -X POST 'http://localhost:4096/session/ses_123/shell?directory=%2Fabs%2Frepo' \
  -H 'content-type: application/json' \
  -d '{"agent":"build","command":"bun test","model":{"providerID":"openai","modelID":"gpt-5.4"}}'
```

### `POST /session/{sessionID}/revert`

- 用途：按消息或消息 part 回滚。

**请求体**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `messageID` | `string` | 是 | 目标消息 |
| `partID` | `string` | 否 | 精确到 part |

**request JSON**

```json
{
  "messageID": "msg_asst_1",
  "partID": "prt_2"
}
```

**response JSON**

```json
{
  "id": "ses_123",
  "revert": {
    "messageID": "msg_asst_1",
    "partID": "prt_2"
  }
}
```

**curl**

```bash
curl -s -X POST 'http://localhost:4096/session/ses_123/revert?directory=%2Fabs%2Frepo' \
  -H 'content-type: application/json' \
  -d '{"messageID":"msg_asst_1","partID":"prt_2"}'
```

### `POST /session/{sessionID}/unrevert`

- 用途：恢复全部已回滚内容。

**response JSON**

```json
{
  "id": "ses_123",
  "title": "Fix bug",
  "version": "1",
  "time": {
    "created": 1742340000000,
    "updated": 1742344000000
  }
}
```

**curl**

```bash
curl -s -X POST 'http://localhost:4096/session/ses_123/unrevert?directory=%2Fabs%2Frepo'
```

### `POST /session/{sessionID}/permissions/{permissionID}`

- Stability: `Stable`
- Deprecated: `true`
- 用途：旧的权限回复接口。新接入应改用 `/permission/{requestID}/reply`。

**请求体**

```json
{
  "response": "once"
}
```

**response JSON**

```json
true
```

**curl**

```bash
curl -s -X POST 'http://localhost:4096/session/ses_123/permissions/per_123?directory=%2Fabs%2Frepo' \
  -H 'content-type: application/json' \
  -d '{"response":"once"}'
```
