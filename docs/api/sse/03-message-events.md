# Message 事件

- Contract Baseline: `dev@cf425d114`
- Last Verified: `2026-03-06`
- Runtime Observed Version: `v1.2.15`
- Version Note Default: 未单独标注字段默认 `since v1.2.0`（以本文件 Contract Baseline 为准）


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

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `properties.info.id` | `string` | 消息 ID |
| `properties.info.sessionID` | `string` | 所属会话 ID |
| `properties.info.role` | `"user" | "assistant"` | 消息角色 |
| `properties.info.time.created` | `number` | 消息创建时间（毫秒） |
| `properties.info.time.completed` | `number?` | 消息完成时间（毫秒） |
| `properties.info.finish` | `string?` | 模型完成原因（完成阶段常见） |
| `properties.info.tokens` | `object?` | token 收敛统计（assistant 消息常见） |
| `properties.info.cost` | `number?` | 成本（assistant 消息常见） |

- 字段判定矩阵（基于 `Message = UserMessage | AssistantMessage`）:

| 字段 | 适用范围 | 判定 | 说明 |
| --- | --- | --- |
| `properties.info.parentID` | `assistant` | 条件必填（assistant） | 上游消息 ID |
| `properties.info.modelID` | `assistant` | 条件必填（assistant） | 实际使用模型 ID |
| `properties.info.providerID` | `assistant` | 条件必填（assistant） | 模型提供商 ID |
| `properties.info.mode` | `assistant` | 条件必填（assistant） | 响应模式 |
| `properties.info.agent` | `user` + `assistant` | 契约必填 | 处理该消息的 agent 标识 |
| `properties.info.model.providerID` | `user` | 条件必填（user） | 用户消息模型提供商 ID（`UserMessage.model`） |
| `properties.info.model.modelID` | `user` | 条件必填（user） | 用户消息模型 ID（`UserMessage.model`） |
| `properties.info.system` | `user` | 可选 | 用户消息的系统提示词 |
| `properties.info.tools` | `user` | 可选 | 用户消息携带的工具开关映射 |
| `properties.info.path.cwd` | `assistant` | 条件必填（assistant） | 执行上下文工作目录 |
| `properties.info.path.root` | `assistant` | 条件必填（assistant） | 执行上下文根目录 |
| `properties.info.tokens.input/output/reasoning` | `assistant` | 条件必填（assistant） | token 统计；常在完成阶段收敛为最终值 |
| `properties.info.tokens.cache.read/write` | `assistant` | 条件必填（assistant） | 缓存 token 读写统计 |
| `properties.info.error` | `assistant` | 可选 | 失败场景错误对象 |

- 报文示例（结构化示例）:

```json
{
  "type": "message.updated",
  "properties": {
    "info": {
      "id": "msg_001",
      "sessionID": "ses_001",
      "role": "assistant",
      "parentID": "msg_user_001",
      "modelID": "claude-3-5-sonnet",
      "providerID": "anthropic",
      "mode": "chat",
      "agent": "build",
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
        "created": 1772593200000
      }
    }
  }
}
```

该示例为 `AssistantMessage` 分支。`UserMessage` 最小结构示意（结构化示例）：

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
      "agent": "build",
      "model": {
        "providerID": "anthropic",
        "modelID": "claude-3-5-sonnet"
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

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `properties.sessionID` | `string` | 会话 ID |
| `properties.messageID` | `string` | 被删除消息 ID |

- 报文示例（结构化示例）:

```json
{
  "type": "message.removed",
  "properties": {
    "sessionID": "ses_001",
    "messageID": "msg_001"
  }
}
```

- 触发方式: 撤销、回滚或清理消息。

## `message.part.updated`

- 稳定性: `contracted`
- 端点可见性: `/event`, `/global/event`
- payload（结构化示例，非完整字段）:

```json
{
  "type": "message.part.updated",
  "properties": {
    "part": "<Part>",
    "delta": "string?"
  }
}
```

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `properties.part.id` | `string` | part ID |
| `properties.part.sessionID` | `string` | 所属会话 ID |
| `properties.part.messageID` | `string` | 所属消息 ID |
| `properties.part.type` | `string` | part 类型（`text`/`reasoning`/`tool`/...） |
| `properties.delta` | `string?` | 可选增量文本字段 |

### `part.type = "text"`（对话文本）

- payload 最小结构:

```json
{
  "type": "message.part.updated",
  "properties": {
    "part": {
      "id": "prt_txt_1",
      "sessionID": "ses_001",
      "messageID": "msg_001",
      "type": "text",
      "text": "你好"
    }
  }
}
```

- 字段说明:
| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `part.text` | `string` | 当前文本快照 |
| `delta` | `string?` | 本帧新增片段（可选） |
| `part.time` | `object?` | 文本段时间信息（可选） |

`part.time` 字段结构（若存在）：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `part.time.start` | `number` | 文本段开始时间（毫秒） |
| `part.time.end` | `number?` | 文本段结束时间（毫秒） |

- 开始帧示例（结构化示例）:

```json
{
  "type": "message.part.updated",
  "properties": {
    "part": {
      "id": "prt_txt_1",
      "sessionID": "ses_001",
      "messageID": "msg_001",
      "type": "text",
      "text": "你好"
    }
  }
}
```

- 进行中帧示例（结构化示例）:

```json
{
  "type": "message.part.updated",
  "properties": {
    "part": {
      "id": "prt_txt_1",
      "sessionID": "ses_001",
      "messageID": "msg_001",
      "type": "text",
      "text": "你好，我来帮你拆分文档。"
    },
    "delta": "，我来帮你拆分文档。"
  }
}
```

### `part.type = "reasoning"`（think）

- payload 最小结构:

```json
{
  "type": "message.part.updated",
  "properties": {
    "part": {
      "id": "prt_reason_1",
      "sessionID": "ses_001",
      "messageID": "msg_001",
      "type": "reasoning",
      "text": "先确认事件分类再生成示例。",
      "time": {
        "start": 1772593200200
      }
    }
  }
}
```

- 字段说明:
| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `part.text` | `string` | 推理文本 |
| `part.time.start` | `number` | 推理开始时间（必填） |
| `part.time.end` | `number?` | 推理结束时间（可选） |
| `part.metadata` | `object?` | 附加信息（可选） |

- 开始帧示例（结构化示例）:

```json
{
  "type": "message.part.updated",
  "properties": {
    "part": {
      "id": "prt_reason_1",
      "sessionID": "ses_001",
      "messageID": "msg_001",
      "type": "reasoning",
      "text": "先确认事件分类再生成示例。",
      "time": {
        "start": 1772593200200
      }
    }
  }
}
```

- 结束帧示例（结构化示例）:

```json
{
  "type": "message.part.updated",
  "properties": {
    "part": {
      "id": "prt_reason_1",
      "sessionID": "ses_001",
      "messageID": "msg_001",
      "type": "reasoning",
      "text": "已确认 message 相关契约与字段。",
      "time": {
        "start": 1772593200200,
        "end": 1772593200900
      }
    }
  }
}
```

### `part.type = "tool"`（工具调用）

- payload 最小结构:

```json
{
  "type": "message.part.updated",
  "properties": {
    "part": {
      "id": "prt_tool_1",
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
        "time": {
          "start": 1772593201000
        }
      }
    }
  }
}
```

- 字段说明:
| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `part.callID` | `string` | 工具调用 ID |
| `part.tool` | `string` | 工具名 |
| `part.state.status` | `string` | `pending`/`running`/`completed`/`error` |
| `part.state.input` | `object` | 工具输入 |
| `part.state.time` | `object?` | 工具状态时间信息（是否出现取决于 `status`） |

`part.state` 在不同 `status` 下的字段要求（以 SDK 类型为准）：

| `part.state.status` | 契约必填字段 | 可选字段 |
| --- | --- | --- |
| `pending` | `input`, `raw` | 无 |
| `running` | `input`, `time.start` | `title`, `metadata` |
| `completed` | `input`, `output`, `title`, `metadata`, `time.start`, `time.end` | `time.compacted`, `attachments` |
| `error` | `input`, `error`, `time.start`, `time.end` | `metadata` |

- 开始/运行帧示例（结构化示例）:

```json
{
  "type": "message.part.updated",
  "properties": {
    "part": {
      "id": "prt_tool_1",
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
        "time": {
          "start": 1772593201000
        }
      }
    }
  }
}
```

- 完成帧示例（结构化示例）:

```json
{
  "type": "message.part.updated",
  "properties": {
    "part": {
      "id": "prt_tool_1",
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
          "start": 1772593201000,
          "end": 1772593201800
        }
      }
    }
  }
}
```

## `message.part.delta`

- 稳定性: `contracted`
- 契约来源: `EventMessagePartDelta` (`dev:packages/sdk/js/src/v2/gen/types.gen.ts`)
- Since: `v1.2.0`
- 端点可见性: `/event`, `/global/event`
- payload: 

```json
{
  "type": "message.part.delta",
  "properties": {
    "sessionID": "string",
    "messageID": "string",
    "partID": "string",
    "field": "string",
    "delta": "string"
  }
}
```

| 字段 | 类型 | 必填性 | 版本 | 说明 |
| --- | --- | --- | --- | --- |
| `properties.sessionID` | `string` | 必填 | `since v1.2.0` | 会话 ID |
| `properties.messageID` | `string` | 必填 | `since v1.2.0` | 消息 ID |
| `properties.partID` | `string` | 必填 | `since v1.2.0` | part ID |
| `properties.field` | `string` | 必填 | `since v1.2.0` | 增量字段名（常见为 `text`） |
| `properties.delta` | `string` | 必填 | `since v1.2.0` | 本帧增量内容 |

- 真实报文示例（`/global/event`, `v1.2.15`）:

```json
{
  "directory": "/Users/zy/Code/opencode/opencode",
  "payload": {
    "type": "message.part.delta",
    "properties": {
      "sessionID": "ses_34232427effetUOuZjMITxXVqQ",
      "messageID": "msg_cc09f5068001zq5skdikwSiWpl",
      "partID": "prt_cc09fc7da001BZIuCOBAvBYIv1",
      "field": "text",
      "delta": "你好"
    }
  }
}
```

## `message.part.updated.properties.delta`（兼容语义）

1. 在 `v1.1.65` 及更早分支，`delta` 常以 `message.part.updated.properties.delta` 字段出现。
2. 在 `v1.2.0+`，服务端契约新增 `message.part.delta` 事件承载增量流。
3. 两种形态表达同一“增量片段”语义；调用方可按 `sessionID + messageID + partID` 归并。
4. `delta` 未出现不代表结束；结束应结合 `message.updated` 完成帧或 part 状态判断。

## 标准时序样例（端到端）

以下主序列为固定顺序 6 帧；`reasoning`（think）固定插入为第 3.5 帧。

### A. `/event` 实例流（结构化示例）

1. `message.updated`（assistant 初始化）

```json
{
  "type": "message.updated",
  "properties": {
    "info": {
      "id": "msg_001",
      "sessionID": "ses_001",
      "role": "assistant",
      "parentID": "msg_user_001",
      "modelID": "claude-3-5-sonnet",
      "providerID": "anthropic",
      "mode": "chat",
      "agent": "build",
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
        "created": 1772593200000
      }
    }
  }
}
```

2. `message.part.updated`（text 首帧）

```json
{
  "type": "message.part.updated",
  "properties": {
    "part": {
      "id": "prt_txt_1",
      "sessionID": "ses_001",
      "messageID": "msg_001",
      "type": "text",
      "text": "正在整理 message 事件文档"
    }
  }
}
```

3. `message.part.updated`（text 流式帧，含 `delta`）

```json
{
  "type": "message.part.updated",
  "properties": {
    "part": {
      "id": "prt_txt_1",
      "sessionID": "ses_001",
      "messageID": "msg_001",
      "type": "text",
      "text": "正在整理 message 事件文档，并补充标准时序样例。"
    },
    "delta": "，并补充标准时序样例。"
  }
}
```

3.5 `message.part.updated`（think: reasoning 插入帧）

```json
{
  "type": "message.part.updated",
  "properties": {
    "part": {
      "id": "prt_reason_1",
      "sessionID": "ses_001",
      "messageID": "msg_001",
      "type": "reasoning",
      "text": "先输出主序列 6 帧，再补充开始/结束差异表。",
      "time": {
        "start": 1772593200900,
        "end": 1772593201100
      }
    }
  }
}
```

4. `message.part.updated`（tool running）

```json
{
  "type": "message.part.updated",
  "properties": {
    "part": {
      "id": "prt_tool_1",
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
        "time": {
          "start": 1772593201200
        }
      }
    }
  }
}
```

5. `message.part.updated`（tool completed）

```json
{
  "type": "message.part.updated",
  "properties": {
    "part": {
      "id": "prt_tool_1",
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
          "end": 1772593201800
        }
      }
    }
  }
}
```

6. `message.updated`（完成收敛）

```json
{
  "type": "message.updated",
  "properties": {
    "info": {
      "id": "msg_001",
      "sessionID": "ses_001",
      "role": "assistant",
      "parentID": "msg_user_001",
      "modelID": "claude-3-5-sonnet",
      "providerID": "anthropic",
      "mode": "chat",
      "agent": "build",
      "path": {
        "cwd": "/repo",
        "root": "/repo"
      },
      "finish": "stop",
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
      "time": {
        "created": 1772593200000,
        "completed": 1772593202500
      }
    }
  }
}
```

### B. `/global/event` 全局流（结构化示例）

全局流的 payload 与实例流一致，外层包裹 `directory`：

```json
{
  "directory": "/repo",
  "payload": {
    "type": "message.updated",
    "properties": {
      "info": {
        "id": "msg_001",
        "sessionID": "ses_001",
        "role": "assistant",
        "parentID": "msg_user_001",
        "modelID": "claude-3-5-sonnet",
        "providerID": "anthropic",
        "mode": "chat",
        "agent": "build",
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
          "created": 1772593200000
        }
      }
    }
  }
}
```

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
        "text": "正在整理 message 事件文档"
      }
    }
  }
}
```

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
        "text": "正在整理 message 事件文档，并补充标准时序样例。"
      },
      "delta": "，并补充标准时序样例。"
    }
  }
}
```

```json
{
  "directory": "/repo",
  "payload": {
    "type": "message.part.updated",
    "properties": {
      "part": {
        "id": "prt_reason_1",
        "sessionID": "ses_001",
        "messageID": "msg_001",
        "type": "reasoning",
        "text": "先输出主序列 6 帧，再补充开始/结束差异表。",
        "time": {
          "start": 1772593200900,
          "end": 1772593201100
        }
      }
    }
  }
}
```

```json
{
  "directory": "/repo",
  "payload": {
    "type": "message.part.updated",
    "properties": {
      "part": {
        "id": "prt_tool_1",
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
          "time": {
            "start": 1772593201200
          }
        }
      }
    }
  }
}
```

```json
{
  "directory": "/repo",
  "payload": {
    "type": "message.part.updated",
    "properties": {
      "part": {
        "id": "prt_tool_1",
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
            "end": 1772593201800
          }
        }
      }
    }
  }
}
```

```json
{
  "directory": "/repo",
  "payload": {
    "type": "message.updated",
    "properties": {
      "info": {
        "id": "msg_001",
        "sessionID": "ses_001",
        "role": "assistant",
        "parentID": "msg_user_001",
        "modelID": "claude-3-5-sonnet",
        "providerID": "anthropic",
        "mode": "chat",
        "agent": "build",
        "path": {
          "cwd": "/repo",
          "root": "/repo"
        },
        "finish": "stop",
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
        "time": {
          "created": 1772593200000,
          "completed": 1772593202500
        }
      }
    }
  }
}
```

## 开始/结束报文差异

| 阶段 | 事件 | 必填字段 | 常见可选字段 | 字段变化点 |
| --- | --- | --- | --- | --- |
| 开始 | `message.updated` | `info.id`, `info.sessionID`, `info.role`, `info.time.created` | `info.variant` | 通常尚未出现 `time.completed`/`finish`；assistant 分支的 `tokens/cost` 常处于初始值 |
| 结束 | `message.updated` | `info.id`, `info.sessionID`, `info.role`, `info.time.created`（联合类型公共必填） | `info.time.completed`, `info.finish`, `info.error` | assistant 分支通常在结束阶段收敛 `tokens/cost`；user 分支不适用 |
| 开始/进行中 | `message.part.updated` (`text`) | `part.id`, `part.messageID`, `part.type="text"`, `part.text` | `delta`, `part.time`, `part.metadata` | `part.text` 持续扩展，`delta` 可出现可缺省 |
| 开始/结束 | `message.part.updated` (`reasoning`) | `part.id`, `part.messageID`, `part.type="reasoning"`, `part.text`, `part.time.start` | `part.time.end`, `part.metadata` | 结束时常补齐 `time.end` |
| 运行/完成 | `message.part.updated` (`tool`) | `part.id`, `part.messageID`, `part.type="tool"`, `part.callID`, `part.tool`, `part.state` | `part.metadata` | `state.status` 从 `running` 变更到 `completed`（或 `error`） |
| 进行中字段 | `message.part.updated.properties.delta` | 无（可选字段） | `string` | `delta` 只表示某次增量，不能单独作为结束判据 |
| 进行中事件（`v1.2.0+`） | `message.part.delta` | `sessionID`, `messageID`, `partID`, `field`, `delta` | 无 | 增量独立成事件，同样不能单独作为结束判据 |

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

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `properties.sessionID` | `string` | 会话 ID |
| `properties.messageID` | `string` | 消息 ID |
| `properties.partID` | `string` | 被移除 part ID |

- 报文示例（结构化示例）:

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

- 触发方式: 回滚或清理 part。

## 协议语义说明

1. `message.updated` 表达消息级快照与收敛结果。
2. `message.part.updated` 表达 part 级变化；`part.type` 决定字段形态。
3. `delta` 在 `v1.2.0+` 主要由 `message.part.delta` 事件承载；旧版本可见 `message.part.updated.properties.delta` 字段。

## 字段不清楚 FAQ

1. `message.part.delta` 是不是一个独立事件？
   是。`dev` 分支 OpenAPI/SDK 已将其定义为 `contracted` 事件（`since v1.2.0`）。
2. `message.updated.properties.info` 为什么有时字段很多、有时很少？
   因为 `info` 是联合类型 `Message = UserMessage | AssistantMessage`，字段取决于 `role` 分支。
3. 文档里的 think 对应哪个 API 字段？
   对应 `message.part.updated` 中 `part.type = "reasoning"`。
4. `tool` 场景为什么同样是 `message.part.updated`，但字段不同？
   因为 `part.state` 是联合类型，字段要求取决于 `part.state.status`（`pending/running/completed/error`）。
