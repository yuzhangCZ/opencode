# Permission / Question 接口

## 1. 分类说明

本页覆盖待处理权限请求和待处理问题请求。

- 默认稳定性：`Stable`
- 建议：新接入统一使用本页接口，不再使用 session 下已弃用的权限回复接口

## 2. 接口列表

| Method | Path | 说明 |
| --- | --- | --- |
| `GET` | `/permission` | 列出待处理权限请求 |
| `POST` | `/permission/{requestID}/reply` | 回复权限请求 |
| `GET` | `/question` | 列出待处理问题 |
| `POST` | `/question/{requestID}/reply` | 回答问题 |
| `POST` | `/question/{requestID}/reject` | 拒绝问题 |

## 3. 数据模型

### PermissionRequest

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | `string` | `per_*` |
| `sessionID` | `string` | 来源 session |
| `permission` | `string` | 权限名 |
| `patterns` | `string[]` | 命中的模式 |
| `metadata` | `object` | 附加信息 |
| `always` | `string[]` | 可设置为 always 的匹配 |
| `tool` | `object` | 工具调用上下文 |

### QuestionRequest

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | `string` | `que_*` |
| `sessionID` | `string` | 来源 session |
| `questions` | `QuestionInfo[]` | 问题数组 |
| `tool` | `object` | 工具调用上下文 |

## 4. 接口详情

### `GET /permission`

- 用途：列出所有待处理权限请求。

**response JSON**

```json
[
  {
    "id": "per_123",
    "sessionID": "ses_123",
    "permission": "fs.write",
    "patterns": ["docs/**"],
    "metadata": {
      "tool": "write_file"
    },
    "always": ["docs/**"]
  }
]
```

**curl**

```bash
curl -s 'http://localhost:4096/permission?directory=%2Fabs%2Frepo'
```

### `POST /permission/{requestID}/reply`

- 用途：批准或拒绝权限请求。

**Path 参数**

`requestID: string`

**请求体**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `reply` | `once \| always \| reject` | 是 | 回复动作 |
| `message` | `string` | 否 | 附加说明 |

**request JSON**

```json
{
  "reply": "once",
  "message": "Allow this write"
}
```

**response JSON**

```json
true
```

**curl**

```bash
curl -s -X POST 'http://localhost:4096/permission/per_123/reply?directory=%2Fabs%2Frepo' \
  -H 'content-type: application/json' \
  -d '{"reply":"once","message":"Allow this write"}'
```

### `GET /question`

- 用途：列出所有待处理问题。

**response JSON**

```json
[
  {
    "id": "que_123",
    "sessionID": "ses_123",
    "questions": [
      {
        "header": "Runtime",
        "question": "Which environment should be used?",
        "options": [
          {
            "label": "Node.js",
            "description": "Use Node runtime"
          }
        ]
      }
    ]
  }
]
```

**curl**

```bash
curl -s 'http://localhost:4096/question?directory=%2Fabs%2Frepo'
```

### `POST /question/{requestID}/reply`

- 用途：按题目顺序回填答案。

**请求体**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `answers` | `QuestionAnswer[]` | 是 | 每个问题一项，顺序对应 `questions` |

**request JSON**

```json
{
  "answers": [
    {
      "choices": ["Node.js"],
      "text": ""
    }
  ]
}
```

**response JSON**

```json
true
```

**curl**

```bash
curl -s -X POST 'http://localhost:4096/question/que_123/reply?directory=%2Fabs%2Frepo' \
  -H 'content-type: application/json' \
  -d '{"answers":[{"choices":["Node.js"],"text":""}]}'
```

### `POST /question/{requestID}/reject`

- 用途：拒绝当前问题请求。

**response JSON**

```json
true
```

**curl**

```bash
curl -s -X POST 'http://localhost:4096/question/que_123/reject?directory=%2Fabs%2Frepo'
```
