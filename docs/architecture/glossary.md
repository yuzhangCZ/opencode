# 术语表 / Glossary

| 中文 | English | 说明 |
|---|---|---|
| 会话 | Session | AI 交互与上下文承载单元。 |
| 项目 | Project | 目录上下文与项目配置实体。 |
| 实例 | Instance | 针对目录初始化的一组运行态资源。 |
| 提供商 | Provider | 模型服务供应方（OpenAI/Anthropic/...）。 |
| 模型 | Model | Provider 下具体可调用模型。 |
| 工具 | Tool | Agent 可调用能力，如文件/命令/外部服务。 |
| 事件总线 | Event Bus | 进程内事件发布订阅机制（`Bus`）。 |
| 全局事件总线 | Global Event Bus | 跨实例事件广播机制（`GlobalBus`）。 |
| 服务器发送事件 | Server-Sent Events (SSE) | 单向事件流协议，基于 HTTP。 |
| 伪终端 | Pseudo Terminal (PTY) | 远程终端会话与 I/O 通道。 |
| 模型上下文协议 | Model Context Protocol (MCP) | 模型与外部能力交互协议。 |
| 语言服务协议 | Language Server Protocol (LSP) | 代码符号与语言智能接口。 |
| 工作树 | Worktree | VCS 的并行工作目录。 |
| 权限请求 | Permission Request | 需用户批准的动作请求。 |
| 问题请求 | Question Request | 需用户回答的问题项。 |
| 路由组合根 | Route Composition Root | 聚合中间件与路由的主入口。 |
| 上下文目录 | Directory Context | API 请求绑定的工作目录。 |
