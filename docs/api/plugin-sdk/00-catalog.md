# Plugin SDK 总目录

- Contract Baseline: `dev`
- Last Verified: `2026-03-19`

本目录按“插件作者的阅读顺序”组织，而不是按源码目录平铺。

标记说明：

- `runtime-available`: 当前插件 runtime 默认可直接使用
- `v2-diff`: 该页或该节有重要 v2 差异
- `experimental`: 包含实验性质 hooks 或 API
- `best-effort`: 可用，但不应作为唯一主路径

## 推荐阅读顺序

1. [01-quickstart.md](./01-quickstart.md) `runtime-available`
2. [02-plugin-contract.md](./02-plugin-contract.md) `runtime-available` `experimental`
3. [03-tool-api.md](./03-tool-api.md) `runtime-available`
4. [04-sdk-overview.md](./04-sdk-overview.md) `runtime-available` `v2-diff`
5. [05-session-and-message.md](./05-session-and-message.md) `runtime-available` `v2-diff`
6. [06-file-project-config.md](./06-file-project-config.md) `runtime-available` `v2-diff`
7. [07-provider-auth-and-mcp.md](./07-provider-auth-and-mcp.md) `runtime-available` `v2-diff`
8. [08-events-and-compat.md](./08-events-and-compat.md) `runtime-available` `best-effort` `v2-diff`
9. [09-server-mapping.md](./09-server-mapping.md) `runtime-available` `v2-diff`

## 你应该从哪一页开始

- 想先写一个最小插件：从 `01-quickstart.md` 开始
- 想知道 hook 什么时候触发：从 `02-plugin-contract.md` 开始
- 想写自定义工具：从 `03-tool-api.md` 开始
- 想知道 `input.client` 到底能调什么：从 `04-sdk-overview.md` 开始
- 想做 session / prompt / message：从 `05-session-and-message.md` 开始
- 想查 route / `operationId`：直接看 `09-server-mapping.md`
