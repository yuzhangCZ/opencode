# Permission / Question 事件

- Contract Baseline: `dev@0cf2ef622`
- Contract Source: `packages/sdk/openapi.json`
- Runtime Source: `packages/opencode/src/permission/next.ts`, `packages/opencode/src/question/index.ts`
- Consumer Reference: `packages/app/src/context/global-sync/event-reducer.ts`
- Opencode Version: `1.2.18`
- Last Verified: `2026-03-23`
- Compatibility Note: `permission.asked`、`question.asked`、`question.replied`、`question.rejected` 以 SSE/OpenAPI/runtime 契约为准；这些事件并未完整出现在 `@opencode-ai/sdk` 根导出 v1 `Event` 联合中。

## 快速导航

- 如果你只关心权限请求，先看 [`permission.asked`](#permissionasked) 和 [`permission.replied`](#permissionreplied)。
- 如果你只关心交互式问题，先看 [`question.asked`](#questionasked)、[`question.replied`](#questionreplied)、[`question.rejected`](#questionrejected)。
- 如果你需要字段级类型定义，再看文末的“维护者附录”。

## `permission.asked`

- 稳定性: `contracted`
- 端点可见性: `/event`, `/global/event`
- payload（结构化示例，非完整字段）:

```json
{
  "type": "permission.asked",
  "properties": "<PermissionRequest>"
}
```

### 消费建议

1. `properties` 本身就是 `PermissionRequest`，不是再包一层 `info`。
2. `tool` 是可选字段；权限请求可能来自消息内工具调用，也可能没有工具来源。
3. `metadata` 是开放结构，消费方只应读取自己约定的键。

### 字段说明（`PermissionRequest`）

在 `permission.asked` 事件中，这些字段对应访问路径为 `properties.<field>`。

| 字段 | 类型 | 必填性 | 说明 |
| --- | --- | --- | --- |
| `id` | `string` | 必填 | 权限请求 ID |
| `sessionID` | `string` | 必填 | 会话 ID |
| `permission` | `string` | 必填 | 权限类型 |
| `patterns` | `string[]` | 必填 | 本次请求涉及的匹配范围 |
| `metadata` | `Record<string, unknown>` | 必填 | 附加上下文元数据 |
| `always` | `string[]` | 必填 | 用户选择“总是允许”时持久化的范围 |
| `tool` | `RequestToolRef` | 可选 | 关联工具调用引用 |

### 全字段示例

```json
{
  "type": "permission.asked",
  "properties": {
    "id": "per_001",
    "sessionID": "ses_001",
    "permission": "edit",
    "patterns": [
      "/Users/zy/Code/opencode/opencode/docs/**"
    ],
    "metadata": {
      "tool": "apply_patch",
      "reason": "update docs"
    },
    "always": [
      "/Users/zy/Code/opencode/opencode/docs/**"
    ],
    "tool": {
      "messageID": "msg_001",
      "callID": "call_001"
    }
  }
}
```

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

### 消费建议

1. `reply` 是必填字段，契约上不能省略。
2. `requestID` 对应 `permission.asked.properties.id`，不是旧权限系统里的 `permissionID`。
3. 如果你维护权限请求列表，收到该事件后应按 `requestID` 关闭对应请求。

| 字段 | 类型 | 必填性 | 说明 |
| --- | --- | --- | --- |
| `properties.sessionID` | `string` | 必填 | 会话 ID |
| `properties.requestID` | `string` | 必填 | 权限请求 ID |
| `properties.reply` | `PermissionReply` | 必填 | 用户对权限请求的回复 |

### 联合展开：PermissionReply

| 成员 | 值 | 说明 |
| --- | --- | --- |
| `PermissionReplyOnce` | `"once"` | 仅本次允许 |
| `PermissionReplyAlways` | `"always"` | 允许并持久化 |
| `PermissionReplyReject` | `"reject"` | 拒绝本次请求 |

### 全字段示例

```json
{
  "type": "permission.replied",
  "properties": {
    "sessionID": "ses_001",
    "requestID": "per_001",
    "reply": "once"
  }
}
```

## `question.asked`

- 稳定性: `contracted`
- 端点可见性: `/event`, `/global/event`
- payload（结构化示例，非完整字段）:

```json
{
  "type": "question.asked",
  "properties": "<QuestionRequest>"
}
```

### 消费建议

1. `properties.questions` 是按顺序消费的问题列表，后续 `answers` 也按这个顺序返回。
2. `QuestionInfo.multiple` 和 `QuestionInfo.custom` 都是可选字段；未提供时不要强行推断为固定布尔值。
3. `tool` 是可选字段，含义与 `permission.asked` 一致。

### 字段说明（`QuestionRequest`）

在 `question.asked` 事件中，这些字段对应访问路径为 `properties.<field>`。

| 字段 | 类型 | 必填性 | 说明 |
| --- | --- | --- | --- |
| `id` | `string` | 必填 | 提问请求 ID |
| `sessionID` | `string` | 必填 | 会话 ID |
| `questions` | `QuestionInfo[]` | 必填 | 待回答问题列表 |
| `tool` | `RequestToolRef` | 可选 | 关联工具调用引用 |

### 全字段示例

```json
{
  "type": "question.asked",
  "properties": {
    "id": "que_001",
    "sessionID": "ses_001",
    "questions": [
      {
        "question": "输出到哪个目录？",
        "header": "文档位置",
        "options": [
          {
            "label": "docs/api",
            "description": "API 文档目录"
          },
          {
            "label": "docs/guides",
            "description": "指南目录"
          }
        ],
        "multiple": false,
        "custom": true
      }
    ],
    "tool": {
      "messageID": "msg_002",
      "callID": "call_002"
    }
  }
}
```

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
    "answers": "<QuestionAnswer[]>"
  }
}
```

### 消费建议

1. `answers` 是二维数组，外层顺序与 `question.asked.properties.questions` 一一对应。
2. 每个 `QuestionAnswer` 都是 `string[]`，即使单选题也使用数组承载答案。
3. 如果某题允许自定义输入，自定义值也会以字符串形式出现在对应数组中。

| 字段 | 类型 | 必填性 | 说明 |
| --- | --- | --- | --- |
| `properties.sessionID` | `string` | 必填 | 会话 ID |
| `properties.requestID` | `string` | 必填 | 提问请求 ID |
| `properties.answers` | `QuestionAnswer[]` | 必填 | 按问题顺序返回的答案列表 |

### 全字段示例

```json
{
  "type": "question.replied",
  "properties": {
    "sessionID": "ses_001",
    "requestID": "que_001",
    "answers": [
      [
        "docs/api"
      ]
    ]
  }
}
```

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

### 消费建议

1. 该事件表示用户关闭或拒绝当前问题请求，不会附带 `answers`。
2. 收到该事件后，消费方应按 `requestID` 结束对应的交互状态。

| 字段 | 类型 | 必填性 | 说明 |
| --- | --- | --- | --- |
| `properties.sessionID` | `string` | 必填 | 会话 ID |
| `properties.requestID` | `string` | 必填 | 提问请求 ID |

### 全字段示例

```json
{
  "type": "question.rejected",
  "properties": {
    "sessionID": "ses_001",
    "requestID": "que_001"
  }
}
```

## 维护者附录

### 类型映射（文档 -> 契约来源）

| 文档小节 | 类型名 | 源码位置 |
| --- | --- | --- |
| `permission.asked` | `Event.permission.asked` / `PermissionRequest` | `packages/sdk/openapi.json`, `packages/opencode/src/permission/next.ts` |
| `permission.replied` | `Event.permission.replied` | `packages/sdk/openapi.json`, `packages/opencode/src/permission/next.ts` |
| `question.asked` | `Event.question.asked` / `QuestionRequest` | `packages/sdk/openapi.json`, `packages/opencode/src/question/index.ts` |
| `question.replied` | `Event.question.replied` / `QuestionAnswer` | `packages/sdk/openapi.json`, `packages/opencode/src/question/index.ts` |
| `question.rejected` | `Event.question.rejected` | `packages/sdk/openapi.json`, `packages/opencode/src/question/index.ts` |

### 文档内补充类型名

- 以下类型名只用于文档表达，不代表 SDK 额外导出同名类型。

| 文档类型名 | 来源字段路径 | 说明 |
| --- | --- | --- |
| `RequestToolRef` | `PermissionRequest.tool` / `QuestionRequest.tool` | 工具调用引用对象 |
| `PermissionReply` | `permission.replied.properties.reply` | 权限回复字面量联合 |
| `PermissionReplyOnce` | `PermissionReply` 成员 `"once"` | 单次允许 |
| `PermissionReplyAlways` | `PermissionReply` 成员 `"always"` | 持久允许 |
| `PermissionReplyReject` | `PermissionReply` 成员 `"reject"` | 拒绝请求 |

### `PermissionRequest`

| 字段 | 类型 | 必填性 | 说明 |
| --- | --- | --- | --- |
| `id` | `string` | 必填 | 权限请求 ID |
| `sessionID` | `string` | 必填 | 会话 ID |
| `permission` | `string` | 必填 | 权限类型 |
| `patterns` | `string[]` | 必填 | 本次请求作用范围 |
| `metadata` | `Record<string, unknown>` | 必填 | 附加上下文元数据 |
| `always` | `string[]` | 必填 | 持久授权时写入的范围列表 |
| `tool` | `RequestToolRef` | 可选 | 关联工具调用引用 |

### `RequestToolRef`

| 字段 | 类型 | 必填性 | 说明 |
| --- | --- | --- | --- |
| `messageID` | `string` | 必填 | 所属消息 ID |
| `callID` | `string` | 必填 | 工具调用 ID |

### `QuestionRequest`

| 字段 | 类型 | 必填性 | 说明 |
| --- | --- | --- | --- |
| `id` | `string` | 必填 | 提问请求 ID |
| `sessionID` | `string` | 必填 | 会话 ID |
| `questions` | `QuestionInfo[]` | 必填 | 问题列表 |
| `tool` | `RequestToolRef` | 可选 | 关联工具调用引用 |

### `QuestionInfo`

| 字段 | 类型 | 必填性 | 说明 |
| --- | --- | --- | --- |
| `question` | `string` | 必填 | 完整问题文本 |
| `header` | `string` | 必填 | 很短的问题标签 |
| `options` | `QuestionOption[]` | 必填 | 可选答案列表 |
| `multiple` | `boolean` | 可选 | 是否允许多选 |
| `custom` | `boolean` | 可选 | 是否允许自定义输入 |

### `QuestionOption`

| 字段 | 类型 | 必填性 | 说明 |
| --- | --- | --- | --- |
| `label` | `string` | 必填 | 选项展示文本 |
| `description` | `string` | 必填 | 选项说明 |

### `QuestionAnswer`

| 字段 | 类型 | 必填性 | 说明 |
| --- | --- | --- | --- |
| `[index]` | `string` | 必填 | 单个被选中或输入的答案值 |

### 版本治理规则

- 当 `packages/sdk/openapi.json`、`packages/opencode/src/permission/next.ts`、`packages/opencode/src/question/index.ts` 中的 `PermissionRequest`、`QuestionRequest`、`QuestionInfo`、`QuestionAnswer` 或相关事件结构变更时，必须同步更新本文件示例、字段表和附录。
