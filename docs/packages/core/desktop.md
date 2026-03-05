# desktop package 架构 / `packages/desktop`

## Role
`@opencode-ai/desktop` 提供 Tauri 桌面壳层，负责应用容器、系统能力桥接与桌面生命周期管理。

## Boundary
- In scope: Tauri 插件、窗口状态、系统菜单、桌面更新流程。
- Out of scope: 业务会话核心逻辑（由 `app/opencode` 提供）。

## Entrypoints
- Web 入口：`packages/desktop/src/entry.tsx`
- Desktop 主逻辑：`packages/desktop/src/index.tsx`
- Tauri 工程：`packages/desktop/src-tauri`

## External Surface
- 桌面应用分发产物（dmg/exe/appimage）。
- 暴露原生能力给前端层（tauri plugins）。

## Dependencies
- `@opencode-ai/app`、`@opencode-ai/ui`
- `@tauri-apps/api` 与多个 tauri plugin

## Data Flow
1. Desktop 启动 -> preload/init -> app 挂载 -> native bridge 调用系统能力。

## Error & Observability
- 更新、CLI 调用、系统错误在 `updater.ts`/`cli.ts` 处理。

## Relations
- 上游依赖 `app` 前端；下游连接操作系统能力。

## Evidence
1. `packages/desktop/package.json`
2. `packages/desktop/src/entry.tsx`
3. `packages/desktop/src/index.tsx`
4. `packages/desktop/src/cli.ts`
5. `packages/desktop/src/updater.ts`
6. `packages/desktop/src-tauri`

## Limitations & Evolution
- 跨平台行为差异较大，建议按平台维护兼容矩阵与冒烟用例。
