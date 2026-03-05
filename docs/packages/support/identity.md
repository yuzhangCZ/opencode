# identity package 架构 / `packages/identity`

## Role
`packages/identity` 管理 OpenCode 品牌标识资产（logo/mark 多尺寸与明暗主题版本）。

## Boundary
- In scope: 图标、标识 SVG/PNG 资源。
- Out of scope: 业务逻辑与运行时代码。

## Entrypoints
- 资产目录本身即入口。

## External Surface
- 被 docs/web/app 等消费为品牌资源。

## Dependencies
- 无运行时依赖。

## Data Flow
1. identity assets -> 各前端/文档项目引用 -> 展示统一品牌视觉。

## Error & Observability
- 关注资源完整性、尺寸与主题兼容。

## Relations
- 为全仓 UI 与文档输出统一视觉基线。

## Evidence
1. `packages/identity/mark.svg`
2. `packages/identity/mark-light.svg`
3. `packages/identity/mark-96x96.png`
4. `packages/identity/mark-192x192.png`
5. `packages/identity/mark-512x512.png`
6. `packages/identity/mark-512x512-light.png`

## Limitations & Evolution
- 建议补充品牌资源命名规范与用途映射文档。
