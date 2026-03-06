# Message 事件

## `message.updated`

- 稳定性: `contracted`
- 端点可见性: `/event`, `/global/event`
- payload: `{"type":"message.updated","properties":{"info":{...Message}}}`

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
{"type":"message.updated","properties":{"info":{"id":"msg_001","sessionID":"ses_001","role":"assistant","parentID":"msg_user_001","modelID":"claude-3-5-sonnet","providerID":"anthropic","mode":"chat","agent":"build","path":{"cwd":"/repo","root":"/repo"},"cost":0,"tokens":{"input":0,"output":0,"reasoning":0,"cache":{"read":0,"write":0}},"time":{"created":1772593200000}}}}
```

该示例为 `AssistantMessage` 分支。`UserMessage` 最小结构示意（结构化示例）：

```json
{"type":"message.updated","properties":{"info":{"id":"msg_user_001","sessionID":"ses_001","role":"user","time":{"created":1772593199000},"agent":"build","model":{"providerID":"anthropic","modelID":"claude-3-5-sonnet"}}}}
```

- 触发方式: 消息创建或消息级状态更新。

## `message.removed`

- 稳定性: `contracted`
- 端点可见性: `/event`, `/global/event`
- payload: `{"type":"message.removed","properties":{"sessionID":"string","messageID":"string"}}`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `properties.sessionID` | `string` | 会话 ID |
| `properties.messageID` | `string` | 被删除消息 ID |

- 报文示例（结构化示例）:

```json
{"type":"message.removed","properties":{"sessionID":"ses_001","messageID":"msg_001"}}
```

- 触发方式: 撤销、回滚或清理消息。

## `message.part.updated`

- 稳定性: `contracted`
- 端点可见性: `/event`, `/global/event`
- payload: `{"type":"message.part.updated","properties":{"part":{...Part},"delta":"string?"}}`

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
{"type":"message.part.updated","properties":{"part":{"id":"prt_txt_1","sessionID":"ses_001","messageID":"msg_001","type":"text","text":"你好"}}}
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
{"type":"message.part.updated","properties":{"part":{"id":"prt_txt_1","sessionID":"ses_001","messageID":"msg_001","type":"text","text":"你好"}}}
```

- 进行中帧示例（结构化示例）:

```json
{"type":"message.part.updated","properties":{"part":{"id":"prt_txt_1","sessionID":"ses_001","messageID":"msg_001","type":"text","text":"你好，我来帮你拆分文档。"},"delta":"，我来帮你拆分文档。"}}
```

### `part.type = "reasoning"`（think）

- payload 最小结构:

```json
{"type":"message.part.updated","properties":{"part":{"id":"prt_reason_1","sessionID":"ses_001","messageID":"msg_001","type":"reasoning","text":"先确认事件分类再生成示例。","time":{"start":1772593200200}}}}
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
{"type":"message.part.updated","properties":{"part":{"id":"prt_reason_1","sessionID":"ses_001","messageID":"msg_001","type":"reasoning","text":"先确认事件分类再生成示例。","time":{"start":1772593200200}}}}
```

- 结束帧示例（结构化示例）:

```json
{"type":"message.part.updated","properties":{"part":{"id":"prt_reason_1","sessionID":"ses_001","messageID":"msg_001","type":"reasoning","text":"已确认 message 相关契约与字段。","time":{"start":1772593200200,"end":1772593200900}}}}
```

### `part.type = "tool"`（工具调用）

- payload 最小结构:

```json
{"type":"message.part.updated","properties":{"part":{"id":"prt_tool_1","sessionID":"ses_001","messageID":"msg_001","type":"tool","callID":"call_001","tool":"apply_patch","state":{"status":"running","input":{"path":"docs/api/sse/03-message-events.md"},"time":{"start":1772593201000}}}}}
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
{"type":"message.part.updated","properties":{"part":{"id":"prt_tool_1","sessionID":"ses_001","messageID":"msg_001","type":"tool","callID":"call_001","tool":"apply_patch","state":{"status":"running","input":{"path":"docs/api/sse/03-message-events.md"},"time":{"start":1772593201000}}}}}
```

- 完成帧示例（结构化示例）:

```json
{"type":"message.part.updated","properties":{"part":{"id":"prt_tool_1","sessionID":"ses_001","messageID":"msg_001","type":"tool","callID":"call_001","tool":"apply_patch","state":{"status":"completed","input":{"path":"docs/api/sse/03-message-events.md"},"output":"updated 1 file","title":"Patch applied","metadata":{"files":1},"time":{"start":1772593201000,"end":1772593201800}}}}}
```

## `delta` 字段定义（`message.part.updated.properties.delta`）

1. 服务端 SSE 协议事件类型中不存在 `message.part.delta`。
2. `delta` 的协议位置是 `message.part.updated.properties.delta`（可选字段）。
3. `delta` 未出现不代表流结束；结束应结合消息级或 part 级状态判断。
4. `delta` 常见于文本增量；`reasoning`/`tool` 场景可不携带该字段。
5. `delta` 与 `part.text` 可同时出现：`part.text` 是该帧快照，`delta` 是该帧增量。
6. 若某些客户端在本地二次分发 `message.part.delta`，该名称属于客户端派生事件，不属于服务端 SSE 契约事件名。

证据（契约与实现）：

- `packages/sdk/openapi.json`：仅定义 `Event.message.part.updated`，其 `properties.delta` 为字段。
- `packages/sdk/js/src/v2/gen/types.gen.ts`：`EventMessagePartUpdated` 包含 `delta?: string`，无 `message.part.delta` 事件类型。
- `packages/opencode/src/session/processor.ts`：`text-delta/reasoning-delta/tool-input-delta` 被处理后写入 `Session.updatePart(..., delta)`。
- `packages/opencode/src/session/index.ts`：最终发布 `Bus.publish(MessageV2.Event.PartUpdated, { part, delta })`（事件名仍为 `message.part.updated`）。

## 标准时序样例（端到端）

以下主序列为固定顺序 6 帧；`reasoning`（think）固定插入为第 3.5 帧。

### A. `/event` 实例流（结构化示例）

1. `message.updated`（assistant 初始化）

```json
{"type":"message.updated","properties":{"info":{"id":"msg_001","sessionID":"ses_001","role":"assistant","parentID":"msg_user_001","modelID":"claude-3-5-sonnet","providerID":"anthropic","mode":"chat","agent":"build","path":{"cwd":"/repo","root":"/repo"},"cost":0,"tokens":{"input":0,"output":0,"reasoning":0,"cache":{"read":0,"write":0}},"time":{"created":1772593200000}}}}
```

2. `message.part.updated`（text 首帧）

```json
{"type":"message.part.updated","properties":{"part":{"id":"prt_txt_1","sessionID":"ses_001","messageID":"msg_001","type":"text","text":"正在整理 message 事件文档"}}}
```

3. `message.part.updated`（text 流式帧，含 `delta`）

```json
{"type":"message.part.updated","properties":{"part":{"id":"prt_txt_1","sessionID":"ses_001","messageID":"msg_001","type":"text","text":"正在整理 message 事件文档，并补充标准时序样例。"},"delta":"，并补充标准时序样例。"}}
```

3.5 `message.part.updated`（think: reasoning 插入帧）

```json
{"type":"message.part.updated","properties":{"part":{"id":"prt_reason_1","sessionID":"ses_001","messageID":"msg_001","type":"reasoning","text":"先输出主序列 6 帧，再补充开始/结束差异表。","time":{"start":1772593200900,"end":1772593201100}}}}
```

4. `message.part.updated`（tool running）

```json
{"type":"message.part.updated","properties":{"part":{"id":"prt_tool_1","sessionID":"ses_001","messageID":"msg_001","type":"tool","callID":"call_001","tool":"apply_patch","state":{"status":"running","input":{"path":"docs/api/sse/03-message-events.md"},"time":{"start":1772593201200}}}}}
```

5. `message.part.updated`（tool completed）

```json
{"type":"message.part.updated","properties":{"part":{"id":"prt_tool_1","sessionID":"ses_001","messageID":"msg_001","type":"tool","callID":"call_001","tool":"apply_patch","state":{"status":"completed","input":{"path":"docs/api/sse/03-message-events.md"},"output":"updated 1 file","title":"Patch applied","metadata":{"files":1},"time":{"start":1772593201200,"end":1772593201800}}}}}
```

6. `message.updated`（完成收敛）

```json
{"type":"message.updated","properties":{"info":{"id":"msg_001","sessionID":"ses_001","role":"assistant","parentID":"msg_user_001","modelID":"claude-3-5-sonnet","providerID":"anthropic","mode":"chat","agent":"build","path":{"cwd":"/repo","root":"/repo"},"finish":"stop","cost":0.0123,"tokens":{"input":1200,"output":380,"reasoning":210,"cache":{"read":80,"write":0}},"time":{"created":1772593200000,"completed":1772593202500}}}}
```

### B. `/global/event` 全局流（结构化示例）

全局流的 payload 与实例流一致，外层包裹 `directory`：

```json
{"directory":"/repo","payload":{"type":"message.updated","properties":{"info":{"id":"msg_001","sessionID":"ses_001","role":"assistant","parentID":"msg_user_001","modelID":"claude-3-5-sonnet","providerID":"anthropic","mode":"chat","agent":"build","path":{"cwd":"/repo","root":"/repo"},"cost":0,"tokens":{"input":0,"output":0,"reasoning":0,"cache":{"read":0,"write":0}},"time":{"created":1772593200000}}}}}
```

```json
{"directory":"/repo","payload":{"type":"message.part.updated","properties":{"part":{"id":"prt_txt_1","sessionID":"ses_001","messageID":"msg_001","type":"text","text":"正在整理 message 事件文档"}}}}
```

```json
{"directory":"/repo","payload":{"type":"message.part.updated","properties":{"part":{"id":"prt_txt_1","sessionID":"ses_001","messageID":"msg_001","type":"text","text":"正在整理 message 事件文档，并补充标准时序样例。"},"delta":"，并补充标准时序样例。"}}}
```

```json
{"directory":"/repo","payload":{"type":"message.part.updated","properties":{"part":{"id":"prt_reason_1","sessionID":"ses_001","messageID":"msg_001","type":"reasoning","text":"先输出主序列 6 帧，再补充开始/结束差异表。","time":{"start":1772593200900,"end":1772593201100}}}}}
```

```json
{"directory":"/repo","payload":{"type":"message.part.updated","properties":{"part":{"id":"prt_tool_1","sessionID":"ses_001","messageID":"msg_001","type":"tool","callID":"call_001","tool":"apply_patch","state":{"status":"running","input":{"path":"docs/api/sse/03-message-events.md"},"time":{"start":1772593201200}}}}}}
```

```json
{"directory":"/repo","payload":{"type":"message.part.updated","properties":{"part":{"id":"prt_tool_1","sessionID":"ses_001","messageID":"msg_001","type":"tool","callID":"call_001","tool":"apply_patch","state":{"status":"completed","input":{"path":"docs/api/sse/03-message-events.md"},"output":"updated 1 file","title":"Patch applied","metadata":{"files":1},"time":{"start":1772593201200,"end":1772593201800}}}}}}
```

```json
{"directory":"/repo","payload":{"type":"message.updated","properties":{"info":{"id":"msg_001","sessionID":"ses_001","role":"assistant","parentID":"msg_user_001","modelID":"claude-3-5-sonnet","providerID":"anthropic","mode":"chat","agent":"build","path":{"cwd":"/repo","root":"/repo"},"finish":"stop","cost":0.0123,"tokens":{"input":1200,"output":380,"reasoning":210,"cache":{"read":80,"write":0}},"time":{"created":1772593200000,"completed":1772593202500}}}}}
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

## `message.part.removed`

- 稳定性: `contracted`
- 端点可见性: `/event`, `/global/event`
- payload: `{"type":"message.part.removed","properties":{"sessionID":"string","messageID":"string","partID":"string"}}`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `properties.sessionID` | `string` | 会话 ID |
| `properties.messageID` | `string` | 消息 ID |
| `properties.partID` | `string` | 被移除 part ID |

- 报文示例（结构化示例）:

```json
{"type":"message.part.removed","properties":{"sessionID":"ses_001","messageID":"msg_001","partID":"prt_txt_1"}}
```

- 触发方式: 回滚或清理 part。

## 协议语义说明

1. `message.updated` 表达消息级快照与收敛结果。
2. `message.part.updated` 表达 part 级变化；`part.type` 决定字段形态。
3. `delta` 是 `message.part.updated` 的可选字段，不是独立事件。

## 字段不清楚 FAQ

1. `message.part.delta` 是不是一个独立事件？
   不是服务端 SSE 契约事件。它是 `message.part.updated.properties.delta` 的可选字段；若出现同名事件，通常是客户端派生事件。
2. `message.updated.properties.info` 为什么有时字段很多、有时很少？
   因为 `info` 是联合类型 `Message = UserMessage | AssistantMessage`，字段取决于 `role` 分支。
3. 文档里的 think 对应哪个 API 字段？
   对应 `message.part.updated` 中 `part.type = "reasoning"`。
4. `tool` 场景为什么同样是 `message.part.updated`，但字段不同？
   因为 `part.state` 是联合类型，字段要求取决于 `part.state.status`（`pending/running/completed/error`）。
