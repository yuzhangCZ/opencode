# console package 架构 / `packages/console`

## Role
`packages/console` 是控制台相关能力聚合目录，包含 app/core/function/mail/resource 子模块。

## Boundary
- In scope: 控制台子系统代码组织。
- Out of scope: 单一 npm 包发布面（当前非独立 package.json）。

## Entrypoints
- 子模块入口分散在 `app/core/function/mail/resource`。

## External Surface
- 主要作为内部源码组织单元，非独立发包接口。

## Dependencies
- 依赖关系由子目录各自管理。

## Data Flow
1. console app/core 子模块协作 -> 形成控制台能力。

## Error & Observability
- 以子模块日志体系为准。

## Relations
- 与 `opencode` 运行时及其它平台层按子模块协作。

## Evidence
1. `packages/console/app`
2. `packages/console/core`
3. `packages/console/function`
4. `packages/console/mail`
5. `packages/console/resource`

## Limitations & Evolution
- 建议后续补充子模块级 README 与责任边界说明。
