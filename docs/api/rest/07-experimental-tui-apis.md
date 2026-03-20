# Experimental / TUI 接口

## 1. 分类说明

本页覆盖：

- `Experimental`: `/experimental/*`
- `Internal`: `/tui/*`

这些接口都存在于当前服务实现中，但不建议把它们视为长期稳定公共契约。

## 2. 接口列表

### Experimental

| Method | Path | 说明 |
| --- | --- | --- |
| `GET` | `/experimental/tool/ids` | 列出工具 ID |
| `GET` | `/experimental/tool` | 按 provider/model 列出工具 |
| `POST` | `/experimental/workspace` | 创建 workspace |
| `GET` | `/experimental/workspace` | 列出 workspace |
| `DELETE` | `/experimental/workspace/{id}` | 删除 workspace |
| `POST` | `/experimental/worktree` | 创建 worktree |
| `GET` | `/experimental/worktree` | 列出 worktree |
| `DELETE` | `/experimental/worktree` | 删除 worktree |
| `POST` | `/experimental/worktree/reset` | 重置 worktree |
| `GET` | `/experimental/session` | 跨项目列出 session |
| `GET` | `/experimental/resource` | 列出 MCP 资源 |

### Internal / TUI

| Method | Path | 说明 |
| --- | --- | --- |
| `POST` | `/tui/append-prompt` | 追加输入框文本 |
| `POST` | `/tui/open-help` | 打开帮助 |
| `POST` | `/tui/open-sessions` | 打开会话列表 |
| `POST` | `/tui/open-themes` | 打开主题选择 |
| `POST` | `/tui/open-models` | 打开模型选择 |
| `POST` | `/tui/submit-prompt` | 提交 prompt |
| `POST` | `/tui/clear-prompt` | 清空 prompt |
| `POST` | `/tui/execute-command` | 执行命令 |
| `POST` | `/tui/show-toast` | 展示 toast |
| `POST` | `/tui/publish` | 发布 TUI 事件 |
| `POST` | `/tui/select-session` | 切换 session |
| `GET` | `/tui/control/next` | 取队列中的控制请求 |
| `POST` | `/tui/control/response` | 回写控制结果 |

## 3. Experimental 详情

### `GET /experimental/tool/ids`

- Stability: `Experimental`
- 用途：列出全部工具 ID。

**response JSON**

```json
["read_file", "write_file", "exec"]
```

### `GET /experimental/tool`

- Stability: `Experimental`
- 用途：按 provider/model 计算可用工具及其 JSON Schema。

**Query 参数**

| 名称 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `provider` | `string` | 是 | provider ID |
| `model` | `string` | 是 | model ID |

**response JSON**

```json
[
  {
    "id": "read_file",
    "description": "Read a file",
    "parameters": {
      "type": "object"
    }
  }
]
```

### `POST /experimental/workspace`

- Stability: `Experimental`
- 用途：为当前项目创建 workspace。

**请求体**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `type` | `string` | 是 | workspace 类型 |
| `branch` | `string \| null` | 是 | 目标分支 |
| `extra` | `any \| null` | 是 | 扩展数据 |
| `id` | `string` | 否 | 自定义 workspace ID |

**request JSON**

```json
{
  "type": "worktree",
  "branch": "codex/doc-reorg",
  "extra": null
}
```

**response JSON**

```json
{
  "id": "wrk_123",
  "type": "worktree",
  "branch": "codex/doc-reorg",
  "name": null,
  "directory": null,
  "extra": null,
  "projectID": "prj_123"
}
```

### `GET /experimental/workspace`

- Stability: `Experimental`
- 用途：列出当前项目 workspace。

### `DELETE /experimental/workspace/{id}`

- Stability: `Experimental`
- 用途：删除 workspace。

### `POST /experimental/worktree`

- Stability: `Experimental`
- 用途：创建 git worktree。

**请求体**

`WorktreeCreateInput` 来自服务端 schema；调用方通常至少提供新分支名和目录。

**request JSON**

```json
{
  "name": "doc-reorg",
  "branch": "codex/doc-reorg",
  "directory": "/Users/zy/Code/opencode/opencode-worktrees/doc-reorg"
}
```

### `GET /experimental/worktree`

- Stability: `Experimental`
- 用途：列出当前项目已登记的 sandbox/worktree 目录。

### `DELETE /experimental/worktree`

- Stability: `Experimental`
- 用途：删除 worktree 并移除分支。

**request JSON**

```json
{
  "directory": "/Users/zy/Code/opencode/opencode-worktrees/doc-reorg"
}
```

### `POST /experimental/worktree/reset`

- Stability: `Experimental`
- 用途：把 worktree 重置到默认主分支。

**request JSON**

```json
{
  "directory": "/Users/zy/Code/opencode/opencode-worktrees/doc-reorg"
}
```

### `GET /experimental/session`

- Stability: `Experimental`
- 用途：跨项目列出 session。

**Query 参数**

与 `GET /session` 类似，另外支持：

| 名称 | 类型 | 说明 |
| --- | --- | --- |
| `cursor` | `number` | 返回更新时间早于此时间戳的 session |
| `archived` | `boolean` | 是否包含已归档 session，默认 `false` |

**响应头**

| 名称 | 类型 | 说明 |
| --- | --- | --- |
| `x-next-cursor` | `string` | 当还有下一页时返回，值为最后一条记录的 `time.updated` |

**response JSON**

```json
[
  {
    "id": "ses_123",
    "slug": "demo",
    "projectID": "prj_123",
    "directory": "/Users/zy/Code/opencode/opencode",
    "title": "Fix bug",
    "version": "1",
    "time": {
      "created": 1742340000000,
      "updated": 1742341000000
    },
    "project": {
      "id": "prj_123",
      "name": "opencode"
    }
  }
]
```

**curl**

```bash
curl -i 'http://localhost:4096/experimental/session?limit=20&cursor=1742341000000&archived=false'
```

### `GET /experimental/resource`

- Stability: `Experimental`
- 用途：列出 MCP 资源。

**response JSON**

```json
{
  "mcp://repo": {
    "name": "repo",
    "uri": "mcp://repo",
    "description": "Repository resource",
    "client": "filesystem"
  }
}
```

**curl**

```bash
curl -s 'http://localhost:4096/experimental/resource?directory=%2Fabs%2Frepo'
```

## 4. TUI / Internal 详情

### `POST /tui/append-prompt`

- Stability: `Internal`
- 用途：向 TUI prompt 输入框追加文本。

**request JSON**

```json
{
  "text": "Continue from the previous step"
}
```

### `POST /tui/open-help`

- Stability: `Internal`
- 用途：打开帮助弹层。

### `POST /tui/open-sessions`

- Stability: `Internal`
- 用途：打开 session 列表。

### `POST /tui/open-themes`

- Stability: `Internal`
- 用途：打开主题选择。

### `POST /tui/open-models`

- Stability: `Internal`
- 用途：打开模型选择。

### `POST /tui/submit-prompt`

- Stability: `Internal`
- 用途：提交当前输入框内容。

### `POST /tui/clear-prompt`

- Stability: `Internal`
- 用途：清空当前输入框。

### `POST /tui/execute-command`

- Stability: `Internal`
- 用途：向 TUI 发布命令执行事件。

**request JSON**

```json
{
  "command": "help.show"
}
```

### `POST /tui/show-toast`

- Stability: `Internal`
- 用途：展示 toast。

**请求体**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `title` | `string` | 否 | 标题 |
| `message` | `string` | 是 | 内容 |
| `variant` | `info \| success \| warning \| error` | 是 | 类型 |
| `duration` | `number` | 否 | 毫秒，默认 `5000` |

**request JSON**

```json
{
  "message": "Saved",
  "variant": "success",
  "duration": 3000
}
```

### `POST /tui/publish`

- Stability: `Internal`
- 用途：发布原始 TUI 事件。

**请求体**

接受以下事件联合之一：

- `Event.tui.prompt.append`
- `Event.tui.command.execute`
- `Event.tui.toast.show`
- `Event.tui.session.select`

**request JSON**

```json
{
  "type": "tui.toast.show",
  "properties": {
    "message": "Saved",
    "variant": "success"
  }
}
```

### `POST /tui/select-session`

- Stability: `Internal`
- 用途：切换到指定 session。

**request JSON**

```json
{
  "sessionID": "ses_123"
}
```

### `GET /tui/control/next`

- Stability: `Internal`
- 用途：从控制队列取下一条请求。

**response JSON**

```json
{
  "path": "/tui/control/request",
  "body": {}
}
```

### `POST /tui/control/response`

- Stability: `Internal`
- 用途：回写任意 JSON 作为控制响应。

**request JSON**

```json
{
  "ok": true
}
```
