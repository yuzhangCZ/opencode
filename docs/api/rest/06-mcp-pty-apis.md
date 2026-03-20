# MCP / PTY 接口

## 1. 分类说明

本页覆盖：

- MCP 生命周期与 OAuth：`/mcp*`
- PTY 会话管理：`/pty*`

- 默认稳定性：`Stable`
- 流式附录：`GET /pty/{ptyID}/connect` 是 WebSocket，不在本页展开 JSON 字段表

## 2. 接口列表

| Method | Path | 说明 |
| --- | --- | --- |
| `GET` | `/mcp` | 获取 MCP 状态 |
| `POST` | `/mcp` | 新增 MCP |
| `POST` | `/mcp/{name}/auth` | 发起 MCP OAuth |
| `DELETE` | `/mcp/{name}/auth` | 删除 MCP OAuth |
| `POST` | `/mcp/{name}/auth/callback` | 提交 OAuth code |
| `POST` | `/mcp/{name}/auth/authenticate` | 浏览器认证 |
| `POST` | `/mcp/{name}/connect` | 连接 MCP |
| `POST` | `/mcp/{name}/disconnect` | 断开 MCP |
| `GET` | `/pty` | 列出 PTY |
| `POST` | `/pty` | 创建 PTY |
| `GET` | `/pty/{ptyID}` | 获取 PTY |
| `PUT` | `/pty/{ptyID}` | 更新 PTY |
| `DELETE` | `/pty/{ptyID}` | 删除 PTY |

## 3. 数据模型

### MCPStatus

`MCPStatus` 是联合类型，典型状态包括：

- `connected`
- `disabled`
- `failed`
- `needs-auth`
- `needs-client-registration`

### Pty

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | `string` | `pty_*` |
| `title` | `string` | 展示标题 |
| `command` | `string` | 主命令 |
| `args` | `string[]` | 参数 |
| `cwd` | `string` | 工作目录 |
| `status` | `running \| exited` | 会话状态 |
| `pid` | `number` | 进程 ID |

## 4. 接口详情

### `GET /mcp`

- 用途：返回所有 MCP 服务状态。

**response JSON**

```json
{
  "filesystem": {
    "type": "connected",
    "tools": 12
  },
  "github": {
    "type": "needs-auth"
  }
}
```

**curl**

```bash
curl -s 'http://localhost:4096/mcp?directory=%2Fabs%2Frepo'
```

### `POST /mcp`

- 用途：动态新增一个 MCP 服务。

**请求体**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `name` | `string` | 是 | 服务名 |
| `config` | `McpLocalConfig \| McpRemoteConfig` | 是 | 本地或远程配置 |

**request JSON**

```json
{
  "name": "filesystem",
  "config": {
    "type": "local",
    "command": ["npx", "-y", "@modelcontextprotocol/server-filesystem", "."]
  }
}
```

**response JSON**

```json
{
  "filesystem": {
    "type": "connected"
  }
}
```

### `POST /mcp/{name}/auth`

- 用途：发起 MCP OAuth，返回浏览器授权地址。

**response JSON**

```json
{
  "authorizationUrl": "https://provider.example/oauth/authorize"
}
```

### `DELETE /mcp/{name}/auth`

- 用途：删除 MCP OAuth 凭据。

**response JSON**

```json
{
  "success": true
}
```

### `POST /mcp/{name}/auth/callback`

- 用途：提交 OAuth 回调 code。

**请求体**

```json
{
  "code": "oauth-code"
}
```

### `POST /mcp/{name}/auth/authenticate`

- 用途：由服务端启动 OAuth 流程并等待回调。

### `POST /mcp/{name}/connect`

- 用途：连接指定 MCP 服务。

**response JSON**

```json
true
```

### `POST /mcp/{name}/disconnect`

- 用途：断开指定 MCP 服务。

### `GET /pty`

- 用途：列出活跃 PTY 会话。

**response JSON**

```json
[
  {
    "id": "pty_123",
    "title": "shell",
    "command": "zsh",
    "args": [],
    "cwd": "/Users/zy/Code/opencode/opencode",
    "status": "running",
    "pid": 12345
  }
]
```

### `POST /pty`

- 用途：创建 PTY 会话。

**请求体**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `command` | `string` | 要执行的命令 |
| `args` | `string[]` | 参数 |
| `cwd` | `string` | 工作目录 |
| `title` | `string` | 展示标题 |
| `env` | `Record<string,string>` | 环境变量 |

**request JSON**

```json
{
  "command": "zsh",
  "args": [],
  "cwd": "/Users/zy/Code/opencode/opencode",
  "title": "repo shell"
}
```

**curl**

```bash
curl -s -X POST 'http://localhost:4096/pty?directory=%2Fabs%2Frepo' \
  -H 'content-type: application/json' \
  -d '{"command":"zsh","args":[],"cwd":"/Users/zy/Code/opencode/opencode","title":"repo shell"}'
```

### `GET /pty/{ptyID}`

- 用途：获取单个 PTY。

### `PUT /pty/{ptyID}`

- 用途：更新标题或终端尺寸。

**请求体**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `title` | `string` | 新标题 |
| `size.rows` | `number` | 行数 |
| `size.cols` | `number` | 列数 |

**request JSON**

```json
{
  "title": "wide shell",
  "size": {
    "rows": 40,
    "cols": 120
  }
}
```

### `DELETE /pty/{ptyID}`

- 用途：终止并删除 PTY。

**response JSON**

```json
true
```

## 5. Streaming 附录

### `GET /pty/{ptyID}/connect`

- Stability: `Streaming`
- Protocol: `WebSocket`
- Query 参数：
  - `cursor`: 可选，从指定输出游标开始补拉
- 用途：与 PTY 进行实时双向交互

最小示例：

```text
ws://localhost:4096/pty/pty_123/connect?cursor=-1
```
