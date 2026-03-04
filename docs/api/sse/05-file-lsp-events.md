# File / LSP 事件

## `file.edited`

- 稳定性: `contracted`
- 端点可见性: `/event`, `/global/event`
- payload: `{"type":"file.edited","properties":{"file":"string"}}`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `properties.file` | `string` | 被编辑文件路径 |

- 真实报文示例:

```json
{"type":"file.edited","properties":{"file":"docs/api/02-sse-reference.md"}}
```

- 触发方式: `edit`/`write`/`apply_patch` 成功后发布。

## `file.watcher.updated`

- 稳定性: `contracted`
- 端点可见性: `/event`, `/global/event`
- payload: `{"type":"file.watcher.updated","properties":{"file":"string","event":"add|change|unlink"}}`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `properties.file` | `string` | 文件路径 |
| `properties.event` | `string` | `add`/`change`/`unlink` |

- 真实报文示例:

```json
{"type":"file.watcher.updated","properties":{"file":"docs/api/sse/00-event-catalog.md","event":"add"}}
```

- 触发方式: 文件监听器检测到变更。

## `lsp.client.diagnostics`

- 稳定性: `contracted`
- 端点可见性: `/event`, `/global/event`
- payload: `{"type":"lsp.client.diagnostics","properties":{"serverID":"string","path":"string"}}`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `properties.serverID` | `string` | LSP 服务 ID |
| `properties.path` | `string` | 文件路径 |

- 真实报文示例:

```json
{"type":"lsp.client.diagnostics","properties":{"serverID":"tsserver","path":"/Users/zy/Code/opencode/opencode/packages/opencode/src/server/server.ts"}}
```

- 触发方式: LSP 客户端诊断更新。

## `lsp.updated`

- 稳定性: `contracted`
- 端点可见性: `/event`, `/global/event`
- payload: `{"type":"lsp.updated","properties":{}}`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `properties` | `object` | 空对象，代表 LSP 总状态变化 |

- 真实报文示例:

```json
{"type":"lsp.updated","properties":{}}
```

- 触发方式: LSP 状态刷新。
