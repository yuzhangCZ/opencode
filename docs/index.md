# OpenCode 文档总索引 / Documentation Index

## 阅读入口 / Entry Points

1. 架构分层索引（Layered Architecture）
   - [docs/architecture/index.md](./architecture/index.md)
2. 分包架构索引（Package Architecture）
   - [docs/packages/index.md](./packages/index.md)
   - 核心分组：`docs/packages/core/*`
   - 支撑分组：`docs/packages/support/*`
   - `packages/opencode` 专项：`docs/architecture/*`（通过 `docs/packages/core/opencode.md` 进入）
3. REST 接口参考（REST API）
   - [docs/api/01-rest-reference.md](./api/01-rest-reference.md)
4. SSE 事件参考（SSE API）
   - [docs/api/02-sse-reference.md](./api/02-sse-reference.md)

## 推荐路径 / Suggested Paths

1. 系统视角：`architecture/index.md` -> `01/02/03` -> API 文档。
2. 包视角：`packages/index.md` -> 任意 package 架构页 -> 回跳到系统层。
