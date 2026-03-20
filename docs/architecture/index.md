# OpenCode 架构文档索引（`packages/opencode` 专项）/ Architecture Docs Index (`packages/opencode` Focus)

> 说明：本目录当前用于 `packages/opencode` 包的专项架构分析；历史梳理内容保留并在此基础上增量扩展。

## 分层目录 / Layered Structure

1. 任务层 / Task Layer
   - [`00-exploration-task.md`](./00-exploration-task.md)
2. 总览层 / Overview Layer
   - [`01-overview.md`](./01-overview.md)
3. 架构层 / System Design Layer
   - [`02-system-design.md`](./02-system-design.md)
4. 实现层 / Implementation Layer
   - [`03-implementation-map.md`](./03-implementation-map.md)
5. 专题分析 / Incident Analysis Layer
   - [`04-plugin-client-event-analysis.md`](./04-plugin-client-event-analysis.md)
   - [`05-plugin-loading-versioning.md`](./05-plugin-loading-versioning.md)
   - [`06-context-model.md`](./06-context-model.md)
6. 接口层 / REST API Layer
   - [`../api/01-rest-reference.md`](../api/01-rest-reference.md)
7. 事件层 / SSE API Layer
   - [`../api/02-sse-reference.md`](../api/02-sse-reference.md)
8. 术语层 / Glossary Layer
   - [`glossary.md`](./glossary.md)

## 按 Package 阅读 / Package-Oriented Reading

1. 分包索引 / Package Index
   - [`../packages/index.md`](../packages/index.md)
2. opencode 分包页 / opencode Package Page
   - [`../packages/core/opencode.md`](../packages/core/opencode.md)
3. 文档总索引 / Docs Root Index
   - [`../index.md`](../index.md)

## 建议阅读路径 / Recommended Reading Path

1. 先读任务层，明确探索范围与验收。
2. 再读总览层与架构层，建立系统认知。
3. 进入实现层核对源码锚点。
4. 最后阅读 REST 与 SSE 接口参考。
5. 若需定位某个 package 的职责与边界，跳转 [`../packages/index.md`](../packages/index.md)。
6. 若需阅读 `packages/opencode` 全链路专项分析，停留本目录并配合 [`../packages/core/opencode.md`](../packages/core/opencode.md) 阅读。

## Source of Truth

- Server 架构：`docs/opencode-server-architecture.md`
- Server API：`docs/opencode-server-api-docs.md`
- SSE 实现：`docs/api/02-sse-reference.md`
- 代码实现：`packages/opencode/src/server/**`
