> [!NOTE]
> 历史文档保留：本页为旧平铺路径，内容保留不删除。
> 新版分组路径请优先参考：[function.md](./core/function.md)

# function package 架构 / `packages/function`

## Role
`@opencode-ai/function` 提供函数化/边缘执行能力（API handlers），用于集成 GitHub/OAuth 等自动化流程。

## Boundary
- In scope: function API、授权/签名、远程调用适配。
- Out of scope: UI 交互与本地 CLI 体验。

## Entrypoints
- API 入口：`packages/function/src/api.ts`

## External Surface
- Hono handler / function endpoint（随部署平台暴露）。

## Dependencies
- `hono`、`jose`、`@octokit/*`

## Data Flow
1. 外部请求 -> API handler -> token/auth 校验 -> upstream API 调用 -> 返回结果。

## Error & Observability
- 依赖平台日志 + handler 内错误分支。

## Relations
- 可被 enterprise/automation 场景调用。

## Evidence
1. `packages/function/package.json`
2. `packages/function/src/api.ts`
3. `packages/function/tsconfig.json`
4. `packages/function/sst-env.d.ts`
5. `packages/function/node_modules`（构建运行依赖）

## Limitations & Evolution
- 当前入口集中在单文件，建议按 domain 拆分 handler 以提升可维护性。
