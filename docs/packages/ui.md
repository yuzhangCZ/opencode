> [!NOTE]
> 历史文档保留：本页为旧平铺路径，内容保留不删除。
> 新版分组路径请优先参考：[ui.md](./support/ui.md)

# ui package 架构 / `packages/ui`

## Role
`@opencode-ai/ui` 是共享设计系统（design system）与可复用组件库。

## Boundary
- In scope: 组件、主题、样式、i18n 片段、hooks/context。
- Out of scope: 业务编排与后端 API 流程。

## Entrypoints
- components exports：`packages/ui/package.json` `exports`
- 主题：`packages/ui/src/theme`
- 样式：`packages/ui/src/styles`

## External Surface
- 多入口导出（components/hooks/context/theme/icons/fonts/audio）

## Dependencies
- `solid-js`、`@kobalte/core`、`@opencode-ai/util`、`@opencode-ai/sdk`

## Data Flow
1. 业务包（app/enterprise/desktop）引用 UI primitives -> 组合业务页面。

## Error & Observability
- 主要以组件层错误边界与调用方日志为主。

## Relations
- 被 `app/desktop/enterprise` 复用。

## Evidence
1. `packages/ui/package.json`
2. `packages/ui/src/components`
3. `packages/ui/src/theme`
4. `packages/ui/src/styles`
5. `packages/ui/src/context`
6. `packages/ui/src/hooks`

## Limitations & Evolution
- 导出面较大，建议按稳定度分层（stable/experimental）。
