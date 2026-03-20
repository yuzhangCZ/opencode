# Server 映射索引 / Server Mapping Index

本页只做索引，不重复参数表和完整 JSON 示例。

| 插件使用场景 | SDK group.method | `operationId` | HTTP | 推荐级别 | 详细说明 |
| --- | --- | --- | --- | --- | --- |
| 创建会话 | `session.create` | `session.create` | `POST /session` | 推荐 | [05-session-and-message.md](./05-session-and-message.md) |
| 获取会话 | `session.get` | `session.get` | `GET /session/{sessionID}` | 推荐 | [05-session-and-message.md](./05-session-and-message.md) |
| 更新会话 | `session.update` | `session.update` | `PATCH /session/{sessionID}` | 推荐 | [05-session-and-message.md](./05-session-and-message.md) |
| 删除会话 | `session.delete` | `session.delete` | `DELETE /session/{sessionID}` | 推荐 | [05-session-and-message.md](./05-session-and-message.md) |
| 拉取消息列表 | `session.messages` | `session.messages` | `GET /session/{sessionID}/message` | 推荐 | [05-session-and-message.md](./05-session-and-message.md) |
| 发送 prompt | `session.prompt` | `session.prompt` | `POST /session/{sessionID}/message` | 推荐 | [05-session-and-message.md](./05-session-and-message.md) |
| 后台 prompt | `session.promptAsync` | `session.prompt_async` | `POST /session/{sessionID}/prompt_async` | 推荐 | [05-session-and-message.md](./05-session-and-message.md) |
| 执行 command | `session.command` | `session.command` | `POST /session/{sessionID}/command` | 推荐 | [05-session-and-message.md](./05-session-and-message.md) |
| 执行 shell | `session.shell` | `session.shell` | `POST /session/{sessionID}/shell` | 推荐 | [05-session-and-message.md](./05-session-and-message.md) |
| 搜索文本 | `find.text` | `find.text` | `GET /find` | 推荐 | [06-file-project-config.md](./06-file-project-config.md) |
| 搜索文件 | `find.files` | `find.files` | `GET /find/file` | 推荐 | [06-file-project-config.md](./06-file-project-config.md) |
| 搜索符号 | `find.symbols` | `find.symbols` | `GET /find/symbol` | 推荐 | [06-file-project-config.md](./06-file-project-config.md) |
| 列目录 | `file.list` | `file.list` | `GET /file` | 推荐 | [06-file-project-config.md](./06-file-project-config.md) |
| 读文件 | `file.read` | `file.read` | `GET /file/content` | 推荐 | [06-file-project-config.md](./06-file-project-config.md) |
| 文件状态 | `file.status` | `file.status` | `GET /file/status` | 推荐 | [06-file-project-config.md](./06-file-project-config.md) |
| 当前项目 | `project.current` | `project.current` | `GET /project/current` | 推荐 | [06-file-project-config.md](./06-file-project-config.md) |
| 项目列表 | `project.list` | `project.list` | `GET /project` | 推荐 | [06-file-project-config.md](./06-file-project-config.md) |
| 读取配置 | `config.get` | `config.get` | `GET /config` | 推荐 | [06-file-project-config.md](./06-file-project-config.md) |
| 更新配置 | `config.update` | `config.update` | `PATCH /config` | 谨慎 | [06-file-project-config.md](./06-file-project-config.md) |
| provider 列表 | `provider.list` | `provider.list` | `GET /provider` | 推荐 | [07-provider-auth-and-mcp.md](./07-provider-auth-and-mcp.md) |
| provider 认证方式 | `provider.auth` | `provider.auth` | `GET /provider/auth` | 推荐 | [07-provider-auth-and-mcp.md](./07-provider-auth-and-mcp.md) |
| provider OAuth 授权 | `provider.oauth.authorize` | `provider.oauth.authorize` | `POST /provider/{id}/oauth/authorize` | 谨慎 | [07-provider-auth-and-mcp.md](./07-provider-auth-and-mcp.md) |
| provider OAuth 回调 | `provider.oauth.callback` | `provider.oauth.callback` | `POST /provider/{id}/oauth/callback` | 谨慎 | [07-provider-auth-and-mcp.md](./07-provider-auth-and-mcp.md) |
| 写入 auth | `auth.set` | `auth.set` | `PUT /auth/{id}` | 推荐 | [07-provider-auth-and-mcp.md](./07-provider-auth-and-mcp.md) |
| MCP 状态 | `mcp.status` | `mcp.status` | `GET /mcp` | 推荐 | [07-provider-auth-and-mcp.md](./07-provider-auth-and-mcp.md) |
| MCP 连接 | `mcp.connect` | `mcp.connect` | `POST /mcp/{name}/connect` | 推荐 | [07-provider-auth-and-mcp.md](./07-provider-auth-and-mcp.md) |
| MCP 断开 | `mcp.disconnect` | `mcp.disconnect` | `POST /mcp/{name}/disconnect` | 推荐 | [07-provider-auth-and-mcp.md](./07-provider-auth-and-mcp.md) |
| 实例事件订阅 | `event.subscribe` | `event.subscribe` | `GET /event` | best-effort | [08-events-and-compat.md](./08-events-and-compat.md) |
| TUI 控制 | `tui.*` | `tui.*` | `/tui/*` | 谨慎 | [04-sdk-overview.md](./04-sdk-overview.md) |

## v2-only 或 v2 更完整的映射提示

这些能力在 server 或 v2 SDK 中更完整，但当前插件默认注入的 v1 client 不应直接假设具备同名分组：

| 能力 | server / v2 状态 | 当前插件默认注入 v1 |
| --- | --- | --- |
| `permission.reply` | 已有 route，v2 已分组 | 默认无 `permission` 分组 |
| `question.reply` / `question.reject` | 已有 route，v2 已分组 | 默认无 `question` 分组 |
| `project.update` | 已有 route，v2 已支持 | 默认无 `project.update` |
| `experimental.*` | v2 更完整 | 默认无 `experimental` 分组 |
