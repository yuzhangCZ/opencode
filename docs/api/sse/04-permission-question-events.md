# Permission / Question 事件

- Contract Baseline: `dev@cf425d114`
- Last Verified: `2026-03-06`
- Runtime Observed Version: `v1.2.15`
- Version Note Default: 未单独标注字段默认 `since v1.2.0`（以本文件 Contract Baseline 为准）


## `permission.asked`

- 稳定性: `contracted`
- 端点可见性: `/event`, `/global/event`
- payload: 

```json
{
  "type": "permission.asked",
  "properties": {
    "id": "string",
    "sessionID": "string",
    "permission": "string",
    "patterns": [
      "string"
    ],
    "always": [
      "string"
    ],
    "metadata": {},
    "tool": {
      "messageID": "string",
      "callID": "string"
    }
  }
}
```

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `properties.id` | `string` | 权限请求 ID |
| `properties.sessionID` | `string` | 会话 ID |
| `properties.permission` | `string` | 权限类型 |
| `properties.patterns` | `string[]` | 请求匹配范围 |
| `properties.always` | `string[]` | 可持久放行范围 |
| `properties.tool` | `object?` | 关联工具调用 |

- 真实报文示例:

```json
{
  "type": "permission.asked",
  "properties": {
    "id": "perm_001",
    "sessionID": "ses_3493ea0d5ffeyIpkiiH9FYGHFt",
    "permission": "edit",
    "patterns": [
      "/Users/zy/Code/opencode/opencode/docs/**"
    ],
    "always": [
      "/Users/zy/Code/opencode/opencode/docs/**"
    ],
    "metadata": {
      "tool": "apply_patch"
    },
    "tool": {
      "messageID": "msg_001",
      "callID": "call_001"
    }
  }
}
```

- 触发方式: 需要用户授权的工具调用。

## `permission.replied`

- 稳定性: `contracted`
- 端点可见性: `/event`, `/global/event`
- payload: 

```json
{
  "type": "permission.replied",
  "properties": {
    "sessionID": "string",
    "requestID": "string",
    "reply": "once|always|reject"
  }
}
```

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `properties.sessionID` | `string` | 会话 ID |
| `properties.requestID` | `string` | 请求 ID |
| `properties.reply` | `string` | `once`/`always`/`reject` |

- 真实报文示例:

```json
{
  "type": "permission.replied",
  "properties": {
    "sessionID": "ses_3493ea0d5ffeyIpkiiH9FYGHFt",
    "requestID": "perm_001",
    "reply": "once"
  }
}
```

- 触发方式: 调用权限回复接口或 UI 授权操作。

## `question.asked`

- 稳定性: `contracted`
- 端点可见性: `/event`, `/global/event`
- payload: 

```json
{
  "type": "question.asked",
  "properties": {
    "id": "string",
    "sessionID": "string",
    "questions": [
      {
        "header": "string",
        "question": "string",
        "options": [
          {
            "label": "string",
            "description": "string"
          }
        ],
        "multiple": false,
        "custom": true
      }
    ],
    "tool": {
      "messageID": "string",
      "callID": "string"
    }
  }
}
```

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `properties.id` | `string` | 提问请求 ID |
| `properties.questions` | `QuestionInfo[]` | 问题与选项列表 |
| `properties.tool` | `object?` | 来源工具调用 |

- 真实报文示例:

```json
{
  "type": "question.asked",
  "properties": {
    "id": "q_001",
    "sessionID": "ses_3493ea0d5ffeyIpkiiH9FYGHFt",
    "questions": [
      {
        "header": "文档位置",
        "question": "输出到哪个目录？",
        "options": [
          {
            "label": "docs/api",
            "description": "API 文档目录"
          }
        ],
        "multiple": false,
        "custom": true
      }
    ]
  }
}
```

- 触发方式: 需要用户选择输入时。

## `question.replied`

- 稳定性: `contracted`
- 端点可见性: `/event`, `/global/event`
- payload: 

```json
{
  "type": "question.replied",
  "properties": {
    "sessionID": "string",
    "requestID": "string",
    "answers": [
      [
        "string"
      ]
    ]
  }
}
```

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `properties.sessionID` | `string` | 会话 ID |
| `properties.requestID` | `string` | 请求 ID |
| `properties.answers` | `string[][]` | 每个问题的答案集合 |

- 真实报文示例:

```json
{
  "type": "question.replied",
  "properties": {
    "sessionID": "ses_3493ea0d5ffeyIpkiiH9FYGHFt",
    "requestID": "q_001",
    "answers": [
      [
        "docs/api"
      ]
    ]
  }
}
```

- 触发方式: 用户提交问题答案。

## `question.rejected`

- 稳定性: `contracted`
- 端点可见性: `/event`, `/global/event`
- payload: 

```json
{
  "type": "question.rejected",
  "properties": {
    "sessionID": "string",
    "requestID": "string"
  }
}
```

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `properties.sessionID` | `string` | 会话 ID |
| `properties.requestID` | `string` | 请求 ID |

- 真实报文示例:

```json
{
  "type": "question.rejected",
  "properties": {
    "sessionID": "ses_3493ea0d5ffeyIpkiiH9FYGHFt",
    "requestID": "q_001"
  }
}
```

- 触发方式: 用户拒绝回答。
