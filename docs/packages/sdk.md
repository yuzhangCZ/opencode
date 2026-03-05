> [!NOTE]
> 历史文档保留：本页为旧平铺路径，内容保留不删除。
> 新版分组路径请优先参考：[sdk.md](./core/sdk.md)

# sdk package 架构 / `packages/sdk`

## Role
`packages/sdk` 提供 OpenCode API 的 JS SDK 与 OpenAPI 产物，是外部集成与插件调用的主契约层。

## Boundary
- In scope: OpenAPI schema、SDK 代码生成、client 封装（v1/v2）。
- Out of scope: server 运行时实现。

## Entrypoints
- OpenAPI schema：`packages/sdk/openapi.json`
- JS SDK：`packages/sdk/js/src/index.ts`
- v2 SDK：`packages/sdk/js/src/v2/index.ts`

## External Surface
- `@opencode-ai/sdk` npm export
- `createOpencodeClient` / `createOpencode` / generated APIs

## Dependencies
- `@hey-api/openapi-ts`（代码生成）
- 与 `opencode` 通过 schema 同步

## Data Flow
1. `opencode` 生成/维护 OpenAPI -> sdk build 生成 client/types -> 插件与应用调用。

## Error & Observability
- SDK 错误模型来自 generated client（`error/response` contract）。

## Relations
- 被 `app`、`plugin`、`slack`、外部集成广泛依赖。

## Evidence
1. `packages/sdk/openapi.json`
2. `packages/sdk/js/package.json`
3. `packages/sdk/js/src/index.ts`
4. `packages/sdk/js/src/client.ts`
5. `packages/sdk/js/src/v2/index.ts`
6. `packages/sdk/js/src/gen`

## Limitations & Evolution
- 生成代码易漂移，建议固定生成流程与版本变更日志。
