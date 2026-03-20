# plugin package 架构 / `packages/plugin`

## Role
`@opencode-ai/plugin` 定义插件契约（hooks/tool/auth/context types），是扩展生态的类型与协议层。

## Boundary
- In scope: PluginInput、Hooks、tool definition、shell helper。
- Out of scope: 插件装载生命周期（由 `opencode` runtime 负责）。

## Entrypoints
- 入口：`packages/plugin/src/index.ts`
- 工具定义：`packages/plugin/src/tool.ts`
- Shell helper：`packages/plugin/src/shell.ts`

## External Surface
- npm export: `.` 与 `./tool`

## Dependencies
- `@opencode-ai/sdk`、`zod`

## Data Flow
1. Runtime 注入 `PluginInput` -> 插件返回 hooks -> runtime 触发 hooks。

## Error & Observability
- 类型约束层面提供防护，运行时错误由宿主 `opencode` 记录。

## Relations
- 上游被 `opencode/src/plugin/index.ts` 消费。
- 接口参考见 `docs/api/03-plugin-sdk-reference.md` 与 `docs/api/plugin-sdk/*`。

## Evidence
1. `packages/plugin/package.json`
2. `packages/plugin/src/index.ts`
3. `packages/plugin/src/tool.ts`
4. `packages/plugin/src/shell.ts`
5. `packages/plugin/src/example.ts`
6. `packages/opencode/src/plugin/index.ts`

## Limitations & Evolution
- v1/v2 client 能力差异需在文档与类型层显式标注。
