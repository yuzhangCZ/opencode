> [!NOTE]
> 历史文档保留：本页为旧平铺路径，内容保留不删除。
> 新版分组路径请优先参考：[extensions.md](./support/extensions.md)

# extensions package 架构 / `packages/extensions`

## Role
`packages/extensions` 管理编辑器扩展相关资产（当前可见 `zed`）。

## Boundary
- In scope: 编辑器扩展配置、安装说明、扩展资源。
- Out of scope: OpenCode 主运行时。

## Entrypoints
- 当前入口目录：`packages/extensions/zed`

## External Surface
- 编辑器扩展分发或安装指引资产。

## Dependencies
- 依赖具体编辑器生态规范。

## Data Flow
1. 扩展配置 -> 编辑器加载 -> 与 OpenCode 工作流联动。

## Error & Observability
- 以编辑器扩展日志与配置校验为主。

## Relations
- 补充 OpenCode 在 IDE/编辑器生态的触点。

## Evidence
1. `packages/extensions/zed`
2. `packages/extensions`
3. 仓库根 `README*`（扩展使用语境）
4. `packages/opencode/src/ide`
5. `packages/opencode/src/lsp`

## Limitations & Evolution
- 建议补充每个扩展目录的 README 与兼容版本说明。
