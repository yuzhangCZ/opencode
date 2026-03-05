# enterprise package 架构 / `packages/enterprise`

## Role
`@opencode-ai/enterprise` 提供企业版 Web 应用与服务入口，聚焦组织、鉴权、部署目标（含 Cloudflare）扩展。

## Boundary
- In scope: 企业入口路由、前后端一体逻辑、部署目标适配。
- Out of scope: 通用 CLI/server 运行时。

## Entrypoints
- 客户端入口：`packages/enterprise/src/entry-client.tsx`
- 服务端入口：`packages/enterprise/src/entry-server.tsx`
- 应用根：`packages/enterprise/src/app.tsx`

## External Surface
- `vite` 构建产物
- Cloudflare target build（`build:cloudflare`）

## Dependencies
- `@opencode-ai/ui`、`@opencode-ai/util`
- `hono`、`@solidjs/start`

## Data Flow
1. 用户请求 -> server entry -> route/core -> 响应渲染或 API 透传。

## Error & Observability
- 路由与核心逻辑在 `core` 与 `routes` 层分离，便于日志归因。

## Relations
- 与 `app` 功能相近但面向企业场景。

## Evidence
1. `packages/enterprise/package.json`
2. `packages/enterprise/src/entry-client.tsx`
3. `packages/enterprise/src/entry-server.tsx`
4. `packages/enterprise/src/app.tsx`
5. `packages/enterprise/src/core`
6. `packages/enterprise/src/routes`

## Limitations & Evolution
- 企业特性会持续演进，建议单独维护 capability matrix（auth/audit/deployment）。
