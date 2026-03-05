> [!NOTE]
> 历史文档保留：本页为旧平铺路径，内容保留不删除。
> 新版分组路径请优先参考：[web.md](./support/web.md)

# web package 架构 / `packages/web`

## Role
`@opencode-ai/web` 提供官网/文档站点前端（Astro + Starlight），承担内容展示与部分交互。

## Boundary
- In scope: Web 页面、内容渲染、站点中间件。
- Out of scope: opencode server runtime。

## Entrypoints
- 站点配置：`packages/web/astro.config.mjs`
- 内容配置：`packages/web/src/content.config.ts`
- 中间件：`packages/web/src/middleware.ts`

## External Surface
- 静态/SSR Web 站点。

## Dependencies
- `astro`、`@astrojs/starlight`、`@astrojs/solid-js`

## Data Flow
1. markdown/content -> Astro 构建 -> routes/pages -> 浏览器渲染。

## Error & Observability
- 构建错误由 Astro pipeline 暴露；运行时由中间件与平台日志跟踪。

## Relations
- 与 `packages/docs` 都涉及文档内容，但技术栈与目标不同。

## Evidence
1. `packages/web/package.json`
2. `packages/web/astro.config.mjs`
3. `packages/web/src/content.config.ts`
4. `packages/web/src/middleware.ts`
5. `packages/web/src/pages`
6. `packages/web/src/content`

## Limitations & Evolution
- 需避免与 `packages/docs` 文档来源重复，建议明确主发布渠道。
