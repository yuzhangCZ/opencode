# OpenCode Server REST 接口参考 / REST API Reference

- Contract Baseline: `dev@cf425d114`
- Last Verified: `2026-03-06`
- Runtime Observed Version: `v1.2.15`
- Version Note Default: 未单独标注字段默认 `since v1.2.0`（以本文件 Contract Baseline 为准）


> 范围说明 / Scope: 本文档仅覆盖 `docs/opencode-server-api-docs.md` 中已公开的 server 端点，不新增推测接口。

## 1. 通用约定 / General Conventions

- Base URL: `http://localhost:4096`
- Auth: 可选 Basic Auth（`OPENCODE_SERVER_USERNAME` + `OPENCODE_SERVER_PASSWORD`）
- Context: 可通过 `?directory=` 或 `x-opencode-directory` 指定目录上下文。
- Content-Type: `application/json`（SSE/WS 端点除外）

证据 / Evidence:

- `packages/opencode/src/server/server.ts` (`basicAuth`, `Instance.provide`)

## 2. 通用错误报文 / Common Error Payload

```json
{
  "name": "BadRequestError",
  "message": "Invalid request",
  "data": {}
}
```

Evidence:

- `packages/opencode/src/server/server.ts` (`.onError`)
- `packages/opencode/src/server/error.ts`

## 3. 全局 API / Global APIs

### GET /global/health
- Summary: 获取服务健康状态 (Health check).
- cURL:
```bash
curl -s http://localhost:4096/global/health
```
- Response:
```json
{
  "healthy": true,
  "version": "1.x.x"
}
```

### GET /global/event
- Summary: 订阅全局 SSE（按目录分发，详见 SSE 文档）。
- cURL:
```bash
curl -N http://localhost:4096/global/event
```
- Response:
```json
{
  "directory": "global",
  "payload": {
    "type": "server.connected",
    "properties": {}
  }
}
```

### GET /global/config
- Summary: 读取全局配置 (Read global config).
- cURL:
```bash
curl -s http://localhost:4096/global/config
```
- Response:
```json
{
  "$schema": "...",
  "providers": {},
  "model": {}
}
```

### PATCH /global/config
- Summary: 更新全局配置 (Patch global config).
- cURL:
```bash
curl -s -X PATCH http://localhost:4096/global/config -H 'content-type: application/json' -d '{"model":{}}'
```

- Request Body:

```json
{
  "model": {}
}
```
- Request:
```json
{
  "model": {}
}
```
- Response:
```json
{
  "model": {}
}
```

### POST /global/dispose
- Summary: 释放全部实例资源 (Dispose all instances).
- cURL:
```bash
curl -s -X POST http://localhost:4096/global/dispose
```
- Response:
```json
true
```

## 4. 会话 API / Session APIs

### GET /session
- Summary: 列出会话 (List sessions).
- cURL:
```bash
curl -s 'http://localhost:4096/session?limit=20&roots=true'
```
- Response:
```json
[
  {
    "id": "ses_xxx",
    "title": "demo"
  }
]
```

### POST /session
- Summary: 创建会话 (Create session).
- cURL:
```bash
curl -s -X POST http://localhost:4096/session -H 'content-type: application/json' -d '{"title":"demo"}'
```

- Request Body:

```json
{
  "title": "demo"
}
```
- Request:
```json
{
  "title": "demo",
  "parentID": null
}
```
- Response:
```json
{
  "id": "ses_xxx",
  "title": "demo"
}
```

### GET /session/status
- Summary: 获取会话状态映射 (Get session status map).
- cURL:
```bash
curl -s http://localhost:4096/session/status
```
- Response:
```json
{
  "ses_xxx": {
    "type": "idle"
  }
}
```

### GET /session/{sessionID}
- Summary: 获取会话详情 (Get session).
- cURL:
```bash
curl -s http://localhost:4096/session/ses_xxx
```
- Response:
```json
{
  "id": "ses_xxx",
  "title": "demo"
}
```

### DELETE /session/{sessionID}
- Summary: 删除会话 (Delete session).
- cURL:
```bash
curl -s -X DELETE http://localhost:4096/session/ses_xxx
```
- Response:
```json
true
```

### PATCH /session/{sessionID}
- Summary: 更新会话属性 (Patch session).
- cURL:
```bash
curl -s -X PATCH http://localhost:4096/session/ses_xxx -H 'content-type: application/json' -d '{"title":"new"}'
```

- Request Body:

```json
{
  "title": "new"
}
```
- Request:
```json
{
  "title": "new",
  "time": {
    "archived": null
  }
}
```
- Response:
```json
{
  "id": "ses_xxx",
  "title": "new"
}
```

### GET /session/{sessionID}/children
- Summary: 获取子会话 (List child sessions).
- cURL:
```bash
curl -s http://localhost:4096/session/ses_xxx/children
```
- Response:
```json
[
  {
    "id": "ses_child"
  }
]
```

### GET /session/{sessionID}/todo
- Summary: 获取待办 (Get todos).
- cURL:
```bash
curl -s http://localhost:4096/session/ses_xxx/todo
```
- Response:
```json
[
  {
    "id": "todo_1",
    "content": "..."
  }
]
```

### POST /session/{sessionID}/init
- Summary: 初始化会话上下文 (Initialize session workspace).
- cURL:
```bash
curl -s -X POST http://localhost:4096/session/ses_xxx/init -H 'content-type: application/json' -d '{}'
```

- Request Body:

```json
{}
```
- Request:
```json
{}
```
- Response:
```json
true
```

### POST /session/{sessionID}/fork
- Summary: 派生会话 (Fork session).
- cURL:
```bash
curl -s -X POST http://localhost:4096/session/ses_xxx/fork -H 'content-type: application/json' -d '{}'
```

- Request Body:

```json
{}
```
- Request:
```json
{
  "title": "forked"
}
```
- Response:
```json
{
  "id": "ses_forked"
}
```

### POST /session/{sessionID}/abort
- Summary: 中止运行 (Abort session run).
- cURL:
```bash
curl -s -X POST http://localhost:4096/session/ses_xxx/abort
```
- Response:
```json
true
```

### POST /session/{sessionID}/share
- Summary: 分享会话 (Share session).
- cURL:
```bash
curl -s -X POST http://localhost:4096/session/ses_xxx/share
```
- Response:
```json
{
  "id": "ses_xxx",
  "share": {
    "url": "https://..."
  }
}
```

### DELETE /session/{sessionID}/share
- Summary: 取消分享 (Unshare session).
- cURL:
```bash
curl -s -X DELETE http://localhost:4096/session/ses_xxx/share
```
- Response:
```json
{
  "id": "ses_xxx",
  "share": null
}
```

### GET /session/{sessionID}/diff
- Summary: 获取会话文件 diff (Get session file diff).
- cURL:
```bash
curl -s 'http://localhost:4096/session/ses_xxx/diff?messageID=msg_1'
```
- Response:
```json
[
  {
    "file": "src/a.ts",
    "additions": 3,
    "deletions": 1
  }
]
```

### POST /session/{sessionID}/summarize
- Summary: 触发总结 (Summarize session).
- cURL:
```bash
curl -s -X POST http://localhost:4096/session/ses_xxx/summarize -H 'content-type: application/json' -d '{"providerID":"anthropic","modelID":"claude-3-5-sonnet","auto":false}'
```

- Request Body:

```json
{
  "providerID": "anthropic",
  "modelID": "claude-3-5-sonnet",
  "auto": false
}
```
- Request:
```json
{
  "providerID": "anthropic",
  "modelID": "claude-3-5-sonnet",
  "auto": false
}
```
- Response:
```json
true
```

### GET /session/{sessionID}/message
- Summary: 获取消息列表 (List messages).
- cURL:
```bash
curl -s 'http://localhost:4096/session/ses_xxx/message?limit=50'
```
- Response:
```json
[
  {
    "id": "msg_1",
    "role": "user",
    "parts": []
  }
]
```

### POST /session/{sessionID}/message
- Summary: 发送消息 (Send message).
- cURL:
```bash
curl -s -X POST http://localhost:4096/session/ses_xxx/message -H 'content-type: application/json' -d '{"parts":[{"type":"text","text":"hello"}]}'
```

- Request Body:

```json
{
  "parts": [
    {
      "type": "text",
      "text": "hello"
    }
  ]
}
```
- Request:
```json
{
  "parts": [
    {
      "type": "text",
      "text": "hello"
    }
  ]
}
```
- Response:
```json
{
  "id": "msg_new",
  "role": "assistant"
}
```

### POST /session/{sessionID}/prompt_async
- Summary: 异步提示 (Async prompt).
- cURL:
```bash
curl -i -X POST http://localhost:4096/session/ses_xxx/prompt_async -H 'content-type: application/json' -d '{"parts":[{"type":"text","text":"hello"}]}'
```

- Request Body:

```json
{
  "parts": [
    {
      "type": "text",
      "text": "hello"
    }
  ]
}
```
- Request:
```json
{
  "parts": [
    {
      "type": "text",
      "text": "hello"
    }
  ]
}
```
- Response:
```json
{}
```

### POST /session/{sessionID}/command
- Summary: 执行命令消息 (Run command message).
- cURL:
```bash
curl -s -X POST http://localhost:4096/session/ses_xxx/command -H 'content-type: application/json' -d '{"command":"/help"}'
```

- Request Body:

```json
{
  "command": "/help"
}
```
- Request:
```json
{
  "command": "/help"
}
```
- Response:
```json
{
  "id": "msg_cmd"
}
```

### POST /session/{sessionID}/shell
- Summary: 执行 shell 请求 (Execute shell through session).
- cURL:
```bash
curl -s -X POST http://localhost:4096/session/ses_xxx/shell -H 'content-type: application/json' -d '{"command":"ls -la"}'
```

- Request Body:

```json
{
  "command": "ls -la"
}
```
- Request:
```json
{
  "command": "ls -la"
}
```
- Response:
```json
{
  "id": "msg_shell"
}
```

### POST /session/{sessionID}/revert
- Summary: 回滚消息 (Revert changes/messages).
- cURL:
```bash
curl -s -X POST http://localhost:4096/session/ses_xxx/revert -H 'content-type: application/json' -d '{"messageID":"msg_1"}'
```

- Request Body:

```json
{
  "messageID": "msg_1"
}
```
- Request:
```json
{
  "messageID": "msg_1"
}
```
- Response:
```json
{
  "id": "ses_xxx"
}
```

### POST /session/{sessionID}/unrevert
- Summary: 取消回滚 (Unrevert).
- cURL:
```bash
curl -s -X POST http://localhost:4096/session/ses_xxx/unrevert
```
- Response:
```json
{
  "id": "ses_xxx"
}
```

## 5. 文件 API / File APIs

### GET /find
- Summary: 全文检索 (Text search).
- cURL:
```bash
curl -s 'http://localhost:4096/find?pattern=Server.App'
```
- Response:
```json
[
  {
    "path": "src/server/server.ts",
    "line": 1
  }
]
```

### GET /find/file
- Summary: 文件名检索 (File search).
- cURL:
```bash
curl -s 'http://localhost:4096/find/file?query=server&limit=20'
```
- Response:
```json
[
  "packages/opencode/src/server/server.ts"
]
```

### GET /find/symbol
- Summary: 符号检索 (LSP symbol search).
- cURL:
```bash
curl -s 'http://localhost:4096/find/symbol?query=Session'
```
- Response:
```json
[
  {
    "name": "Session",
    "kind": "class",
    "path": "..."
  }
]
```

### GET /file
- Summary: 列目录 (List files).
- cURL:
```bash
curl -s 'http://localhost:4096/file?path=.'
```
- Response:
```json
[
  {
    "name": "README.md",
    "type": "file"
  }
]
```

### GET /file/content
- Summary: 读文件 (Read file content).
- cURL:
```bash
curl -s 'http://localhost:4096/file/content?path=README.md'
```
- Response:
```json
{
  "content": "# ...",
  "encoding": "utf-8"
}
```

### GET /file/status
- Summary: Git 状态 (File status).
- cURL:
```bash
curl -s http://localhost:4096/file/status
```
- Response:
```json
[
  {
    "path": "src/a.ts",
    "status": "modified"
  }
]
```

## 6. 项目 API / Project APIs

### GET /project
- Summary: 列项目 (List projects).
- cURL:
```bash
curl -s http://localhost:4096/project
```
- Response:
```json
[
  {
    "id": "proj_1",
    "name": "demo"
  }
]
```

### GET /project/current
- Summary: 当前项目 (Get current project).
- cURL:
```bash
curl -s http://localhost:4096/project/current
```
- Response:
```json
{
  "id": "proj_1",
  "directory": "/path"
}
```

### PATCH /project/{projectID}
- Summary: 更新项目 (Patch project).
- cURL:
```bash
curl -s -X PATCH http://localhost:4096/project/proj_1 -H 'content-type: application/json' -d '{"name":"new-name"}'
```

- Request Body:

```json
{
  "name": "new-name"
}
```
- Request:
```json
{
  "name": "new-name"
}
```
- Response:
```json
{
  "id": "proj_1",
  "name": "new-name"
}
```

## 7. PTY API

### GET /pty
- Summary: 列 PTY 会话 (List PTY sessions).
- cURL:
```bash
curl -s http://localhost:4096/pty
```
- Response:
```json
[
  {
    "id": "pty_1",
    "title": "shell"
  }
]
```

### POST /pty
- Summary: 创建 PTY (Create PTY).
- cURL:
```bash
curl -s -X POST http://localhost:4096/pty -H 'content-type: application/json' -d '{"command":"bash","args":[],"cwd":"."}'
```

- Request Body:

```json
{
  "command": "bash",
  "args": [],
  "cwd": "."
}
```
- Request:
```json
{
  "command": "bash",
  "args": [],
  "cwd": "."
}
```
- Response:
```json
{
  "id": "pty_1"
}
```

### GET /pty/{ptyID}
- Summary: PTY 详情 (Get PTY).
- cURL:
```bash
curl -s http://localhost:4096/pty/pty_1
```
- Response:
```json
{
  "id": "pty_1",
  "size": {
    "rows": 24,
    "cols": 80
  }
}
```

### PUT /pty/{ptyID}
- Summary: 更新 PTY (Patch PTY meta).
- cURL:
```bash
curl -s -X PUT http://localhost:4096/pty/pty_1 -H 'content-type: application/json' -d '{"title":"new-title"}'
```

- Request Body:

```json
{
  "title": "new-title"
}
```
- Request:
```json
{
  "title": "new-title",
  "size": {
    "rows": 30,
    "cols": 120
  }
}
```
- Response:
```json
{
  "id": "pty_1",
  "title": "new-title"
}
```

### DELETE /pty/{ptyID}
- Summary: 删除 PTY (Delete PTY).
- cURL:
```bash
curl -s -X DELETE http://localhost:4096/pty/pty_1
```
- Response:
```json
true
```

### GET /pty/{ptyID}/connect
- Summary: 建立 PTY WebSocket 连接 (WS upgrade endpoint).
- cURL:
```bash
curl -i http://localhost:4096/pty/pty_1/connect
```
- Response:
```json
true
```

## 8. 配置 API / Config APIs

### GET /config
- Summary: 获取实例配置 (Get instance config).
- cURL:
```bash
curl -s http://localhost:4096/config
```
- Response:
```json
{
  "$schema": "..."
}
```

### PATCH /config
- Summary: 更新实例配置 (Patch instance config).
- cURL:
```bash
curl -s -X PATCH http://localhost:4096/config -H 'content-type: application/json' -d '{"model":{}}'
```

- Request Body:

```json
{
  "model": {}
}
```
- Request:
```json
{
  "model": {}
}
```
- Response:
```json
{
  "model": {}
}
```

### GET /config/providers
- Summary: 列 provider 配置 (List configured providers).
- cURL:
```bash
curl -s http://localhost:4096/config/providers
```
- Response:
```json
{
  "providers": [],
  "default": {}
}
```

## 9. Experimental API

### GET /experimental/tool/ids
- Summary: 列工具 ID (List tool IDs).
- cURL:
```bash
curl -s http://localhost:4096/experimental/tool/ids
```
- Response:
```json
[
  "edit_file",
  "run_command"
]
```

### GET /experimental/tool
- Summary: 列工具定义 (List tools).
- cURL:
```bash
curl -s 'http://localhost:4096/experimental/tool?provider=openai&model=gpt-4.1'
```
- Response:
```json
[
  {
    "id": "edit_file",
    "description": "..."
  }
]
```

### POST /experimental/worktree
- Summary: 创建 worktree。
- cURL:
```bash
curl -s -X POST http://localhost:4096/experimental/worktree -H 'content-type: application/json' -d '{"branch":"feat/x"}'
```

- Request Body:

```json
{
  "branch": "feat/x"
}
```
- Request:
```json
{
  "branch": "feat/x"
}
```
- Response:
```json
{
  "directory": "/tmp/worktree-x"
}
```

### GET /experimental/worktree
- Summary: 列 worktree。
- cURL:
```bash
curl -s http://localhost:4096/experimental/worktree
```
- Response:
```json
[
  "/tmp/worktree-x"
]
```

### DELETE /experimental/worktree
- Summary: 删除 worktree。
- cURL:
```bash
curl -s -X DELETE http://localhost:4096/experimental/worktree -H 'content-type: application/json' -d '{"directory":"/tmp/worktree-x"}'
```

- Request Body:

```json
{
  "directory": "/tmp/worktree-x"
}
```
- Request:
```json
{
  "directory": "/tmp/worktree-x"
}
```
- Response:
```json
true
```

### POST /experimental/worktree/reset
- Summary: 重置 worktree。
- cURL:
```bash
curl -s -X POST http://localhost:4096/experimental/worktree/reset -H 'content-type: application/json' -d '{"directory":"/tmp/worktree-x"}'
```

- Request Body:

```json
{
  "directory": "/tmp/worktree-x"
}
```
- Request:
```json
{
  "directory": "/tmp/worktree-x"
}
```
- Response:
```json
true
```

### GET /experimental/resource
- Summary: 获取 MCP 资源映射 (Get MCP resources).
- cURL:
```bash
curl -s http://localhost:4096/experimental/resource
```
- Response:
```json
{
  "resources": {}
}
```

## 10. MCP API

### GET /mcp
- Summary: 获取 MCP 状态。
- cURL:
```bash
curl -s http://localhost:4096/mcp
```
- Response:
```json
{
  "github": {
    "connected": true
  }
}
```

### POST /mcp
- Summary: 添加 MCP server。
- cURL:
```bash
curl -s -X POST http://localhost:4096/mcp -H 'content-type: application/json' -d '{"name":"github","config":{}}'
```

- Request Body:

```json
{
  "name": "github",
  "config": {}
}
```
- Request:
```json
{
  "name": "github",
  "config": {}
}
```
- Response:
```json
{
  "name": "github",
  "connected": false
}
```

### POST /mcp/{name}/auth
- Summary: 发起 MCP OAuth。
- cURL:
```bash
curl -s -X POST http://localhost:4096/mcp/github/auth
```
- Response:
```json
{
  "authorizationUrl": "https://..."
}
```

### POST /mcp/{name}/auth/callback
- Summary: 提交 OAuth callback code。
- cURL:
```bash
curl -s -X POST http://localhost:4096/mcp/github/auth/callback -H 'content-type: application/json' -d '{"code":"abc"}'
```

- Request Body:

```json
{
  "code": "abc"
}
```
- Request:
```json
{
  "code": "abc"
}
```
- Response:
```json
{
  "name": "github",
  "connected": true
}
```

### POST /mcp/{name}/connect
- Summary: 连接 MCP。
- cURL:
```bash
curl -s -X POST http://localhost:4096/mcp/github/connect
```
- Response:
```json
true
```

### POST /mcp/{name}/disconnect
- Summary: 断开 MCP。
- cURL:
```bash
curl -s -X POST http://localhost:4096/mcp/github/disconnect
```
- Response:
```json
true
```

## 11. Permission API

### POST /session/{sessionID}/permissions/{permissionID}
- Summary: 回复权限请求（兼容路径，deprecated）。
- cURL:
```bash
curl -s -X POST http://localhost:4096/session/ses_xxx/permissions/perm_1 -H 'content-type: application/json' -d '{"response":"once"}'
```

- Request Body:

```json
{
  "response": "once"
}
```
- Request:
```json
{
  "response": "once"
}
```
- Response:
```json
true
```

### POST /permission/{requestID}/reply
- Summary: 回复权限请求。
- cURL:
```bash
curl -s -X POST http://localhost:4096/permission/perm_1/reply -H 'content-type: application/json' -d '{"reply":"approve","message":"ok"}'
```

- Request Body:

```json
{
  "reply": "approve",
  "message": "ok"
}
```
- Request:
```json
{
  "reply": "approve",
  "message": "ok"
}
```
- Response:
```json
true
```

### GET /permission
- Summary: 列待处理权限。
- cURL:
```bash
curl -s http://localhost:4096/permission
```
- Response:
```json
[
  {
    "id": "perm_1",
    "action": "write_file"
  }
]
```

## 12. Question API

### GET /question
- Summary: 列待回答问题。
- cURL:
```bash
curl -s http://localhost:4096/question
```
- Response:
```json
[
  {
    "id": "q_1",
    "prompt": "..."
  }
]
```

### POST /question/{requestID}/reply
- Summary: 回复问题。
- cURL:
```bash
curl -s -X POST http://localhost:4096/question/q_1/reply -H 'content-type: application/json' -d '{"answers":["A"]}'
```

- Request Body:

```json
{
  "answers": [
    "A"
  ]
}
```
- Request:
```json
{
  "answers": [
    "A"
  ]
}
```
- Response:
```json
true
```

### POST /question/{requestID}/reject
- Summary: 拒绝问题。
- cURL:
```bash
curl -s -X POST http://localhost:4096/question/q_1/reject
```
- Response:
```json
true
```

## 13. TUI API

### POST /tui/append-prompt
- Summary: 追加输入框文本。
- cURL:
```bash
curl -s -X POST http://localhost:4096/tui/append-prompt -H 'content-type: application/json' -d '{"text":"hello"}'
```

- Request Body:

```json
{
  "text": "hello"
}
```
- Request:
```json
{
  "text": "hello"
}
```
- Response:
```json
true
```

### POST /tui/open-help
- Summary: 打开帮助面板。
- cURL:
```bash
curl -s -X POST http://localhost:4096/tui/open-help
```
- Response:
```json
true
```

### POST /tui/open-sessions
- Summary: 打开会话面板。
- cURL:
```bash
curl -s -X POST http://localhost:4096/tui/open-sessions
```
- Response:
```json
true
```

### POST /tui/open-models
- Summary: 打开模型面板。
- cURL:
```bash
curl -s -X POST http://localhost:4096/tui/open-models
```
- Response:
```json
true
```

### POST /tui/submit-prompt
- Summary: 提交当前 prompt。
- cURL:
```bash
curl -s -X POST http://localhost:4096/tui/submit-prompt
```
- Response:
```json
true
```

### POST /tui/clear-prompt
- Summary: 清空 prompt。
- cURL:
```bash
curl -s -X POST http://localhost:4096/tui/clear-prompt
```
- Response:
```json
true
```

### POST /tui/execute-command
- Summary: 执行 TUI 命令。
- cURL:
```bash
curl -s -X POST http://localhost:4096/tui/execute-command -H 'content-type: application/json' -d '{"command":"/help"}'
```

- Request Body:

```json
{
  "command": "/help"
}
```
- Request:
```json
{
  "command": "/help"
}
```
- Response:
```json
true
```

### POST /tui/show-toast
- Summary: 显示 toast。
- cURL:
```bash
curl -s -X POST http://localhost:4096/tui/show-toast -H 'content-type: application/json' -d '{"title":"Done","body":"ok"}'
```

- Request Body:

```json
{
  "title": "Done",
  "body": "ok"
}
```
- Request:
```json
{
  "title": "Done",
  "body": "ok"
}
```
- Response:
```json
true
```

### POST /tui/publish
- Summary: 发布 TUI event。
- cURL:
```bash
curl -s -X POST http://localhost:4096/tui/publish -H 'content-type: application/json' -d '{"type":"tui.toast.show","properties":{}}'
```

- Request Body:

```json
{
  "type": "tui.toast.show",
  "properties": {}
}
```
- Request:
```json
{
  "type": "tui.toast.show",
  "properties": {}
}
```
- Response:
```json
true
```

### POST /tui/select-session
- Summary: 选中会话。
- cURL:
```bash
curl -s -X POST http://localhost:4096/tui/select-session -H 'content-type: application/json' -d '{"sessionID":"ses_xxx"}'
```

- Request Body:

```json
{
  "sessionID": "ses_xxx"
}
```
- Request:
```json
{
  "sessionID": "ses_xxx"
}
```
- Response:
```json
true
```

## 14. 其他 API / Misc APIs

### PUT /auth/{providerID}
- Summary: 设置 provider 认证。
- cURL:
```bash
curl -s -X PUT http://localhost:4096/auth/openai -H 'content-type: application/json' -d '{"key":"sk-***"}'
```

- Request Body:

```json
{
  "key": "sk-***"
}
```
- Request:
```json
{
  "key": "sk-***"
}
```
- Response:
```json
true
```

### DELETE /auth/{providerID}
- Summary: 移除 provider 认证。
- cURL:
```bash
curl -s -X DELETE http://localhost:4096/auth/openai
```
- Response:
```json
true
```

### GET /provider
- Summary: 列 provider（可用与已连接）。
- cURL:
```bash
curl -s http://localhost:4096/provider
```
- Response:
```json
{
  "all": [
    {
      "id": "anthropic"
    }
  ],
  "connected": [
    {
      "id": "openai"
    }
  ],
  "default": {}
}
```

### GET /provider/auth
- Summary: 列 provider 认证方式。
- cURL:
```bash
curl -s http://localhost:4096/provider/auth
```
- Response:
```json
{
  "openai": [
    {
      "type": "api",
      "label": "API Key"
    }
  ]
}
```

### POST /provider/{providerID}/oauth/authorize
- Summary: 发起 Provider OAuth 授权。
- cURL:
```bash
curl -s -X POST http://localhost:4096/provider/openai/oauth/authorize -H 'content-type: application/json' -d '{"method":0}'
```

- Request Body:

```json
{
  "method": 0
}
```
- Request:
```json
{
  "method": 0
}
```
- Response:
```json
{
  "method": "code",
  "url": "https://...",
  "instructions": "..."
}
```

### POST /provider/{providerID}/oauth/callback
- Summary: 提交 Provider OAuth 回调结果。
- cURL:
```bash
curl -s -X POST http://localhost:4096/provider/openai/oauth/callback -H 'content-type: application/json' -d '{"method":0,"code":"abc"}'
```

- Request Body:

```json
{
  "method": 0,
  "code": "abc"
}
```
- Request:
```json
{
  "method": 0,
  "code": "abc"
}
```
- Response:
```json
true
```

### GET /path
- Summary: 获取目录路径信息。
- cURL:
```bash
curl -s http://localhost:4096/path
```
- Response:
```json
{
  "home": "/home/user",
  "state": "/home/user/.opencode",
  "directory": "/repo"
}
```

### GET /vcs
- Summary: 获取版本控制状态。
- cURL:
```bash
curl -s http://localhost:4096/vcs
```
- Response:
```json
{
  "branch": "dev"
}
```

### GET /command
- Summary: 列命令集合。
- cURL:
```bash
curl -s http://localhost:4096/command
```
- Response:
```json
[
  {
    "name": "run",
    "description": "..."
  }
]
```

### POST /log
- Summary: 写 server 日志。
- cURL:
```bash
curl -s -X POST http://localhost:4096/log -H 'content-type: application/json' -d '{"service":"demo","level":"info","message":"hello"}'
```

- Request Body:

```json
{
  "service": "demo",
  "level": "info",
  "message": "hello"
}
```
- Request:
```json
{
  "service": "demo",
  "level": "info",
  "message": "hello",
  "extra": {}
}
```
- Response:
```json
true
```

### GET /agent
- Summary: 列 agent。
- cURL:
```bash
curl -s http://localhost:4096/agent
```
- Response:
```json
[
  {
    "id": "build"
  },
  {
    "id": "plan"
  }
]
```

### GET /skill
- Summary: 列 skill。
- cURL:
```bash
curl -s http://localhost:4096/skill
```
- Response:
```json
[
  {
    "id": "skill-creator"
  }
]
```

### GET /lsp
- Summary: 获取 LSP 状态。
- cURL:
```bash
curl -s http://localhost:4096/lsp
```
- Response:
```json
[
  {
    "name": "typescript",
    "ready": true
  }
]
```

### GET /formatter
- Summary: 获取 formatter 状态。
- cURL:
```bash
curl -s http://localhost:4096/formatter
```
- Response:
```json
[
  {
    "name": "prettier",
    "available": true
  }
]
```

### GET /event
- Summary: 订阅实例 SSE（详见 SSE 文档）。
- cURL:
```bash
curl -N http://localhost:4096/event
```
- Response:
```json
{
  "type": "server.connected",
  "properties": {}
}
```

### POST /instance/dispose
- Summary: 清理当前实例。
- cURL:
```bash
curl -s -X POST http://localhost:4096/instance/dispose
```
- Response:
```json
true
```

## 15. 实现锚点 / Implementation Anchors

- Server composition: `packages/opencode/src/server/server.ts`
- Domain routes: `packages/opencode/src/server/routes/*.ts`
- Error mapping: `packages/opencode/src/server/error.ts`
- API source docs: `docs/opencode-server-api-docs.md`

## 16. `dev` 对齐补充端点（Since 标注）

以下端点来自 `dev@cf425d114` 的 OpenAPI 差异补齐，均为 `since v1.2.0`。

### GET /experimental/session
- Summary: 获取实验性 session 列表。
- Since: `v1.2.0`
- 参数:

| 字段 | 类型 | 必填性 | 版本 | 说明 |
| --- | --- | --- | --- | --- |
| `directory` | `string` | 可选 | `since v1.2.0` | 目录上下文（query/header） |

- Response 字段:

| 字段 | 类型 | 必填性 | 版本 | 说明 |
| --- | --- | --- | --- | --- |
| `items[]` | `Session[]` | 必填 | `since v1.2.0` | 会话列表 |

### GET /experimental/workspace
- Summary: 获取实验性 workspace 列表。
- Since: `v1.2.0`
- Response 字段:

| 字段 | 类型 | 必填性 | 版本 | 说明 |
| --- | --- | --- | --- | --- |
| `items[]` | `Workspace[]` | 必填 | `since v1.2.0` | workspace 列表 |

### POST /experimental/workspace
- Summary: 创建实验性 workspace。
- Since: `v1.2.0`
- Request 字段:

| 字段 | 类型 | 必填性 | 版本 | 说明 |
| --- | --- | --- | --- | --- |
| `name` | `string` | 可选 | `since v1.2.0` | workspace 名称 |
| `directory` | `string` | 可选 | `since v1.2.0` | 目标目录 |

- Response 字段:

| 字段 | 类型 | 必填性 | 版本 | 说明 |
| --- | --- | --- | --- | --- |
| `ok` | `boolean` | 必填 | `since v1.2.0` | 创建结果 |

### DELETE /experimental/workspace/{id}
- Summary: 删除实验性 workspace。
- Since: `v1.2.0`
- 参数:

| 字段 | 类型 | 必填性 | 版本 | 说明 |
| --- | --- | --- | --- | --- |
| `id` | `string` | 必填 | `since v1.2.0` | workspace ID（path） |

- Response: `true`

### GET /session/{sessionID}/message/{messageID}
- Summary: 获取单条消息详情。
- Since: `v1.2.0`
- 参数:

| 字段 | 类型 | 必填性 | 版本 | 说明 |
| --- | --- | --- | --- | --- |
| `sessionID` | `string` | 必填 | `since v1.2.0` | 会话 ID（path） |
| `messageID` | `string` | 必填 | `since v1.2.0` | 消息 ID（path） |

- Response 字段:

| 字段 | 类型 | 必填性 | 版本 | 说明 |
| --- | --- | --- | --- | --- |
| `id` | `string` | 必填 | `since v1.2.0` | 消息 ID |
| `role` | `string` | 必填 | `since v1.2.0` | 消息角色 |

### DELETE /session/{sessionID}/message/{messageID}
- Summary: 删除单条消息。
- Since: `v1.2.0`
- 参数:

| 字段 | 类型 | 必填性 | 版本 | 说明 |
| --- | --- | --- | --- | --- |
| `sessionID` | `string` | 必填 | `since v1.2.0` | 会话 ID（path） |
| `messageID` | `string` | 必填 | `since v1.2.0` | 消息 ID（path） |

- Response: `true`

### PATCH /session/{sessionID}/message/{messageID}/part/{partID}
- Summary: 更新消息分片（part）。
- Since: `v1.2.0`
- 参数:

| 字段 | 类型 | 必填性 | 版本 | 说明 |
| --- | --- | --- | --- | --- |
| `sessionID` | `string` | 必填 | `since v1.2.0` | 会话 ID（path） |
| `messageID` | `string` | 必填 | `since v1.2.0` | 消息 ID（path） |
| `partID` | `string` | 必填 | `since v1.2.0` | part ID（path） |

- Request 字段:

| 字段 | 类型 | 必填性 | 版本 | 说明 |
| --- | --- | --- | --- | --- |
| `part` | `object` | 必填 | `since v1.2.0` | part 新状态 |

- Response: `true`

### DELETE /session/{sessionID}/message/{messageID}/part/{partID}
- Summary: 删除消息分片（part）。
- Since: `v1.2.0`
- 参数:

| 字段 | 类型 | 必填性 | 版本 | 说明 |
| --- | --- | --- | --- | --- |
| `sessionID` | `string` | 必填 | `since v1.2.0` | 会话 ID（path） |
| `messageID` | `string` | 必填 | `since v1.2.0` | 消息 ID（path） |
| `partID` | `string` | 必填 | `since v1.2.0` | part ID（path） |

- Response: `true`

### DELETE /mcp/{name}/auth
- Summary: 删除 MCP 鉴权状态。
- Since: `v1.2.0`
- 参数:

| 字段 | 类型 | 必填性 | 版本 | 说明 |
| --- | --- | --- | --- | --- |
| `name` | `string` | 必填 | `since v1.2.0` | MCP 服务名（path） |

- Response: `true`

### POST /mcp/{name}/auth/authenticate
- Summary: 提交 MCP 鉴权结果。
- Since: `v1.2.0`
- 参数:

| 字段 | 类型 | 必填性 | 版本 | 说明 |
| --- | --- | --- | --- | --- |
| `name` | `string` | 必填 | `since v1.2.0` | MCP 服务名（path） |

- Request 字段:

| 字段 | 类型 | 必填性 | 版本 | 说明 |
| --- | --- | --- | --- | --- |
| `code` | `string` | 可选 | `since v1.2.0` | 授权码 |
| `state` | `string` | 可选 | `since v1.2.0` | OAuth state |

- Response: `true`

### GET /tui/control/next
- Summary: 获取 TUI 控制流下一步状态。
- Since: `v1.2.0`
- Response 字段:

| 字段 | 类型 | 必填性 | 版本 | 说明 |
| --- | --- | --- | --- | --- |
| `next` | `string` | 可选 | `since v1.2.0` | 下一控制动作 |

### POST /tui/control/response
- Summary: 提交 TUI 控制响应。
- Since: `v1.2.0`
- Request 字段:

| 字段 | 类型 | 必填性 | 版本 | 说明 |
| --- | --- | --- | --- | --- |
| `action` | `string` | 必填 | `since v1.2.0` | 用户动作 |
| `payload` | `object` | 可选 | `since v1.2.0` | 附加数据 |

- Response: `true`

### POST /tui/open-themes
- Summary: 打开 TUI 主题选择器。
- Since: `v1.2.0`
- Response: `true`

## 17. 版本备注规则

1. 字段表中的 `版本` 列采用：`since vX.Y.Z` / `changed vX.Y.Z` / `runtime-only@vX.Y.Z`。
2. 本文件增补端点均以 `dev@cf425d114` 为契约基线，标注为 `since v1.2.0`。
3. 若后续发现更早发布版本，按 tag 回溯结果更新 `since` 值。
