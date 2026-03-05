# app package 架构 / `packages/app`

## Role
`@opencode-ai/app` 提供主应用前端（SolidJS），承载会话 UI、输入/输出渲染、客户端状态管理。

## Boundary
- In scope: Web/Desktop 共用应用层 UI 与交互逻辑。
- Out of scope: 原生容器能力（Tauri）、服务端路由。

## Entrypoints
- 导出入口：`packages/app/src/index.ts`
- 页面挂载：`packages/app/src/entry.tsx`
- 应用根：`packages/app/src/app.tsx`

## External Surface
- npm export：`.`、`./vite`、`./index.css`
- 通过 `@opencode-ai/sdk` 访问后端 API。

## Dependencies
- `@opencode-ai/ui`、`@opencode-ai/util`、`@opencode-ai/sdk`
- `solid-js`、`@solidjs/router`

## Data Flow
1. 用户输入 -> prompt component -> SDK 调用 -> session event/state 更新 -> UI 渲染。

## Error & Observability
- 前端错误边界与 toast 在 `context`/`components` 维度处理。

## Relations
- 被 `desktop` 复用。
- 依赖 `ui` 作为设计系统。

## Evidence
1. `packages/app/package.json`
2. `packages/app/src/index.ts`
3. `packages/app/src/entry.tsx`
4. `packages/app/src/app.tsx`
5. `packages/app/src/context`
6. `packages/app/src/components`

## Limitations & Evolution
- 与 `desktop` 共用逻辑较多，建议持续抽离可复用 context/hooks 到 `ui` 或独立共享层。
