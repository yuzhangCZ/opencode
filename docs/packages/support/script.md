# script package 架构 / `packages/script`

## Role
`@opencode-ai/script` 提供 monorepo 脚本工具与共享构建脚本辅助。

## Boundary
- In scope: 脚本 helper、构建流程共用代码。
- Out of scope: 业务运行时。

## Entrypoints
- 入口：`packages/script/src/index.ts`

## External Surface
- workspace 其他包通过 dependency 调用脚本能力。

## Dependencies
- 轻量依赖（Bun 环境）。

## Data Flow
1. build/test automation 调用 script helper -> 执行命令/生成流程。

## Error & Observability
- 依赖脚本执行返回码与标准输出。

## Relations
- 常被 `opencode` 等包作为 devDependency 使用。

## Evidence
1. `packages/script/package.json`
2. `packages/script/src/index.ts`
3. `packages/opencode/package.json`
4. `packages/opencode/script`
5. `packages/ui/script`

## Limitations & Evolution
- 建议为关键脚本补充 usage 文档和失败场景示例。
