# TUI / MCP / Command 事件

- Contract Baseline: `dev@cf425d114`
- Last Verified: `2026-03-06`
- Runtime Observed Version: `v1.2.15`
- Version Note Default: 未单独标注字段默认 `since v1.2.0`（以本文件 Contract Baseline 为准）


## `tui.prompt.append`

- 稳定性: `contracted`
- 端点可见性: `/event`, `/global/event`
- payload: 

```json
{
  "type": "tui.prompt.append",
  "properties": {
    "text": "string"
  }
}
```

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `properties.text` | `string` | 追加到输入框的文本 |

- 真实报文示例:

```json
{
  "type": "tui.prompt.append",
  "properties": {
    "text": "/plan split sse docs"
  }
}
```

- 触发方式: TUI 侧 prompt 追加动作。

## `tui.command.execute`

- 稳定性: `contracted`
- 端点可见性: `/event`, `/global/event`
- payload: 

```json
{
  "type": "tui.command.execute",
  "properties": {
    "command": "string"
  }
}
```

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `properties.command` | `string` | TUI 命令标识 |

- 真实报文示例:

```json
{
  "type": "tui.command.execute",
  "properties": {
    "command": "session.new"
  }
}
```

- 触发方式: TUI 快捷键或命令面板执行命令。

## `tui.toast.show`

- 稳定性: `contracted`
- 端点可见性: `/event`, `/global/event`
- payload: 

```json
{
  "type": "tui.toast.show",
  "properties": {
    "title": "string?",
    "message": "string",
    "variant": "info|success|warning|error",
    "duration": 0
  }
}
```

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `properties.title` | `string?` | Toast 标题 |
| `properties.message` | `string` | Toast 内容 |
| `properties.variant` | `string` | 级别 |
| `properties.duration` | `number?` | 持续时长毫秒 |

- 真实报文示例（本地抓流，2026-03-04）:

```text
data: {"directory":"/Users/zy/Code/opencode/opencode/packages/opencode","payload":{"type":"tui.toast.show","properties":{"title":"  OhMyOpenCode 3.10.0","message":"Sisyphus on steroids is steering OpenCode.","variant":"info","duration":150}}}
```

- 触发方式: TUI 显示提示。

## `tui.session.select`

- 稳定性: `contracted`
- 端点可见性: `/event`, `/global/event`
- payload: 

```json
{
  "type": "tui.session.select",
  "properties": {
    "sessionID": "string"
  }
}
```

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `properties.sessionID` | `string` | 目标会话 ID |

- 真实报文示例:

```json
{
  "type": "tui.session.select",
  "properties": {
    "sessionID": "ses_3493ea0d5ffeyIpkiiH9FYGHFt"
  }
}
```

- 触发方式: TUI 会话切换。

## `mcp.tools.changed`

- 稳定性: `contracted`
- 端点可见性: `/event`, `/global/event`
- payload: 

```json
{
  "type": "mcp.tools.changed",
  "properties": {
    "server": "string"
  }
}
```

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `properties.server` | `string` | MCP server 名称 |

- 真实报文示例:

```json
{
  "type": "mcp.tools.changed",
  "properties": {
    "server": "filesystem"
  }
}
```

- 触发方式: MCP 工具列表刷新。

## `mcp.browser.open.failed`

- 稳定性: `contracted`
- 端点可见性: `/event`, `/global/event`
- payload: 

```json
{
  "type": "mcp.browser.open.failed",
  "properties": {
    "mcpName": "string",
    "url": "string"
  }
}
```

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `properties.mcpName` | `string` | MCP 名称 |
| `properties.url` | `string` | 失败时待打开 URL |

- 真实报文示例:

```json
{
  "type": "mcp.browser.open.failed",
  "properties": {
    "mcpName": "github",
    "url": "https://github.com/login/oauth/authorize?..."
  }
}
```

- 触发方式: MCP OAuth 浏览器打开失败。

## `command.executed`

- 稳定性: `contracted`
- 端点可见性: `/event`, `/global/event`
- payload: 

```json
{
  "type": "command.executed",
  "properties": {
    "name": "string",
    "sessionID": "string",
    "arguments": "string",
    "messageID": "string"
  }
}
```

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `properties.name` | `string` | 命令名 |
| `properties.sessionID` | `string` | 会话 ID |
| `properties.arguments` | `string` | 原始参数串 |
| `properties.messageID` | `string` | 触发命令的消息 ID |

- 真实报文示例:

```json
{
  "type": "command.executed",
  "properties": {
    "name": "review",
    "sessionID": "ses_3493ea0d5ffeyIpkiiH9FYGHFt",
    "arguments": "docs/api",
    "messageID": "msg_010"
  }
}
```

- 触发方式: 服务器命令执行完成。
