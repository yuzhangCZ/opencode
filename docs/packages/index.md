# OpenCode Packages 架构索引 / Package Architecture Index

## 说明 / Notes

- 本目录按 package 逐个描述职责、边界、入口、依赖、数据流与源码证据锚点。
- 中文主叙述，关键术语以英文补充。
- 每个页面采用统一契约字段：`Role`、`Boundary`、`Entrypoints`、`External Surface`、`Dependencies`、`Data Flow`、`Evidence`。
- 目录已按 `core/` 与 `support/` 分组；历史平铺文件保留为旧入口，不直接删除。

## 核心链路包 / Core Runtime Packages

1. [core/opencode.md](./core/opencode.md)
2. [core/app.md](./core/app.md)
3. [core/desktop.md](./core/desktop.md)
4. [core/enterprise.md](./core/enterprise.md)
5. [core/function.md](./core/function.md)
6. [core/sdk.md](./core/sdk.md)
7. [core/plugin.md](./core/plugin.md)

## 支撑与生态包 / Supporting Packages

1. [support/ui.md](./support/ui.md)
2. [support/util.md](./support/util.md)
3. [support/slack.md](./support/slack.md)
4. [support/script.md](./support/script.md)
5. [support/console.md](./support/console.md)
6. [support/containers.md](./support/containers.md)
7. [support/web.md](./support/web.md)
8. [support/docs.md](./support/docs.md)
9. [support/extensions.md](./support/extensions.md)
10. [support/identity.md](./support/identity.md)

## 历史入口（保留）/ Legacy Flat Paths (Preserved)

1. 旧平铺文档仍保留在 `docs/packages/*.md`，用于兼容既有链接与历史梳理。
2. 新内容优先维护在分组目录：`docs/packages/core` 与 `docs/packages/support`。
3. `packages/opencode` 专项架构文档统一放在 `docs/architecture/*`，并由 `core/opencode.md` 统一链接。

## 回跳 / Back Links

- 分层架构入口：[../architecture/index.md](../architecture/index.md)
- 文档总索引：[../index.md](../index.md)
