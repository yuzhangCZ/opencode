# PTY / Worktree 事件

## `pty.created`

- 稳定性: `contracted`
- 端点可见性: `/event`, `/global/event`
- payload: `{"type":"pty.created","properties":{"info":{"id":"string","title":"string","command":"string","args":[],"cwd":"string","status":"running|exited","pid":0}}}`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `properties.info.id` | `string` | PTY 会话 ID |
| `properties.info.command` | `string` | 执行命令 |
| `properties.info.status` | `string` | `running`/`exited` |

- 真实报文示例:

```json
{"type":"pty.created","properties":{"info":{"id":"pty_001","title":"shell","command":"zsh","args":[],"cwd":"/Users/zy/Code/opencode/opencode","status":"running","pid":41231}}}
```

- 触发方式: 创建 PTY。

## `pty.updated`

- 稳定性: `contracted`
- 端点可见性: `/event`, `/global/event`
- payload: `{"type":"pty.updated","properties":{"info":{...Pty}}}`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `properties.info` | `Pty` | PTY 最新状态 |

- 真实报文示例:

```json
{"type":"pty.updated","properties":{"info":{"id":"pty_001","title":"shell","command":"zsh","args":[],"cwd":"/Users/zy/Code/opencode/opencode","status":"exited","pid":41231}}}
```

- 触发方式: PTY 状态变化。

## `pty.exited`

- 稳定性: `contracted`
- 端点可见性: `/event`, `/global/event`
- payload: `{"type":"pty.exited","properties":{"id":"string","exitCode":0}}`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `properties.id` | `string` | PTY 会话 ID |
| `properties.exitCode` | `number` | 退出码 |

- 真实报文示例:

```json
{"type":"pty.exited","properties":{"id":"pty_001","exitCode":0}}
```

- 触发方式: PTY 进程退出。

## `pty.deleted`

- 稳定性: `contracted`
- 端点可见性: `/event`, `/global/event`
- payload: `{"type":"pty.deleted","properties":{"id":"string"}}`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `properties.id` | `string` | PTY 会话 ID |

- 真实报文示例:

```json
{"type":"pty.deleted","properties":{"id":"pty_001"}}
```

- 触发方式: 删除 PTY 会话。

## `worktree.ready`

- 稳定性: `contracted`
- 端点可见性: `/event`, `/global/event`
- payload: `{"type":"worktree.ready","properties":{"name":"string","branch":"string"}}`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `properties.name` | `string` | worktree 名称 |
| `properties.branch` | `string` | 分支名 |

- 真实报文示例:

```json
{"type":"worktree.ready","properties":{"name":"wt-feature-1","branch":"feature/sse-doc"}}
```

- 触发方式: worktree 创建成功。

## `worktree.failed`

- 稳定性: `contracted`
- 端点可见性: `/event`, `/global/event`
- payload: `{"type":"worktree.failed","properties":{"message":"string"}}`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `properties.message` | `string` | 失败原因 |

- 真实报文示例:

```json
{"type":"worktree.failed","properties":{"message":"git worktree add failed"}}
```

- 触发方式: worktree 创建失败。
