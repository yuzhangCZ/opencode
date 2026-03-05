> [!NOTE]
> 历史文档保留：本页为旧平铺路径，内容保留不删除。
> 新版分组路径请优先参考：[slack.md](./support/slack.md)

# slack package 架构 / `packages/slack`

## Role
`@opencode-ai/slack` 提供 Slack Bot 适配层，将 Slack 消息桥接到 OpenCode session。

## Boundary
- In scope: Slack 事件消费、线程与 session 映射、消息转发。
- Out of scope: OpenCode 核心推理与会话存储实现。

## Entrypoints
- 主入口：`packages/slack/src/index.ts`

## External Surface
- Slack app runtime（Socket Mode）

## Dependencies
- `@slack/bolt`
- `@opencode-ai/sdk`

## Data Flow
1. Slack message -> create/find session -> prompt -> 回传 Slack thread。

## Error & Observability
- 通过 console logs 和 SDK 返回错误处理。

## Relations
- 典型外部集成示例，依赖 `sdk` 与 `opencode server`。

## Evidence
1. `packages/slack/package.json`
2. `packages/slack/src/index.ts`
3. `packages/slack/README.md`
4. `packages/slack/.env.example`
5. `packages/sdk/js/src/index.ts`

## Limitations & Evolution
- 生产环境建议补充重试与幂等策略（thread/session mapping）。
