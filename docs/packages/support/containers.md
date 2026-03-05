# containers package 架构 / `packages/containers`

## Role
`packages/containers` 管理容器镜像与基础构建环境，支撑 CI/CD 与发布流程。

## Boundary
- In scope: 基础镜像、发布镜像、构建脚本、平台容器。
- Out of scope: 业务运行时逻辑。

## Entrypoints
- 文档入口：`packages/containers/README.md`
- 子目录入口：`base`、`bun-node`、`publish`、`rust`、`tauri-linux`

## External Surface
- 镜像构建资产（Docker/CI pipeline 使用）。

## Dependencies
- 与仓库构建链路、CI 环境耦合。

## Data Flow
1. CI 触发 -> 选择容器模板 -> 构建镜像 -> 供 build/test/release 复用。

## Error & Observability
- 主要依赖 CI 日志与容器构建日志。

## Relations
- 支撑 `opencode/desktop/web` 等产物构建。

## Evidence
1. `packages/containers/README.md`
2. `packages/containers/base`
3. `packages/containers/bun-node`
4. `packages/containers/publish`
5. `packages/containers/tauri-linux`
6. `packages/containers/rust`

## Limitations & Evolution
- 建议补充各容器目录用途与使用场景映射表。
