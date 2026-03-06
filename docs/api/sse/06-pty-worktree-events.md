# PTY / Workspace / Worktree 事件

- Contract Baseline: `dev@cf425d114`
- Last Verified: `2026-03-06`
- Runtime Observed Version: `v1.2.15`
- Version Note Default: 未单独标注字段默认 `since v1.2.0`（以本文件 Contract Baseline 为准）


## `pty.created`

- 稳定性: `contracted`
- 端点可见性: `/event`, `/global/event`
- payload: 

```json
{
  "type": "pty.created",
  "properties": {
    "info": {
      "id": "string",
      "title": "string",
      "command": "string",
      "args": [],
      "cwd": "string",
      "status": "running|exited",
      "pid": 0
    }
  }
}
```

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `properties.info.id` | `string` | PTY 会话 ID |
| `properties.info.command` | `string` | 执行命令 |
| `properties.info.status` | `string` | `running`/`exited` |

- 真实报文示例:

```json
{
  "type": "pty.created",
  "properties": {
    "info": {
      "id": "pty_001",
      "title": "shell",
      "command": "zsh",
      "args": [],
      "cwd": "/Users/zy/Code/opencode/opencode",
      "status": "running",
      "pid": 41231
    }
  }
}
```

- 触发方式: 创建 PTY。

## `pty.updated`

- 稳定性: `contracted`
- 端点可见性: `/event`, `/global/event`
- payload（结构化示例，非完整字段）:

```json
{
  "type": "pty.updated",
  "properties": {
    "info": "<Pty>"
  }
}
```

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `properties.info` | `Pty` | PTY 最新状态 |

- 真实报文示例:

```json
{
  "type": "pty.updated",
  "properties": {
    "info": {
      "id": "pty_001",
      "title": "shell",
      "command": "zsh",
      "args": [],
      "cwd": "/Users/zy/Code/opencode/opencode",
      "status": "exited",
      "pid": 41231
    }
  }
}
```

- 触发方式: PTY 状态变化。

## `pty.exited`

- 稳定性: `contracted`
- 端点可见性: `/event`, `/global/event`
- payload: 

```json
{
  "type": "pty.exited",
  "properties": {
    "id": "string",
    "exitCode": 0
  }
}
```

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `properties.id` | `string` | PTY 会话 ID |
| `properties.exitCode` | `number` | 退出码 |

- 真实报文示例:

```json
{
  "type": "pty.exited",
  "properties": {
    "id": "pty_001",
    "exitCode": 0
  }
}
```

- 触发方式: PTY 进程退出。

## `pty.deleted`

- 稳定性: `contracted`
- 端点可见性: `/event`, `/global/event`
- payload: 

```json
{
  "type": "pty.deleted",
  "properties": {
    "id": "string"
  }
}
```

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `properties.id` | `string` | PTY 会话 ID |

- 真实报文示例:

```json
{
  "type": "pty.deleted",
  "properties": {
    "id": "pty_001"
  }
}
```

- 触发方式: 删除 PTY 会话。

## `workspace.ready`

- 稳定性: `contracted`
- 契约来源: `EventWorkspaceReady` (`dev:packages/sdk/js/src/v2/gen/types.gen.ts`)
- Since: `v1.2.0`
- 端点可见性: `/event`, `/global/event`
- payload: 

```json
{
  "type": "workspace.ready",
  "properties": {
    "name": "string"
  }
}
```

| 字段 | 类型 | 必填性 | 版本 | 说明 |
| --- | --- | --- | --- | --- |
| `properties.name` | `string` | 必填 | `since v1.2.0` | workspace 名称 |

- 结构化示例（适用版本: `v1.2.0+`）:

```json
{
  "type": "workspace.ready",
  "properties": {
    "name": "ws-feature-1"
  }
}
```

- 触发方式: workspace 初始化完成。

## `workspace.failed`

- 稳定性: `contracted`
- 契约来源: `EventWorkspaceFailed` (`dev:packages/sdk/js/src/v2/gen/types.gen.ts`)
- Since: `v1.2.0`
- 端点可见性: `/event`, `/global/event`
- payload: 

```json
{
  "type": "workspace.failed",
  "properties": {
    "message": "string"
  }
}
```

| 字段 | 类型 | 必填性 | 版本 | 说明 |
| --- | --- | --- | --- | --- |
| `properties.message` | `string` | 必填 | `since v1.2.0` | workspace 失败原因 |

- 结构化示例（适用版本: `v1.2.0+`）:

```json
{
  "type": "workspace.failed",
  "properties": {
    "message": "workspace init failed"
  }
}
```

- 触发方式: workspace 初始化失败。

## `worktree.ready`

- 稳定性: `contracted`
- 端点可见性: `/event`, `/global/event`
- payload: 

```json
{
  "type": "worktree.ready",
  "properties": {
    "name": "string",
    "branch": "string"
  }
}
```

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `properties.name` | `string` | worktree 名称 |
| `properties.branch` | `string` | 分支名 |

- 真实报文示例:

```json
{
  "type": "worktree.ready",
  "properties": {
    "name": "wt-feature-1",
    "branch": "feature/sse-doc"
  }
}
```

- 触发方式: worktree 创建成功。

## `worktree.failed`

- 稳定性: `contracted`
- 端点可见性: `/event`, `/global/event`
- payload: 

```json
{
  "type": "worktree.failed",
  "properties": {
    "message": "string"
  }
}
```

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `properties.message` | `string` | 失败原因 |

- 真实报文示例:

```json
{
  "type": "worktree.failed",
  "properties": {
    "message": "git worktree add failed"
  }
}
```

- 触发方式: worktree 创建失败。

## 差异说明：`workspace.*` vs `worktree.*`

1. `workspace.*` 表达工作区级生命周期（无 `branch` 字段）。
2. `worktree.*` 表达 git worktree 级生命周期（`worktree.ready` 含 `branch`）。
3. 在 `v1.2.0+` 中两组事件均为 `contracted`，调用方应按事件名区分语义。
