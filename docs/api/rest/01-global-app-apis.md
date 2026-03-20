# Global / App 元信息接口

## 1. 分类说明

本页覆盖：

- 全局生命周期接口：`/global/*`, `/instance/dispose`
- 当前实例元信息：`/path`, `/vcs`
- 可枚举能力：`/command`, `/agent`, `/skill`
- 运行状态：`/lsp`, `/formatter`
- 日志写入：`/log`

默认稳定性：`Stable`

## 2. 接口列表

| Method | Path | 说明 |
| --- | --- | --- |
| `GET` | `/global/health` | 服务健康检查 |
| `GET` | `/global/config` | 获取全局配置 |
| `PATCH` | `/global/config` | 更新全局配置 |
| `POST` | `/global/dispose` | 释放全部实例 |
| `POST` | `/instance/dispose` | 释放当前实例 |
| `GET` | `/path` | 获取当前路径信息 |
| `GET` | `/vcs` | 获取分支信息 |
| `GET` | `/command` | 列出命令 |
| `POST` | `/log` | 写服务日志 |
| `GET` | `/agent` | 列出 agent |
| `GET` | `/skill` | 列出 skill |
| `GET` | `/lsp` | 获取 LSP 状态 |
| `GET` | `/formatter` | 获取 formatter 状态 |

## 3. 接口详情

### `GET /global/health`

- Stability: `Stable`
- 用途：检查 server 是否可用，并返回运行版本。

**参数**

无。

**响应体**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `healthy` | `true` | 固定为 `true` |
| `version` | `string` | 当前安装版本 |

**response JSON**

```json
{
  "healthy": true,
  "version": "1.2.15"
}
```

**curl**

```bash
curl -s http://localhost:4096/global/health
```

### `GET /global/config`

- Stability: `Stable`
- 用途：读取全局配置文件视图。

**参数**

无。

**响应体**

返回 `Config` 对象。常见顶层字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `$schema` | `string` | JSON schema 地址 |
| `logLevel` | `string` | 日志级别 |
| `model` | `string` | 默认模型，格式 `provider/model` |
| `small_model` | `string` | 小模型 |
| `agent` | `object` | agent 配置 |
| `provider` | `object` | provider 配置 |
| `mcp` | `object` | MCP 配置 |
| `permission` | `object` | 权限配置 |

**response JSON**

```json
{
  "$schema": "https://opencode.ai/config.json",
  "logLevel": "info",
  "model": "openai/gpt-5.4",
  "share": "manual"
}
```

**curl**

```bash
curl -s http://localhost:4096/global/config
```

### `PATCH /global/config`

- Stability: `Stable`
- 用途：整体更新全局配置对象。

**请求体**

与 `GET /global/config` 返回的 `Config` 结构一致。常见变更字段：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `logLevel` | `string` | 否 | 日志级别 |
| `model` | `string` | 否 | 默认模型 |
| `provider` | `object` | 否 | provider 配置 |
| `mcp` | `object` | 否 | MCP 配置 |

**request JSON**

```json
{
  "logLevel": "debug",
  "model": "openai/gpt-5.4"
}
```

**response JSON**

```json
{
  "logLevel": "debug",
  "model": "openai/gpt-5.4"
}
```

**curl**

```bash
curl -s -X PATCH http://localhost:4096/global/config \
  -H 'content-type: application/json' \
  -d '{"logLevel":"debug","model":"openai/gpt-5.4"}'
```

### `POST /global/dispose`

- Stability: `Stable`
- 用途：释放所有实例，通常用于重置服务状态。

**响应体**

```json
true
```

**curl**

```bash
curl -s -X POST http://localhost:4096/global/dispose
```

### `POST /instance/dispose`

- Stability: `Stable`
- 用途：只释放当前上下文实例。

**上下文**

支持 `directory` / `workspace`。

**response JSON**

```json
true
```

**curl**

```bash
curl -s -X POST 'http://localhost:4096/instance/dispose?directory=%2Fabs%2Frepo'
```

### `GET /path`

- Stability: `Stable`
- 用途：返回运行时关键路径。

**响应体**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `home` | `string` | OpenCode home 目录 |
| `state` | `string` | 状态目录 |
| `config` | `string` | 配置目录 |
| `worktree` | `string` | 当前 worktree 路径 |
| `directory` | `string` | 当前目录上下文 |

**response JSON**

```json
{
  "home": "/Users/zy/.opencode",
  "state": "/Users/zy/.opencode/state",
  "config": "/Users/zy/.config/opencode",
  "worktree": "/Users/zy/Code/opencode/opencode",
  "directory": "/Users/zy/Code/opencode/opencode"
}
```

**curl**

```bash
curl -s 'http://localhost:4096/path?directory=%2Fabs%2Frepo'
```

### `GET /vcs`

- Stability: `Stable`
- 用途：返回当前项目的版本控制信息。

**response JSON**

```json
{
  "branch": "dev"
}
```

**curl**

```bash
curl -s 'http://localhost:4096/vcs?directory=%2Fabs%2Frepo'
```

### `GET /command`

- Stability: `Stable`
- 用途：列出命令模板。

**响应体**

数组元素常见字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `name` | `string` | 命令名 |
| `description` | `string` | 描述 |
| `agent` | `string` | 默认 agent |
| `model` | `string` | 默认模型 |
| `source` | `command \| mcp \| skill` | 来源 |
| `template` | `string` | 模板 |
| `subtask` | `boolean` | 是否子任务命令 |
| `hints` | `string[]` | 提示词/别名 |

**response JSON**

```json
[
  {
    "name": "fix",
    "description": "Fix the problem",
    "template": "Fix: {{input}}",
    "hints": []
  }
]
```

**curl**

```bash
curl -s 'http://localhost:4096/command?directory=%2Fabs%2Frepo'
```

### `POST /log`

- Stability: `Stable`
- 用途：向服务端日志系统主动写入一条记录。

**请求体**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `service` | `string` | 是 | 日志来源 |
| `level` | `debug \| info \| warn \| error` | 是 | 级别 |
| `message` | `string` | 是 | 消息 |
| `extra` | `object` | 否 | 附加元数据 |

**request JSON**

```json
{
  "service": "doc-check",
  "level": "info",
  "message": "hello",
  "extra": {
    "requestID": "req_123"
  }
}
```

**response JSON**

```json
true
```

**curl**

```bash
curl -s -X POST http://localhost:4096/log \
  -H 'content-type: application/json' \
  -d '{"service":"doc-check","level":"info","message":"hello"}'
```

### `GET /agent`

- Stability: `Stable`
- 用途：列出 agent 定义。

**响应体**

数组元素常见字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `name` | `string` | agent 名称 |
| `description` | `string` | 描述 |
| `mode` | `subagent \| primary \| all` | 运行模式 |
| `native` | `boolean` | 是否内建 |
| `hidden` | `boolean` | 是否隐藏 |
| `model` | `object` | 默认 provider/model |
| `permission` | `PermissionRuleset` | 默认权限 |

**response JSON**

```json
[
  {
    "name": "build",
    "description": "General build agent",
    "mode": "primary",
    "permission": [],
    "options": {}
  }
]
```

**curl**

```bash
curl -s 'http://localhost:4096/agent?directory=%2Fabs%2Frepo'
```

### `GET /skill`

- Stability: `Stable`
- 用途：列出当前可用 skill。

**response JSON**

```json
[
  {
    "name": "technical-writer",
    "description": "Creates clear documentation"
  }
]
```

**curl**

```bash
curl -s 'http://localhost:4096/skill?directory=%2Fabs%2Frepo'
```

### `GET /lsp`

- Stability: `Stable`
- 用途：返回 LSP 客户端连接状态。

**响应体**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | `string` | 客户端 ID |
| `name` | `string` | LSP 名称 |
| `root` | `string` | 根目录 |
| `status` | `connected \| error` | 状态 |

**response JSON**

```json
[
  {
    "id": "tsserver",
    "name": "typescript-language-server",
    "root": "/Users/zy/Code/opencode/opencode",
    "status": "connected"
  }
]
```

**curl**

```bash
curl -s 'http://localhost:4096/lsp?directory=%2Fabs%2Frepo'
```

### `GET /formatter`

- Stability: `Stable`
- 用途：返回 formatter 状态。

**响应体**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `name` | `string` | formatter 名称 |
| `extensions` | `string[]` | 支持扩展名 |
| `enabled` | `boolean` | 是否启用 |

**response JSON**

```json
[
  {
    "name": "prettier",
    "extensions": [".ts", ".tsx", ".md"],
    "enabled": true
  }
]
```

**curl**

```bash
curl -s 'http://localhost:4096/formatter?directory=%2Fabs%2Frepo'
```
