# Session 与 Message API

本文档按插件最常见的会话链路组织 v1 默认 client 能力。

## 1. `session.create`

### What it does

创建新会话。

### Server mapping

- SDK method: `client.session.create`
- `operationId`: `session.create`
- HTTP: `POST /session`

### Parameters

| 字段 | 位置 | 必填 | 说明 |
| --- | --- | --- | --- |
| `body.parentID` | body | 否 | 父会话 ID |
| `body.title` | body | 否 | 会话标题 |
| `query.directory` | query | 否 | 目录上下文，runtime 通常已自动注入 |

### Returns

返回 `Session` 对象。

### Request example

```json
{
  "body": {
    "title": "plugin demo"
  }
}
```

### Response example

以下为关键字段示例，不代表完整 `Session` 对象：

```json
{
  "id": "ses_demo",
  "title": "plugin demo"
}
```

### Errors / Pitfalls

- `400 BadRequestError`: body 不合法。

### v2 Differences

v2 改为：

```ts
client.session.create({ title: "plugin demo" })
```

## 2. `session.get` / `session.update` / `session.delete`

### `session.get`

- SDK method: `client.session.get`
- `operationId`: `session.get`
- HTTP: `GET /session/{sessionID}`

请求示例：

```json
{
  "path": {
    "id": "ses_demo"
  }
}
```

### `session.update`

- SDK method: `client.session.update`
- `operationId`: `session.update`
- HTTP: `PATCH /session/{sessionID}`

请求示例：

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

### `session.delete`

- SDK method: `client.session.delete`
- `operationId`: `session.delete`
- HTTP: `DELETE /session/{sessionID}`

### Errors / Pitfalls

- 当前 v1 path key 叫 `id`，不是 `sessionID`。
- 如果把 v2 风格直接写进插件，容易请求到字面 `/session/{id}`。

## 3. `session.list` / `session.status` / `session.children` / `session.todo`

| SDK method | `operationId` | HTTP |
| --- | --- | --- |
| `client.session.list` | `session.list` | `GET /session` |
| `client.session.status` | `session.status` | `GET /session/status` |
| `client.session.children` | `session.children` | `GET /session/{sessionID}/children` |
| `client.session.todo` | `session.todo` | `GET /session/{sessionID}/todo` |

### `session.messages`

- SDK method: `client.session.messages`
- `operationId`: `session.messages`
- HTTP: `GET /session/{sessionID}/message`

请求示例：

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

响应示例：

```json
[
  {
    "info": {
      "id": "msg_user",
      "sessionID": "ses_demo",
      "role": "user",
      "time": { "created": 1742371200000 },
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

| 字段 | 位置 | 必填 | 说明 |
| --- | --- | --- | --- |
| `path.id` | path | 是 | 会话 ID |
| `body.parts` | body | 是 | 输入 parts |
| `body.messageID` | body | 否 | 父消息 ID |
| `body.model` | body | 否 | 指定模型 |
| `body.agent` | body | 否 | 指定 agent |
| `body.noReply` | body | 否 | 不等待完整回复 |
| `body.system` | body | 否 | system prompt |
| `body.tools` | body | 否 | 工具可用性映射 |

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

以下为关键字段示例，不代表完整返回对象：

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
      "cache": { "read": 0, "write": 0 }
    },
    "time": { "created": 1742371201000 }
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

- `parts` 是必填。
- v1 参数形态必须写成 `path` + `body`。

### v2 Differences

v2 把 path/body 展平到一个参数对象，并新增 `format`、`variant` 等更完整字段。

## 5. `session.promptAsync`

### What it does

异步发消息，立即返回。

### Server mapping

- SDK method: `client.session.promptAsync`
- `operationId`: `session.prompt_async`
- HTTP: `POST /session/{sessionID}/prompt_async`

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

以下为关键字段示例；实际 HTTP 状态为 `204 No Content`：

```json
null
```

说明：

- v1 类型返回 `204`，没有响应体。

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

### Request example

```json
{
  "path": {
    "id": "ses_demo",
    "messageID": "msg_user"
  }
}
```

## 7. `session.command` / `session.shell`

### `session.command`

- SDK method: `client.session.command`
- `operationId`: `session.command`
- HTTP: `POST /session/{sessionID}/command`

请求示例：

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

- SDK method: `client.session.shell`
- `operationId`: `session.shell`
- HTTP: `POST /session/{sessionID}/shell`

请求示例：

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

### Errors / Pitfalls

- `session.shell` body 中当前 v1 `agent` 是必填。

## 8. 其他常用 session 方法

| SDK method | `operationId` | HTTP | 说明 |
| --- | --- | --- | --- |
| `client.session.fork` | `session.fork` | `POST /session/{sessionID}/fork` | 从指定消息分叉 |
| `client.session.abort` | `session.abort` | `POST /session/{sessionID}/abort` | 中止会话 |
| `client.session.share` | `session.share` | `POST /session/{sessionID}/share` | 生成分享 |
| `client.session.unshare` | `session.unshare` | `DELETE /session/{sessionID}/share` | 取消分享 |
| `client.session.diff` | `session.diff` | `GET /session/{sessionID}/diff` | 拉取文件 diff |
| `client.session.summarize` | `session.summarize` | `POST /session/{sessionID}/summarize` | 触发总结 |
| `client.session.revert` | `session.revert` | `POST /session/{sessionID}/revert` | 回滚消息影响 |
| `client.session.unrevert` | `session.unrevert` | `POST /session/{sessionID}/unrevert` | 恢复已回滚消息 |

## 9. Evidence

1. `packages/sdk/js/src/gen/sdk.gen.ts`
2. `packages/sdk/js/src/gen/types.gen.ts`
3. `packages/sdk/js/src/v2/gen/sdk.gen.ts`
4. `packages/opencode/src/server/routes/session.ts`
