# util package 架构 / `packages/util`

## Role
`@opencode-ai/util` 提供跨包通用工具函数与错误模型辅助，减少重复实现。

## Boundary
- In scope: encode/path/retry/error/identifier 等轻量 utilities。
- Out of scope: 业务流程与状态管理。

## Entrypoints
- 导出：`packages/util/package.json` -> `./src/*.ts`

## External Surface
- 按文件级导出工具模块。

## Dependencies
- `zod`

## Data Flow
1. 业务包调用 util helper -> 返回纯函数结果 -> 上层决定控制流。

## Error & Observability
- 错误对象与辅助函数集中在 `error.ts`。

## Relations
- 被 `opencode/app/ui/enterprise` 等广泛依赖。

## Evidence
1. `packages/util/package.json`
2. `packages/util/src/error.ts`
3. `packages/util/src/path.ts`
4. `packages/util/src/retry.ts`
5. `packages/util/src/encode.ts`
6. `packages/util/src/identifier.ts`

## Limitations & Evolution
- 建议继续保持“无副作用、低依赖”原则，避免侵入业务语义。
