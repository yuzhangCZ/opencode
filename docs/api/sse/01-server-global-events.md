# Server / Global / Project / Installation 事件

## `installation.updated`

- 稳定性: `contracted`
- 端点可见性: `/event`, `/global/event`
- payload 结构:

```json
{"type":"installation.updated","properties":{"version":"string"}}
```

- 字段说明:

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `properties.version` | `string` | 已安装版本号 |

- 真实报文示例:

```json
{"type":"installation.updated","properties":{"version":"1.1.53"}}
```

- 触发方式: 执行升级完成路径（`cli/upgrade.ts` 发布）。

## `installation.update-available`

- 稳定性: `contracted`
- 端点可见性: `/event`, `/global/event`
- payload 结构:

```json
{"type":"installation.update-available","properties":{"version":"string"}}
```

- 字段说明:

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `properties.version` | `string` | 检测到的可升级版本 |

- 真实报文示例:

```json
{"type":"installation.update-available","properties":{"version":"1.1.54"}}
```

- 触发方式: 执行升级检查路径（`cli/upgrade.ts` 发布）。

## `project.updated`

- 稳定性: `contracted`
- 端点可见性: `/event`, `/global/event`
- payload 结构:

```json
{"type":"project.updated","properties":{"id":"string","worktree":"string","time":{"created":0,"updated":0},"sandboxes":[]}}
```

- 字段说明:

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `properties.id` | `string` | 项目标识 |
| `properties.worktree` | `string` | 工作树路径 |
| `properties.time` | `object` | 时间字段（创建/更新） |
| `properties.sandboxes` | `string[]` | 沙箱列表 |

- 真实报文示例:

```json
{"type":"project.updated","properties":{"id":"4b0ea68d7af9a6031a7ffda7ad66e0cb83315750","worktree":"/Users/zy/Code/opencode/opencode/packages/opencode","time":{"created":1772592652068,"updated":1772592652068},"sandboxes":[]}}
```

- 触发方式: 项目初始化或配置更新（`project/project.ts` 触发）。

## `server.instance.disposed`

- 稳定性: `contracted`
- 端点可见性: `/event`, `/global/event`
- payload 结构:

```json
{"type":"server.instance.disposed","properties":{"directory":"string"}}
```

- 字段说明:

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `properties.directory` | `string` | 被释放实例对应目录 |

- 真实报文示例:

```json
{"type":"server.instance.disposed","properties":{"directory":"/Users/zy/Code/opencode/opencode/packages/opencode"}}
```

- 触发方式: 实例释放流程（`Bus.InstanceDisposed`）。

## `server.connected`

- 稳定性: `contracted`
- 端点可见性: `/event`, `/global/event`
- payload 结构:

```json
{"type":"server.connected","properties":{}}
```

- 字段说明:

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `properties` | `object` | 空对象，连接确认用途 |

- 真实报文示例（本地抓流，2026-03-04）:

```text
data: {"type":"server.connected","properties":{}}
```

- 触发方式: SSE 连接建立后服务端首包。

## `server.heartbeat`

- 稳定性: `runtime-only`
- 端点可见性: `/event`, `/global/event`
- payload 结构:

```json
{"type":"server.heartbeat","properties":{}}
```

- 字段说明:

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `properties` | `object` | 空对象，保活心跳 |

- 真实报文示例（本地抓流，2026-03-04）:

```text
data: {"type":"server.heartbeat","properties":{}}
```

- 触发方式: 建连后每 30s 自动发送。

## `global.disposed`

- 稳定性: `contracted`
- 端点可见性: `/global/event`（通过全局流程触发）
- payload 结构:

```json
{"type":"global.disposed","properties":{}}
```

- 字段说明:

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `properties` | `object` | 空对象，全局释放完成信号 |

- 真实报文示例:

```json
{"directory":"global","payload":{"type":"global.disposed","properties":{}}}
```

- 触发方式: 调用 `POST /global/dispose`。
