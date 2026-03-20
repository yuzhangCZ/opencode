# REST 接口总目录

- Contract Baseline: `dev`
- Last Verified: `2026-03-19`
- Scope: 仅列出 JSON HTTP 接口；SSE / WebSocket 端点不在本页展开

## 1. 分类导航

1. [Global / App 元信息接口](./01-global-app-apis.md)
2. [Project / Config / Provider 接口](./02-project-config-provider-apis.md)
3. [Session 接口](./03-session-apis.md)
4. [Permission / Question 接口](./04-permission-question-apis.md)
5. [File / LSP / Formatter 接口](./05-file-lsp-formatter-apis.md)
6. [MCP / PTY 接口](./06-mcp-pty-apis.md)
7. [Experimental / TUI 接口](./07-experimental-tui-apis.md)

## 2. Stable

| Method | Path | 分类 | 说明 |
| --- | --- | --- | --- |
| `GET` | `/global/health` | Global | 服务健康检查 |
| `GET` | `/global/config` | Global | 读取全局配置 |
| `PATCH` | `/global/config` | Global | 更新全局配置 |
| `POST` | `/global/dispose` | Global | 释放所有实例资源 |
| `POST` | `/instance/dispose` | Global | 释放当前实例资源 |
| `GET` | `/path` | App | 获取 home/state/config/worktree/directory 路径 |
| `GET` | `/vcs` | App | 获取当前项目分支信息 |
| `GET` | `/command` | App | 列出命令 |
| `POST` | `/log` | App | 写入服务日志 |
| `GET` | `/agent` | App | 列出 agent |
| `GET` | `/skill` | App | 列出 skill |
| `GET` | `/lsp` | App | 获取 LSP 状态 |
| `GET` | `/formatter` | App | 获取 formatter 状态 |
| `PUT` | `/auth/{providerID}` | Provider/Auth | 写入 provider 凭据 |
| `DELETE` | `/auth/{providerID}` | Provider/Auth | 删除 provider 凭据 |
| `GET` | `/project` | Project | 列出项目 |
| `GET` | `/project/current` | Project | 获取当前项目 |
| `PATCH` | `/project/{projectID}` | Project | 更新项目 |
| `GET` | `/config` | Config | 读取实例配置 |
| `PATCH` | `/config` | Config | 更新实例配置 |
| `GET` | `/config/providers` | Config | 列出配置后的 provider 视图 |
| `GET` | `/provider` | Provider | 列出 provider |
| `GET` | `/provider/auth` | Provider | 列出 provider 登录方式 |
| `POST` | `/provider/{providerID}/oauth/authorize` | Provider | 发起 provider OAuth |
| `POST` | `/provider/{providerID}/oauth/callback` | Provider | 提交 provider OAuth 回调 |
| `GET` | `/session` | Session | 列出 session |
| `POST` | `/session` | Session | 创建 session |
| `GET` | `/session/status` | Session | 获取 session 状态映射 |
| `GET` | `/session/{sessionID}` | Session | 获取 session |
| `DELETE` | `/session/{sessionID}` | Session | 删除 session |
| `PATCH` | `/session/{sessionID}` | Session | 更新 session |
| `GET` | `/session/{sessionID}/children` | Session | 获取 fork 子会话 |
| `GET` | `/session/{sessionID}/todo` | Session | 获取 todo 列表 |
| `POST` | `/session/{sessionID}/init` | Session | 初始化 session |
| `POST` | `/session/{sessionID}/fork` | Session | 从指定节点 fork |
| `POST` | `/session/{sessionID}/abort` | Session | 中止运行中的 session |
| `POST` | `/session/{sessionID}/share` | Session | 分享 session |
| `DELETE` | `/session/{sessionID}/share` | Session | 取消分享 |
| `GET` | `/session/{sessionID}/diff` | Session | 获取某条消息导致的 diff |
| `POST` | `/session/{sessionID}/summarize` | Session | 触发会话总结/压缩 |
| `GET` | `/session/{sessionID}/message` | Session | 列出消息 |
| `POST` | `/session/{sessionID}/message` | Session | 发送 prompt |
| `GET` | `/session/{sessionID}/message/{messageID}` | Session | 获取单条消息 |
| `DELETE` | `/session/{sessionID}/message/{messageID}` | Session | 删除消息 |
| `DELETE` | `/session/{sessionID}/message/{messageID}/part/{partID}` | Session | 删除消息 part |
| `PATCH` | `/session/{sessionID}/message/{messageID}/part/{partID}` | Session | 更新消息 part |
| `POST` | `/session/{sessionID}/prompt_async` | Session | 异步发送 prompt |
| `POST` | `/session/{sessionID}/command` | Session | 执行命令型 prompt |
| `POST` | `/session/{sessionID}/shell` | Session | 执行 shell 命令 |
| `POST` | `/session/{sessionID}/revert` | Session | 回滚消息结果 |
| `POST` | `/session/{sessionID}/unrevert` | Session | 恢复已回滚内容 |
| `POST` | `/session/{sessionID}/permissions/{permissionID}` | Session | 已弃用的权限回复接口 |
| `GET` | `/permission` | Permission | 列出待处理权限请求 |
| `POST` | `/permission/{requestID}/reply` | Permission | 回复权限请求 |
| `GET` | `/question` | Question | 列出待处理问题 |
| `POST` | `/question/{requestID}/reply` | Question | 回答问题 |
| `POST` | `/question/{requestID}/reject` | Question | 拒绝问题 |
| `GET` | `/find` | File | 文本搜索 |
| `GET` | `/find/file` | File | 文件名搜索 |
| `GET` | `/find/symbol` | File | 符号搜索 |
| `GET` | `/file` | File | 列目录 |
| `GET` | `/file/content` | File | 读文件 |
| `GET` | `/file/status` | File | Git 文件状态 |
| `GET` | `/mcp` | MCP | 获取 MCP 状态 |
| `POST` | `/mcp` | MCP | 新增 MCP 服务 |
| `POST` | `/mcp/{name}/auth` | MCP | 发起 MCP OAuth |
| `DELETE` | `/mcp/{name}/auth` | MCP | 删除 MCP OAuth 凭据 |
| `POST` | `/mcp/{name}/auth/callback` | MCP | 提交 MCP OAuth code |
| `POST` | `/mcp/{name}/auth/authenticate` | MCP | 启动浏览器完成 MCP OAuth |
| `POST` | `/mcp/{name}/connect` | MCP | 连接 MCP |
| `POST` | `/mcp/{name}/disconnect` | MCP | 断开 MCP |
| `GET` | `/pty` | PTY | 列出 PTY |
| `POST` | `/pty` | PTY | 创建 PTY |
| `GET` | `/pty/{ptyID}` | PTY | 获取 PTY |
| `PUT` | `/pty/{ptyID}` | PTY | 更新 PTY 元数据 |
| `DELETE` | `/pty/{ptyID}` | PTY | 删除 PTY |

## 3. Experimental

| Method | Path | 分类 | 说明 |
| --- | --- | --- | --- |
| `GET` | `/experimental/tool/ids` | Experimental | 列出工具 ID |
| `GET` | `/experimental/tool` | Experimental | 列出模型可用工具和参数 schema |
| `POST` | `/experimental/workspace` | Experimental | 创建 workspace |
| `GET` | `/experimental/workspace` | Experimental | 列出 workspace |
| `DELETE` | `/experimental/workspace/{id}` | Experimental | 删除 workspace |
| `POST` | `/experimental/worktree` | Experimental | 创建 worktree |
| `GET` | `/experimental/worktree` | Experimental | 列出 worktree |
| `DELETE` | `/experimental/worktree` | Experimental | 删除 worktree |
| `POST` | `/experimental/worktree/reset` | Experimental | 重置 worktree |
| `GET` | `/experimental/session` | Experimental | 跨项目列出 session |
| `GET` | `/experimental/resource` | Experimental | 列出 MCP 资源 |

## 4. Internal

| Method | Path | 分类 | 说明 |
| --- | --- | --- | --- |
| `POST` | `/tui/append-prompt` | TUI | 向 TUI 输入框追加文本 |
| `POST` | `/tui/open-help` | TUI | 打开帮助面板 |
| `POST` | `/tui/open-sessions` | TUI | 打开 session 列表 |
| `POST` | `/tui/open-themes` | TUI | 打开主题选择 |
| `POST` | `/tui/open-models` | TUI | 打开模型选择 |
| `POST` | `/tui/submit-prompt` | TUI | 提交当前 prompt |
| `POST` | `/tui/clear-prompt` | TUI | 清空 prompt |
| `POST` | `/tui/execute-command` | TUI | 执行 TUI 命令 |
| `POST` | `/tui/show-toast` | TUI | 展示 toast |
| `POST` | `/tui/publish` | TUI | 发布 TUI 事件 |
| `POST` | `/tui/select-session` | TUI | 跳转 session |
| `GET` | `/tui/control/next` | TUI Control | 取下一个控制请求 |
| `POST` | `/tui/control/response` | TUI Control | 回写控制响应 |
