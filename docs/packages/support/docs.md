# docs package 架构 / `packages/docs`

## Role
`packages/docs` 管理文档站内容与发布配置（Mintlify 风格结构）。

## Boundary
- In scope: docs.json、mdx 内容、文档资源。
- Out of scope: `opencode` 运行时 API 实现。

## Entrypoints
- 文档配置：`packages/docs/docs.json`
- 首页：`packages/docs/index.mdx`
- 快速开始：`packages/docs/quickstart.mdx`

## External Surface
- 面向最终用户的文档站内容产物。

## Dependencies
- 文档工具链（由部署平台处理）。

## Data Flow
1. markdown/mdx 内容 -> docs toolchain -> docs site 发布。

## Error & Observability
- 文档构建错误主要来自 frontmatter/schema 校验与链接失效。

## Relations
- 与仓库根 `docs/`（工程内架构文档）定位不同：`packages/docs` 偏产品文档发布。

## Evidence
1. `packages/docs/README.md`
2. `packages/docs/docs.json`
3. `packages/docs/index.mdx`
4. `packages/docs/quickstart.mdx`
5. `packages/docs/essentials`
6. `packages/docs/development.mdx`

## Limitations & Evolution
- 建议定义“产品文档 vs 工程文档”边界，避免重复维护。
