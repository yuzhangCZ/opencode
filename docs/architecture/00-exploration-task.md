# OpenCode 架构探索任务 / Architecture Exploration Task

## 1. 目标 / Goals

本任务用于系统化探索 OpenCode 的架构设计与实现细节，形成可复用、可追溯、可验收的文档资产。

This task defines a repeatable architecture exploration workflow for OpenCode, with evidence-backed conclusions and clear acceptance criteria.

## 2. 范围 / Scope

### In Scope

- CLI/TUI/Server/Session/Provider/Tool/SDK/Web Docs 的端到端链路。
- Server 对外接口（REST + SSE），以现有 server 文档边界为准。
- 文档与实现一致性核对（documentation vs implementation gap analysis）。

### Out of Scope

- 运行时代码改造。
- 性能压测与容量评估。
- 发布流水线修改。

## 3. 执行步骤 / Execution Steps

1. 入口识别（Entry Discovery）
   - 从 `packages/opencode/src/index.ts` 跟踪命令入口。
   - 识别 `run / serve / tui / mcp / auth` 等路径。
2. 系统拓扑梳理（Topology Mapping）
   - 识别核心模块职责与依赖方向。
   - 输出“模块 -> 入口 -> 核心职责 -> 证据”。
3. 接口面探索（External Surface）
   - 按 `docs/opencode-server-api-docs.md` 端点边界生成 REST 参考。
   - 按 `docs/api/02-sse-reference.md` 与 `docs/api/sse/00-event-catalog.md` 生成 SSE 参考。
4. 实现证据归档（Implementation Anchors）
   - 每条结论对应源码路径 + 函数/路由名。
5. 差距审计（Gap Audit）
   - 标记“文档已写但实现不一致”或“实现存在但文档欠缺”。
6. 验收复核（Acceptance Review）
   - 检查链接可达、术语一致、示例完整。

## 4. 证据规则 / Evidence Rules

每条关键结论必须附带证据锚点：

- `packages/opencode/src/index.ts`（CLI command wiring）
- `packages/opencode/src/server/server.ts`（server middleware and top-level routes）
- `packages/opencode/src/server/routes/*.ts`（domain endpoints）
- `packages/opencode/src/bus/index.ts` + `packages/opencode/src/bus/global.ts`（event bus）

结论模板：

```md
- 结论 / Conclusion:
- 影响 / Impact:
- 证据 / Evidence: <absolute-or-repo path + function/route name>
```

## 5. 交付清单 / Deliverables

- `docs/architecture/01-overview.md`
- `docs/architecture/02-system-design.md`
- `docs/architecture/03-implementation-map.md`
- `docs/api/01-rest-reference.md`
- `docs/api/02-sse-reference.md`
- `docs/architecture/glossary.md`
- `docs/architecture/index.md`

## 6. 完成定义（DoD）/ Definition of Done

1. 至少 8 份分层文档存在且内容独立。
2. 接口条目包含说明、调用示例、报文示例。
3. `/event` 与 `/global/event` 的连接、心跳、重连语义完整。
4. 关键结论可追溯到源码锚点。
5. 从索引文档两次点击内可到达任一分层文档。

## 7. 风险与缓解 / Risks and Mitigation

- 风险：接口字段随版本变化。
  - 缓解：在接口文档中标注“source of truth”为当前仓库源码路径。
- 风险：SSE 事件种类扩展导致文档过时。
  - 缓解：事件分类采用“核心事件 + 可扩展事件”结构。
- 风险：中英文术语漂移。
  - 缓解：统一以 `docs/architecture/glossary.md` 为唯一术语源。
