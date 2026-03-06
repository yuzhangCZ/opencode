# packages/app 需求视角功能梳理（细粒度 + 优先级 + 验收）

> 范围：仅 `packages/app`。  
> 证据来源：`packages/app/src/**`，接口路径由 `packages/sdk/js/src/v2/gen/sdk.gen.ts` 反查。  
> 文档基线：`docs/api/01-rest-reference.md`、`docs/api/02-sse-reference.md`（事件细节在 `docs/api/sse/*`）。

## 1. 需求功能总览（按优先级）

- P0：11 条（REQ-APP-001,002,003,004,005,006,007,011,012,013,014）
- P1：13 条（REQ-APP-008,009,010,015,016,017,018,019,020,021,022,025,026）
- P2：10 条（REQ-APP-023,024,027,028,029,030,031,032,033,034）
- P3：0 条

## 2. 需求功能明细（按优先级 -> 需求ID）

### REQ-APP-001
- 需求名称：新建并进入会话
- 优先级：P0
- 需求内容：用户在无会话状态提交首条输入时，系统创建会话并自动跳转到该会话页。
- 触发入口：会话页 Prompt 输入框提交（新会话态）
- 前置条件：已选中目录；已选中模型和 agent。
- 主成功流程：创建会话 -> 写入 handoff tab -> 路由跳转到 `/{dir}/session/{id}`。
- 异常与降级行为：创建失败 toast 提示并停留当前页。
- 边界范围（In/Out）：In=新建并进入；Out=旧会话消息拉取细节。
- REST依赖（核心/辅助）：核心 `POST /session`；辅助 `GET /session`、`GET /session/{sessionID}/message`（后续同步）。
- SSE依赖（事件+用途）：驱动 `session.created`（全局会话列表插入）；补偿 `session.updated`（标题/状态后续收敛）。
- 验收标准（Given/When/Then）：
  - Given 新会话页且输入非空，When 提交，Then 创建成功后跳转到新会话 URL。
  - Given 会话创建失败，When 请求报错，Then 显示失败 toast 且不发生错误跳转。
- 证据（文件路径+行号）：`/Users/zy/Code/opencode/opencode/packages/app/src/components/prompt-input/submit.ts:145`, `:188`, `:200`
- 文档差异备注：无（`/session` 已在 01 文档）。

### REQ-APP-002
- 需求名称：会话中发送 Prompt 并看到响应
- 优先级：P0
- 需求内容：用户提交 Prompt 后立即看到乐观消息，随后服务端响应回填真实消息内容。
- 触发入口：Prompt 输入提交（已有会话）
- 前置条件：存在会话 ID；模型/agent 已选。
- 主成功流程：构造 request parts -> 乐观插入消息 -> 调用 prompt_async -> SSE 回流更新。
- 异常与降级行为：请求失败回滚乐观消息、恢复输入与上下文、toast 报错。
- 边界范围（In/Out）：In=普通 prompt；Out=shell 命令模式。
- REST依赖（核心/辅助）：核心 `POST /session/{sessionID}/prompt_async`；辅助 `POST /session/{sessionID}/abort`（冲突中断）。
- SSE依赖（事件+用途）：驱动 `message.updated`、`message.part.updated`、`message.part.delta`、`session.status`；补偿 `session.error`。
- 验收标准（Given/When/Then）：
  - Given 会话页可输入，When 提交 Prompt，Then 立即出现用户乐观消息且状态变 busy。
  - Given prompt 请求失败，When 返回错误，Then 乐观消息被移除并恢复输入内容。
- 证据：`/Users/zy/Code/opencode/opencode/packages/app/src/components/prompt-input/submit.ts:314`, `:388`, `:398`
- 文档差异备注：无。

### REQ-APP-003
- 需求名称：消息流式增量展示（part 级）
- 优先级：P0
- 需求内容：模型输出按 part 增量到达，UI 增量更新，不重复插入。
- 触发入口：Prompt 提交后消息区自动更新
- 前置条件：已建立全局 SSE 订阅。
- 主成功流程：`/global/event` 收到 `message.part.updated` / `message.part.delta` -> reducer 按 part.id 更新或增量拼接。
- 异常与降级行为：part 删除事件到达时移除并清空空列表。
- 边界范围（In/Out）：In=part 增删；Out=消息全文重算。
- REST依赖（核心/辅助）：核心 `POST /session/{sessionID}/prompt_async`（触发流）；辅助无。
- SSE依赖（事件+用途）：驱动 `message.part.updated`、`message.part.delta`；补偿 `message.part.removed`。
- 验收标准（Given/When/Then）：
  - Given 消息已有 part，When 收到同 id 的 `message.part.updated`，Then 原位更新而非重复追加。
  - Given 收到 `message.part.removed` 且该消息 part 清空，Then store 中该消息 part 键被清理。
- 证据：`/Users/zy/Code/opencode/opencode/packages/app/src/context/global-sync/event-reducer.ts:194`, `:215`; `/Users/zy/Code/opencode/opencode/packages/app/src/context/global-sdk.tsx:35`
- 文档差异备注：无。

### REQ-APP-004
- 需求名称：会话状态可见（idle/busy/retry）
- 优先级：P0
- 需求内容：会话状态在 store 与 UI 上可见，并随执行过程实时变化。
- 触发入口：会话页、侧边会话列表
- 前置条件：目录实例已 bootstrap。
- 主成功流程：初始化 `session.status` 拉取 -> SSE `session.status` 持续更新。
- 异常与降级行为：本地回退 idle（发送失败/等待 worktree 失败）。
- 边界范围（In/Out）：In=状态展示与同步；Out=状态机后端策略。
- REST依赖（核心/辅助）：核心 `GET /session/status`；辅助 `POST /session/{sessionID}/abort`。
- SSE依赖（事件+用途）：驱动 `session.status`；补偿 `session.idle`（通知侧收敛）。
- 验收标准（Given/When/Then）：
  - Given 打开目录，When bootstrap 完成，Then 本地 `session_status` 已初始化。
  - Given 状态事件到达，When `session.status` 变化，Then 会话 UI 状态同步变化。
- 证据：`/Users/zy/Code/opencode/opencode/packages/app/src/context/global-sync/bootstrap.ts:143`; `/Users/zy/Code/opencode/opencode/packages/app/src/context/global-sync/event-reducer.ts:154`; `/Users/zy/Code/opencode/opencode/packages/app/src/pages/session.tsx:736`
- 文档差异备注：无（已补齐 `/session/status`）。

### REQ-APP-005
- 需求名称：加载历史消息与分页继续加载
- 优先级：P0
- 需求内容：会话首次进入加载历史消息；用户可“Load earlier”继续分页拉取。
- 触发入口：会话页加载、消息时间线“load earlier”按钮
- 前置条件：已存在 sessionID。
- 主成功流程：`sync.session.sync()` 首屏拉取 -> `history.loadMore()` 增加 limit 再拉。
- 异常与降级行为：拉取失败时 loading 结束并保持现有消息。
- 边界范围（In/Out）：In=分页拉取；Out=服务端游标策略。
- REST依赖（核心/辅助）：核心 `GET /session/{sessionID}/message`；辅助 `GET /session/{sessionID}`。
- SSE依赖（事件+用途）：补偿 `message.updated` / `message.part.updated` / `message.part.delta`（分页间隔中的增量同步）。
- 验收标准（Given/When/Then）：
  - Given 会话首次打开，When `sync.session.sync` 执行，Then 消息和 parts 被按 id 排序写入。
  - Given 存在更多历史，When 点击 load earlier，Then 请求以更大 limit 重拉且列表扩展。
- 证据：`/Users/zy/Code/opencode/opencode/packages/app/src/context/sync.tsx:88`, `:99`, `:307`; `/Users/zy/Code/opencode/opencode/packages/app/src/pages/session.tsx:1620`
- 文档差异备注：无。

### REQ-APP-006
- 需求名称：中止当前执行
- 优先级：P0
- 需求内容：用户可中止正在执行的回合，停止后续生成。
- 触发入口：命令 `session.undo` 前置中断；提交区 working 状态中断
- 前置条件：会话存在且状态非 idle。
- 主成功流程：调用 abort 接口；若是本地 pending worktree 等待，则触发本地 abort cleanup。
- 异常与降级行为：abort 调用失败吞掉异常，不阻断后续操作。
- 边界范围（In/Out）：In=执行中止；Out=后端任务撤销策略。
- REST依赖（核心/辅助）：核心 `POST /session/{sessionID}/abort`。
- SSE依赖（事件+用途）：补偿 `session.status`（回到 idle/busy 最新态）。
- 验收标准（Given/When/Then）：
  - Given 会话 busy，When 触发中止，Then 向后端发送 abort 请求。
  - Given 本地 pending map 命中，When 中止，Then 执行本地 cleanup 并移除 pending。
- 证据：`/Users/zy/Code/opencode/opencode/packages/app/src/components/prompt-input/submit.ts:75`; `/Users/zy/Code/opencode/opencode/packages/app/src/pages/session/use-session-commands.tsx:287`
- 文档差异备注：无。

### REQ-APP-007
- 需求名称：撤销到历史节点（revert）
- 优先级：P0
- 需求内容：用户将会话回退到某条历史消息之前，并恢复该点 prompt 内容。
- 触发入口：命令 `session.undo`
- 前置条件：会话存在可见用户消息。
- 主成功流程：必要时先 abort -> 调用 revert(messageID) -> 从 part 恢复 prompt -> 更新 active message。
- 异常与降级行为：无可回退消息则直接返回，不抛错。
- 边界范围（In/Out）：In=回退与输入恢复；Out=复杂分支合并。
- REST依赖（核心/辅助）：核心 `POST /session/{sessionID}/revert`；辅助 `POST /session/{sessionID}/abort`。
- SSE依赖（事件+用途）：驱动 `session.updated`（revert 指针变化）；补偿 `message.removed`。
- 验收标准（Given/When/Then）：
  - Given 有历史用户消息，When 执行 undo，Then 调用 revert 到上一可见 messageID。
  - Given 回退成功且存在该消息 parts，When 完成，Then 输入框内容恢复到该消息文本。
- 证据：`/Users/zy/Code/opencode/opencode/packages/app/src/pages/session/use-session-commands.tsx:283`, `:292`, `:295`
- 文档差异备注：无。

### REQ-APP-011
- 需求名称：接收并处理权限请求
- 优先级：P0
- 需求内容：前端接收权限请求并允许用户 once/always/reject 反馈。
- 触发入口：SessionPromptDock 权限卡片按钮
- 前置条件：SSE 收到 `permission.asked`。
- 主成功流程：请求入 store -> 用户点击按钮 -> `permission.respond`。
- 异常与降级行为：请求失败时不清理去重缓存（允许重试）。
- 边界范围（In/Out）：In=权限问答闭环；Out=权限策略配置管理。
- REST依赖（核心/辅助）：核心 `POST /permission/{requestID}/reply`（SDK: permission.respond）；辅助 `GET /permission`（bootstrap）。
- SSE依赖（事件+用途）：驱动 `permission.asked`；补偿 `permission.replied`（从队列移除）。
- 验收标准（Given/When/Then）：
  - Given 收到权限请求，When 用户点击 allow once，Then 发送 respond 且请求最终从列表移除。
  - Given respond 失败，When 请求报错，Then 该请求仍可继续操作（未被错误清理）。
- 证据：`/Users/zy/Code/opencode/opencode/packages/app/src/pages/session/session-prompt-dock.tsx:90`; `/Users/zy/Code/opencode/opencode/packages/app/src/context/permission.tsx:86`; `/Users/zy/Code/opencode/opencode/packages/app/src/context/global-sync/event-reducer.ts:241`, `:262`
- 文档差异备注：无。

### REQ-APP-012
- 需求名称：权限自动放行（edit）
- 优先级：P0
- 需求内容：用户开启自动放行后，`edit` 类权限请求自动 `once` 通过。
- 触发入口：命令 `permissions.autoaccept` 开关
- 前置条件：会话开启 auto-accept；权限配置允许。
- 主成功流程：持久化 autoAccept 标记 -> 监听 `permission.asked` -> 自动 respondOnce。
- 异常与降级行为：respond 失败会回滚去重标记，避免“假成功”。
- 边界范围（In/Out）：In=edit 自动放行；Out=其他权限类型自动策略。
- REST依赖（核心/辅助）：核心 `POST /permission/{requestID}/reply`；辅助 `GET /permission`（开启时补处理历史 pending）。
- SSE依赖（事件+用途）：驱动 `permission.asked`。
- 验收标准（Given/When/Then）：
  - Given 已开启自动放行，When 收到 edit 权限请求，Then 前端自动发送 once 响应。
  - Given 自动响应失败，When 接口报错，Then 内部去重记录回滚，后续可再次尝试。
- 证据：`/Users/zy/Code/opencode/opencode/packages/app/src/context/permission.tsx:117`, `:125`, `:138`; `/Users/zy/Code/opencode/opencode/packages/app/src/pages/session/use-session-commands.tsx:251`
- 文档差异备注：无。

### REQ-APP-013
- 需求名称：接收并回答问题请求
- 优先级：P0
- 需求内容：前端展示 question 选项，用户提交答案后完成问答闭环。
- 触发入口：QuestionDock
- 前置条件：收到 `question.asked` 且请求在当前会话。
- 主成功流程：渲染选项/自定义输入 -> `question.reply` 提交答案。
- 异常与降级行为：失败 toast，sending 状态回落。
- 边界范围（In/Out）：In=问题回答；Out=问题生成逻辑。
- REST依赖（核心/辅助）：核心 `POST /question/{requestID}/reply`；辅助 `GET /question`。
- SSE依赖（事件+用途）：驱动 `question.asked`；补偿 `question.replied`。
- 验收标准（Given/When/Then）：
  - Given question 到达，When 选择答案并提交，Then 调用 reply 且发送态结束。
  - Given reply 失败，When 返回错误，Then 显示错误提示并可继续重试。
- 证据：`/Users/zy/Code/opencode/opencode/packages/app/src/components/question-dock.tsx:41`, `:45`; `/Users/zy/Code/opencode/opencode/packages/app/src/context/global-sync/event-reducer.ts:277`, `:298`
- 文档差异备注：无。

### REQ-APP-014
- 需求名称：拒绝问题请求
- 优先级：P0
- 需求内容：用户可拒绝问题请求，前端完成拒绝动作并清理待答项。
- 触发入口：QuestionDock reject
- 前置条件：存在 question request。
- 主成功流程：调用 reject -> SSE/本地状态移除请求。
- 异常与降级行为：失败 toast 且保持当前问题状态。
- 边界范围（In/Out）：In=reject 操作；Out=服务端重试策略。
- REST依赖（核心/辅助）：核心 `POST /question/{requestID}/reject`。
- SSE依赖（事件+用途）：补偿 `question.rejected`（从队列移除）。
- 验收标准（Given/When/Then）：
  - Given 问题请求存在，When 点击 reject，Then 发送 reject 请求。
  - Given 收到 `question.rejected`，When 事件到达，Then 对应请求从 store 移除。
- 证据：`/Users/zy/Code/opencode/opencode/packages/app/src/components/question-dock.tsx:51`; `/Users/zy/Code/opencode/opencode/packages/app/src/context/global-sync/event-reducer.ts:299`
- 文档差异备注：无。

### REQ-APP-008
- 需求名称：重做到后续节点（unrevert/revert）
- 优先级：P1
- 需求内容：用户可从回退点向前恢复；无后继消息时执行 unrevert。
- 触发入口：命令 `session.redo`
- 前置条件：存在 revert.messageID。
- 主成功流程：查找 nextMessage -> 有则 `revert(next)`；无则 `unrevert`。
- 异常与降级行为：无回退点时禁用命令。
- 边界范围（In/Out）：In=redo；Out=跨分支重放。
- REST依赖（核心/辅助）：核心 `POST /session/{sessionID}/unrevert`、`POST /session/{sessionID}/revert`。
- SSE依赖（事件+用途）：驱动 `session.updated`（revert 指针变化）。
- 验收标准（Given/When/Then）：
  - Given 有回退点且有后继消息，When 执行 redo，Then 调用 revert 到 nextMessage。
  - Given 有回退点但无后继消息，When 执行 redo，Then 调用 unrevert 并清空输入。
- 证据：`/Users/zy/Code/opencode/opencode/packages/app/src/pages/session/use-session-commands.tsx:303`, `:316`, `:322`
- 文档差异备注：无。

### REQ-APP-009
- 需求名称：会话总结压缩（summarize）
- 优先级：P1
- 需求内容：用户触发 compact，总结会话上下文以缩短历史负担。
- 触发入口：命令 `session.compact`
- 前置条件：会话存在可见用户消息；模型已选择。
- 主成功流程：调用 summarize(sessionID, modelID, providerID)。
- 异常与降级行为：未选模型时给出提示并阻止调用。
- 边界范围（In/Out）：In=发起总结；Out=总结内容渲染策略。
- REST依赖（核心/辅助）：核心 `POST /session/{sessionID}/summarize`。
- SSE依赖（事件+用途）：补偿 `session.updated`（总结结果回流）。
- 验收标准（Given/When/Then）：
  - Given 选择模型且有历史，When 执行 compact，Then 发起 summarize 请求。
  - Given 未选模型，When 执行 compact，Then 显示模型缺失提示且不发请求。
- 证据：`/Users/zy/Code/opencode/opencode/packages/app/src/pages/session/use-session-commands.tsx:328`, `:345`
- 文档差异备注：无。

### REQ-APP-010
- 需求名称：从历史消息分叉会话（fork）
- 优先级：P1
- 需求内容：用户选定历史用户消息，创建子会话并跳转，输入框恢复该消息 prompt。
- 触发入口：命令 `session.fork` -> DialogFork
- 前置条件：当前会话存在可 fork 的用户消息。
- 主成功流程：展示消息列表 -> 调用 fork(messageID) -> 跳转新会话并恢复 prompt。
- 异常与降级行为：无 data 时不跳转。
- 边界范围（In/Out）：In=fork 创建与跳转；Out=子会话长期管理。
- REST依赖（核心/辅助）：核心 `POST /session/{sessionID}/fork`。
- SSE依赖（事件+用途）：补偿 `session.created`（列表侧可见新分支）。
- 验收标准（Given/When/Then）：
  - Given 选择某条用户消息，When 点击 fork，Then 创建子会话并跳转到新 sessionID。
  - Given fork 返回为空，When 请求结束，Then 不发生路由跳转。
- 证据：`/Users/zy/Code/opencode/opencode/packages/app/src/components/dialog-fork.tsx:57`, `:71`, `:73`
- 文档差异备注：无。

### REQ-APP-015
- 需求名称：浏览文件树并读取文件内容
- 优先级：P1
- 需求内容：用户可展开目录树并打开文件查看内容。
- 触发入口：文件树节点点击、review/context 侧边栏
- 前置条件：目录实例可用。
- 主成功流程：`file.list` 拉目录 -> `file.read` 拉文件 -> 缓存并展示。
- 异常与降级行为：列表/读取失败 toast；文件状态写入 error。
- 边界范围（In/Out）：In=树与文件内容；Out=编辑写回。
- REST依赖（核心/辅助）：核心 `GET /file`、`GET /file/content`。
- SSE依赖（事件+用途）：补偿 `file.watcher.updated`（已开文件自动刷新）。
- 验收标准（Given/When/Then）：
  - Given 目录展开，When 请求成功，Then 树节点按目录内容展示。
  - Given 打开文件，When 读取成功，Then 内容写入 store 且 loaded=true。
- 证据：`/Users/zy/Code/opencode/opencode/packages/app/src/context/file.tsx:70`, `:136`
- 文档差异备注：无。

### REQ-APP-016
- 需求名称：文件/目录检索
- 优先级：P1
- 需求内容：用户可按 query 搜索文件，支持包含目录模式。
- 触发入口：文件选择对话框/Prompt @ 引用搜索
- 前置条件：目录已选。
- 主成功流程：调用 `find.files({query, dirs})` 并标准化路径返回。
- 异常与降级行为：检索失败返回空数组，不抛给 UI。
- 边界范围（In/Out）：In=名称检索；Out=全文内容检索。
- REST依赖（核心/辅助）：核心 `GET /find/file`。
- SSE依赖（事件+用途）：无（仅 REST 拉取）。
- 验收标准（Given/When/Then）：
  - Given 输入检索词，When 请求成功，Then 返回匹配文件（或目录）路径列表。
  - Given 请求失败，When catch 执行，Then UI 获取空结果而非崩溃。
- 证据：`/Users/zy/Code/opencode/opencode/packages/app/src/context/file.tsx:179`
- 文档差异备注：无。

### REQ-APP-017
- 需求名称：文件变更后自动刷新视图
- 优先级：P1
- 需求内容：文件 watcher 事件到达后，已打开文件和受影响目录自动刷新。
- 触发入口：SSE `file.watcher.updated`
- 前置条件：文件树/文件缓存中存在相关路径。
- 主成功流程：解析事件 -> 命中 open/file cache 则强制重载 -> 目录节点按变更类型刷新。
- 异常与降级行为：`.git` 路径直接忽略。
- 边界范围（In/Out）：In=add/change/unlink 刷新；Out=复杂批量变更合并。
- REST依赖（核心/辅助）：核心 `GET /file/content`、`GET /file`（事件后重拉）。
- SSE依赖（事件+用途）：驱动 `file.watcher.updated`。
- 验收标准（Given/When/Then）：
  - Given 打开的文件被 change，When watcher 事件到达，Then 前端强制 reload 该文件内容。
  - Given 目录发生 add/unlink，When 父目录已加载，Then 父目录列表自动 refresh。
- 证据：`/Users/zy/Code/opencode/opencode/packages/app/src/context/file/watcher.ts:18`; `/Users/zy/Code/opencode/opencode/packages/app/src/context/file.tsx:185`
- 文档差异备注：无。

### REQ-APP-018
- 需求名称：LSP 状态变更后状态刷新
- 优先级：P1
- 需求内容：收到 LSP 更新事件后，前端主动回拉最新 LSP 状态。
- 触发入口：全局 SSE 分发至目录 store
- 前置条件：目录 child store 已创建。
- 主成功流程：event-reducer 命中 `lsp.updated` -> 调 `sdk.lsp.status()` -> 覆盖 store.lsp。
- 异常与降级行为：失败时保持旧值。
- 边界范围（In/Out）：In=LSP 状态刷新；Out=诊断面板交互。
- REST依赖（核心/辅助）：核心 `GET /lsp`。
- SSE依赖（事件+用途）：驱动 `lsp.updated`。
- 验收标准（Given/When/Then）：
  - Given 收到 `lsp.updated`，When 事件处理，Then 触发一次 `lsp.status` 回拉。
  - Given 回拉成功，When setStore，Then LSP 状态在 UI 侧可见更新。
- 证据：`/Users/zy/Code/opencode/opencode/packages/app/src/context/global-sync/event-reducer.ts:314`; `/Users/zy/Code/opencode/opencode/packages/app/src/context/global-sync.tsx:278`
- 文档差异备注：无。

### REQ-APP-019
- 需求名称：创建/切换/关闭终端
- 优先级：P1
- 需求内容：用户可新建终端标签、切换活动终端、关闭终端。
- 触发入口：会话终端面板、快捷键命令
- 前置条件：工作区已就绪。
- 主成功流程：`pty.create` -> 本地新增 tab；open/next/previous 切换；close 时先本地移除再 `pty.remove`。
- 异常与降级行为：接口失败打印错误，不中断 UI 主流程。
- 边界范围（In/Out）：In=终端会话管理；Out=终端内容协议细节。
- REST依赖（核心/辅助）：核心 `POST /pty`、`DELETE /pty/{ptyID}`；辅助 `GET /pty`。
- SSE依赖（事件+用途）：补偿 `pty.exited`（服务端退出同步）。
- 验收标准（Given/When/Then）：
  - Given 终端面板打开，When 点击新建，Then 新终端被创建并设为 active。
  - Given 关闭终端，When close 执行，Then 本地 tab 移除且后端收到 remove。
- 证据：`/Users/zy/Code/opencode/opencode/packages/app/src/context/terminal.tsx:99`, `:115`, `:192`, `:203`
- 文档差异备注：无。

### REQ-APP-020
- 需求名称：终端尺寸与标题更新
- 优先级：P1
- 需求内容：终端标签名和尺寸变化会同步给后端 PTY。
- 触发入口：终端 resize、rename
- 前置条件：终端 ID 存在。
- 主成功流程：先更新本地 store，再调用 `pty.update` 提交 title/size。
- 异常与降级行为：后端失败仅日志，不回滚本地立即体验。
- 边界范围（In/Out）：In=title/rows/cols；Out=终端渲染缓存策略。
- REST依赖（核心/辅助）：核心 `PUT /pty/{ptyID}`。
- SSE依赖（事件+用途）：无（仅 REST 推送）。
- 验收标准（Given/When/Then）：
  - Given 用户调整终端尺寸，When update 调用，Then 请求包含 rows/cols。
  - Given 用户修改标题，When update 成功，Then 本地与服务端标题一致。
- 证据：`/Users/zy/Code/opencode/opencode/packages/app/src/context/terminal.tsx:135`, `:140`
- 文档差异备注：无。

### REQ-APP-021
- 需求名称：终端退出后 UI 一致性
- 优先级：P1
- 需求内容：当终端在服务端退出时，UI 自动移除对应 tab 并调整 active。
- 触发入口：SSE `pty.exited`
- 前置条件：该 pty 在本地列表存在。
- 主成功流程：监听事件 -> 删除终端 -> 若 active 命中则切换到剩余首项。
- 异常与降级行为：本地不存在该 pty 则忽略。
- 边界范围（In/Out）：In=退出同步；Out=终端崩溃恢复。
- REST依赖（核心/辅助）：无（事件驱动）。
- SSE依赖（事件+用途）：驱动 `pty.exited`。
- 验收标准（Given/When/Then）：
  - Given 活跃终端被服务端退出，When 收到 `pty.exited`，Then 该 tab 被移除并选中可用终端。
  - Given 退出的 pty 不在本地，When 事件到达，Then 本地状态不发生变化。
- 证据：`/Users/zy/Code/opencode/opencode/packages/app/src/context/terminal.tsx:59`
- 文档差异备注：无。

### REQ-APP-022
- 需求名称：创建工作区（worktree create）
- 优先级：P1
- 需求内容：用户从项目创建新 worktree，并立即进入该工作区会话页。
- 触发入口：命令 `workspace.new`、新会话页 `create worktree`
- 前置条件：项目是 git worktree 模式。
- 主成功流程：调用 create -> 置 pending/busy -> 预创建 child store -> 跳转新目录。
- 异常与降级行为：失败 toast，保持当前目录。
- 边界范围（In/Out）：In=创建与路由；Out=分支命名策略。
- REST依赖（核心/辅助）：核心 `POST /experimental/worktree`。
- SSE依赖（事件+用途）：驱动 `worktree.ready` / `worktree.failed` 更新 WorktreeState 与 busy 标记。
- 验收标准（Given/When/Then）：
  - Given 当前项目支持 worktree，When 执行创建，Then 新目录被导航打开并标记 pending。
  - Given 后端推送 `worktree.ready`，When 事件到达，Then busy=false 且 WorktreeState 变 ready。
- 证据：`/Users/zy/Code/opencode/opencode/packages/app/src/pages/layout.tsx:1555`, `:1560`, `:1580`; `/Users/zy/Code/opencode/opencode/packages/app/src/components/prompt-input/submit.ts:147`, `:165`; `/Users/zy/Code/opencode/opencode/packages/app/src/pages/layout.tsx:326`
- 文档差异备注：无。

### REQ-APP-025
- 需求名称：加载 provider 与认证方式
- 优先级：P1
- 需求内容：全局启动时加载 provider 列表和每个 provider 的认证方式。
- 触发入口：GlobalSync bootstrap
- 前置条件：全局 health 检查通过。
- 主成功流程：并行拉取 provider.list 与 provider.auth，写入全局 store。
- 异常与降级行为：部分失败合并报错 toast，但仍置 ready。
- 边界范围（In/Out）：In=提供商与 auth method 拉取；Out=具体连接动作。
- REST依赖（核心/辅助）：核心 `GET /provider`、`GET /provider/auth`；辅助 `GET /global/config`。
- SSE依赖（事件+用途）：补偿 `global.disposed`（触发全局刷新后重拉）。
- 验收标准（Given/When/Then）：
  - Given 全局健康，When bootstrap 执行，Then provider 与 provider_auth 被填充。
  - Given 部分请求失败，When Promise.allSettled 完成，Then 仍可进入 ready 状态并看到错误提示。
- 证据：`/Users/zy/Code/opencode/opencode/packages/app/src/context/global-sync/bootstrap.ts:72`, `:77`, `:83`
- 文档差异备注：无（相关接口已补齐）。

### REQ-APP-026
- 需求名称：Provider OAuth 授权与回调
- 优先级：P1
- 需求内容：用户可发起 OAuth 授权并通过 code/auto 模式完成回调绑定。
- 触发入口：DialogConnectProvider
- 前置条件：provider 提供 oauth method。
- 主成功流程：authorize 获取授权信息 -> 打开链接 -> callback 完成绑定 -> global.dispose 刷新。
- 异常与降级行为：state=error 并展示错误信息。
- 边界范围（In/Out）：In=OAuth 绑定；Out=第三方平台账号流程。
- REST依赖（核心/辅助）：核心 `POST /provider/{providerID}/oauth/authorize`、`POST /provider/{providerID}/oauth/callback`；辅助 `POST /global/dispose`。
- SSE依赖（事件+用途）：无（仅 REST 流程）。
- 验收标准（Given/When/Then）：
  - Given 选择 OAuth 方法，When authorize 成功，Then 前端进入 complete 并持有 authorization。
  - Given callback 失败，When 返回错误，Then UI 进入 error 状态并展示错误消息。
- 证据：`/Users/zy/Code/opencode/opencode/packages/app/src/components/dialog-connect-provider.tsx:85`, `:339`, `:402`, `:139`
- 文档差异备注：无（已补齐 provider oauth 端点）。

### REQ-APP-023
- 需求名称：删除工作区（worktree remove）
- 优先级：P2
- 需求内容：用户删除 sandbox 工作区后，列表和导航保持一致。
- 触发入口：Workspace 菜单 delete
- 前置条件：目标目录不是 root worktree。
- 主成功流程：调用 remove -> 关闭被删目录 -> 打开 root -> 若当前在被删目录则跳转 root。
- 异常与降级行为：失败 toast 并恢复 busy。
- 边界范围（In/Out）：In=删除与导航一致性；Out=远端仓库同步。
- REST依赖（核心/辅助）：核心 `DELETE /experimental/worktree`。
- SSE依赖（事件+用途）：无（仅 REST 拉齐）。
- 验收标准（Given/When/Then）：
  - Given 非 root 工作区，When 删除成功，Then 工作区从项目列表移除并回到 root。
  - Given 删除失败，When 请求报错，Then 显示错误提示且不误删本地项目状态。
- 证据：`/Users/zy/Code/opencode/opencode/packages/app/src/pages/layout.tsx:1199`, `:1204`, `:1219`
- 文档差异备注：无。

### REQ-APP-024
- 需求名称：重置工作区并归档会话（worktree reset + dispose）
- 优先级：P2
- 需求内容：重置 sandbox 后，当前活跃会话批量归档并释放实例状态。
- 触发入口：Workspace 菜单 reset
- 前置条件：目标目录不是 root worktree。
- 主成功流程：list sessions -> worktree.reset -> 批量 session.update(archived) -> instance.dispose。
- 异常与降级行为：reset 失败即停止后续归档与 dispose。
- 边界范围（In/Out）：In=重置 + 归档 + dispose；Out=会话物理删除。
- REST依赖（核心/辅助）：核心 `POST /experimental/worktree/reset`；辅助 `GET /session`、`PATCH /session/{sessionID}`、`POST /instance/dispose`。
- SSE依赖（事件+用途）：无（仅 REST 串联）。
- 验收标准（Given/When/Then）：
  - Given reset 成功，When 后续流程执行，Then 活跃会话被归档且实例被 dispose。
  - Given reset 失败，When 捕获错误，Then busy 清除并保留原会话状态。
- 证据：`/Users/zy/Code/opencode/opencode/packages/app/src/pages/layout.tsx:1238`, `:1243`, `:1265`, `:1275`
- 文档差异备注：无。

### REQ-APP-027
- 需求名称：Provider API Key 配置与移除
- 优先级：P2
- 需求内容：用户可提交 API Key 连接 provider，也可断开连接。
- 触发入口：DialogConnectProvider（API 模式）、SettingsProviders disconnect
- 前置条件：provider 支持 api 认证。
- 主成功流程：`auth.set` 存储 key；断开时 `auth.remove`，必要时 `global.dispose`。
- 异常与降级行为：表单校验空值；请求失败 toast。
- 边界范围（In/Out）：In=连接/断开；Out=key 加密存储实现。
- REST依赖（核心/辅助）：核心 `PUT /auth/{providerID}`、`DELETE /auth/{providerID}`；辅助 `POST /global/dispose`。
- SSE依赖（事件+用途）：补偿 `global.disposed`（触发刷新）。
- 验收标准（Given/When/Then）：
  - Given 输入有效 API Key，When 提交，Then 调用 auth.set 并显示连接成功提示。
  - Given 点击 disconnect，When remove 成功，Then provider 从已连接列表收敛刷新。
- 证据：`/Users/zy/Code/opencode/opencode/packages/app/src/components/dialog-connect-provider.tsx:255`; `/Users/zy/Code/opencode/opencode/packages/app/src/components/settings-providers.tsx:100`, `:103`
- 文档差异备注：无。

### REQ-APP-028
- 需求名称：MCP 连接状态切换与回拉状态
- 优先级：P2
- 需求内容：用户可开关 MCP 连接，前端在切换后立即回拉最新 MCP 状态。
- 触发入口：StatusPopover、DialogSelectMcp
- 前置条件：存在 MCP 列表项。
- 主成功流程：connect/disconnect -> `mcp.status` -> 覆盖 `sync.data.mcp`。
- 异常与降级行为：失败 toast 并结束 loading。
- 边界范围（In/Out）：In=MCP 开关；Out=MCP 工具事件消费。
- REST依赖（核心/辅助）：核心 `POST /mcp/{name}/connect`、`POST /mcp/{name}/disconnect`、`GET /mcp`。
- SSE依赖（事件+用途）：无（当前 app 不消费 `mcp.*` 事件）。
- 验收标准（Given/When/Then）：
  - Given MCP 当前断开，When 开启开关，Then 调用 connect 并回拉 status。
  - Given 请求失败，When catch，Then 显示错误提示且 loading 恢复。
- 证据：`/Users/zy/Code/opencode/opencode/packages/app/src/components/dialog-select-mcp.tsx:21`, `:30`; `/Users/zy/Code/opencode/opencode/packages/app/src/components/status-popover.tsx:88`, `:95`
- 文档差异备注：无。

### REQ-APP-029
- 需求名称：回合完成通知（session.idle）
- 优先级：P2
- 需求内容：会话回合完成时记录通知、播放声音，并可触发系统通知。
- 触发入口：全局 SSE 监听
- 前置条件：收到 `session.idle`。
- 主成功流程：过滤子会话 -> append 通知 -> 声音提醒 -> 按设置发系统通知。
- 异常与降级行为：当前会话已打开则标记 viewed，避免误报未读。
- 边界范围（In/Out）：In=完成通知；Out=通知中心筛选 UI。
- REST依赖（核心/辅助）：无（事件驱动）。
- SSE依赖（事件+用途）：驱动 `session.idle`。
- 验收标准（Given/When/Then）：
  - Given 非当前会话触发 idle，When 事件到达，Then 新增 turn-complete 通知并标未读。
  - Given 设置开启系统通知，When idle 到达，Then 发送系统通知并附带会话链接。
- 证据：`/Users/zy/Code/opencode/opencode/packages/app/src/context/notification.tsx:89`, `:103`, `:112`, `:121`
- 文档差异备注：无。

### REQ-APP-030
- 需求名称：错误通知（session.error）
- 优先级：P2
- 需求内容：会话错误事件到达时记录 error 通知并按设置推送系统提醒。
- 触发入口：全局 SSE 监听
- 前置条件：收到 `session.error`。
- 主成功流程：构造 error payload -> append 通知 -> 声音 -> 系统通知。
- 异常与降级行为：无 sessionID 时回落到 global 链接。
- 边界范围（In/Out）：In=错误提醒；Out=错误诊断详情页。
- REST依赖（核心/辅助）：无（事件驱动）。
- SSE依赖（事件+用途）：驱动 `session.error`。
- 验收标准（Given/When/Then）：
  - Given 会话错误事件到达，When 处理完成，Then 通知列表新增 type=error 记录。
  - Given settings.notifications.errors=true，When error 到达，Then 系统通知被触发。
- 证据：`/Users/zy/Code/opencode/opencode/packages/app/src/context/notification.tsx:89`, `:130`, `:140`, `:152`
- 文档差异备注：无。

### REQ-APP-031
- 需求名称：权限/问题到达提醒（toast/系统通知）
- 优先级：P2
- 需求内容：权限/问题请求到达时前端弹出 toast，并在设置允许时发系统通知。
- 触发入口：layout onMount 全局事件监听
- 前置条件：事件类型为 `permission.asked` 或 `question.asked`。
- 主成功流程：构造描述与 href -> 去重冷却 -> toast + `platform.notify`。
- 异常与降级行为：自动放行场景下跳过提示（避免噪声）。
- 边界范围（In/Out）：In=到达提醒；Out=提醒历史持久化。
- REST依赖（核心/辅助）：无（事件驱动）。
- SSE依赖（事件+用途）：驱动 `permission.asked`、`question.asked`。
- 验收标准（Given/When/Then）：
  - Given 权限请求到达且非 auto-accept，When 事件处理，Then 显示对应 toast。
  - Given 用户开启系统通知，When 问题请求到达，Then 发送系统通知并可跳转会话。
- 证据：`/Users/zy/Code/opencode/opencode/packages/app/src/pages/layout.tsx:338`, `:346`, `:358`
- 文档差异备注：无。

### REQ-APP-032
- 需求名称：生成分享链接
- 优先级：P2
- 需求内容：用户可发布会话并复制分享链接。
- 触发入口：会话命令 `session.share`
- 前置条件：share 配置非 disabled；会话 ID 存在。
- 主成功流程：若已有 url 直接复制；否则调用 share 并复制返回 url。
- 异常与降级行为：复制失败/分享失败分别 toast。
- 边界范围（In/Out）：In=生成与复制链接；Out=公开页渲染。
- REST依赖（核心/辅助）：核心 `POST /session/{sessionID}/share`。
- SSE依赖（事件+用途）：无（仅 REST）。
- 验收标准（Given/When/Then）：
  - Given 尚无 share url，When 执行 share，Then 调用 share 接口并复制返回链接。
  - Given clipboard 写入失败，When catch，Then 提示 copyFailed。
- 证据：`/Users/zy/Code/opencode/opencode/packages/app/src/pages/session/use-session-commands.tsx:363`, `:400`, `:402`
- 文档差异备注：无。

### REQ-APP-033
- 需求名称：取消分享链接
- 优先级：P2
- 需求内容：用户可停止会话分享并得到成功/失败反馈。
- 触发入口：会话命令 `session.unshare`
- 前置条件：当前会话已有 share.url。
- 主成功流程：调用 unshare -> 成功 toast。
- 异常与降级行为：失败 toast。
- 边界范围（In/Out）：In=取消发布；Out=历史链接失效策略。
- REST依赖（核心/辅助）：核心 `DELETE /session/{sessionID}/share`。
- SSE依赖（事件+用途）：无（仅 REST）。
- 验收标准（Given/When/Then）：
  - Given 会话已分享，When 执行 unshare，Then 调用 unshare 并提示成功。
  - Given unshare 报错，When catch，Then 显示失败提示并保持当前状态。
- 证据：`/Users/zy/Code/opencode/opencode/packages/app/src/pages/session/use-session-commands.tsx:413`, `:421`
- 文档差异备注：无。

### REQ-APP-034
- 需求名称：会话归档/删除后的导航与状态一致性
- 优先级：P2
- 需求内容：归档或删除当前会话后，前端导航到合理目标会话/列表并清理本地状态。
- 触发入口：会话头菜单 archive/delete；侧边栏 archive
- 前置条件：目标会话存在。
- 主成功流程：archive 用 session.update(archived)；delete 用 session.delete；完成后选择父会话/邻近会话/会话列表路由。
- 异常与降级行为：失败 toast，保留当前会话。
- 边界范围（In/Out）：In=导航与 store 收敛；Out=后端数据保留策略。
- REST依赖（核心/辅助）：核心 `PATCH /session/{sessionID}`、`DELETE /session/{sessionID}`。
- SSE依赖（事件+用途）：补偿 `session.updated`、`session.deleted`（跨视图收敛）。
- 验收标准（Given/When/Then）：
  - Given 当前会话归档成功，When 当前页即该会话，Then 自动跳转到父会话或邻近会话或会话列表。
  - Given 删除成功，When 删除目标包含子分支，Then 本地会话树清理该节点及其子节点并导航一致。
- 证据：`/Users/zy/Code/opencode/opencode/packages/app/src/pages/session.tsx:397`, `:434`, `:486`, `:490`; `/Users/zy/Code/opencode/opencode/packages/app/src/context/global-sync/event-reducer.ts:101`, `:128`
- 文档差异备注：无。

## 3. 按需求映射 REST 接口

| 优先级 | 需求ID | 需求名称 | 核心REST | 辅助REST |
|---|---|---|---|---|
| P0 | REQ-APP-001 | 新建并进入会话 | `POST /session` | `GET /session`, `GET /session/{sessionID}/message` |
| P0 | REQ-APP-002 | 会话中发送 Prompt 并看到响应 | `POST /session/{sessionID}/prompt_async` | `POST /session/{sessionID}/abort` |
| P0 | REQ-APP-003 | 消息流式增量展示（part 级） | `POST /session/{sessionID}/prompt_async` | - |
| P0 | REQ-APP-004 | 会话状态可见（idle/busy/retry） | `GET /session/status` | `POST /session/{sessionID}/abort` |
| P0 | REQ-APP-005 | 加载历史消息与分页继续加载 | `GET /session/{sessionID}/message` | `GET /session/{sessionID}` |
| P0 | REQ-APP-006 | 中止当前执行 | `POST /session/{sessionID}/abort` | - |
| P0 | REQ-APP-007 | 撤销到历史节点（revert） | `POST /session/{sessionID}/revert` | `POST /session/{sessionID}/abort` |
| P0 | REQ-APP-011 | 接收并处理权限请求 | `POST /permission/{requestID}/reply` | `GET /permission` |
| P0 | REQ-APP-012 | 权限自动放行（edit） | `POST /permission/{requestID}/reply` | `GET /permission` |
| P0 | REQ-APP-013 | 接收并回答问题请求 | `POST /question/{requestID}/reply` | `GET /question` |
| P0 | REQ-APP-014 | 拒绝问题请求 | `POST /question/{requestID}/reject` | - |
| P1 | REQ-APP-008 | 重做到后续节点（unrevert/revert） | `POST /session/{sessionID}/unrevert`, `POST /session/{sessionID}/revert` | - |
| P1 | REQ-APP-009 | 会话总结压缩（summarize） | `POST /session/{sessionID}/summarize` | - |
| P1 | REQ-APP-010 | 从历史消息分叉会话（fork） | `POST /session/{sessionID}/fork` | - |
| P1 | REQ-APP-015 | 浏览文件树并读取文件内容 | `GET /file`, `GET /file/content` | - |
| P1 | REQ-APP-016 | 文件/目录检索 | `GET /find/file` | - |
| P1 | REQ-APP-017 | 文件变更后自动刷新视图 | `GET /file/content`, `GET /file` | - |
| P1 | REQ-APP-018 | LSP 状态变更后状态刷新 | `GET /lsp` | - |
| P1 | REQ-APP-019 | 创建/切换/关闭终端 | `POST /pty`, `DELETE /pty/{ptyID}` | `GET /pty` |
| P1 | REQ-APP-020 | 终端尺寸与标题更新 | `PUT /pty/{ptyID}` | - |
| P1 | REQ-APP-021 | 终端退出后 UI 一致性 | - | - |
| P1 | REQ-APP-022 | 创建工作区（worktree create） | `POST /experimental/worktree` | - |
| P1 | REQ-APP-025 | 加载 provider 与认证方式 | `GET /provider`, `GET /provider/auth` | `GET /global/config` |
| P1 | REQ-APP-026 | Provider OAuth 授权与回调 | `POST /provider/{providerID}/oauth/authorize`, `POST /provider/{providerID}/oauth/callback` | `POST /global/dispose` |
| P2 | REQ-APP-023 | 删除工作区（worktree remove） | `DELETE /experimental/worktree` | - |
| P2 | REQ-APP-024 | 重置工作区并归档会话（worktree reset + dispose） | `POST /experimental/worktree/reset` | `GET /session`, `PATCH /session/{sessionID}`, `POST /instance/dispose` |
| P2 | REQ-APP-027 | Provider API Key 配置与移除 | `PUT /auth/{providerID}`, `DELETE /auth/{providerID}` | `POST /global/dispose` |
| P2 | REQ-APP-028 | MCP 连接状态切换与回拉状态 | `POST /mcp/{name}/connect`, `POST /mcp/{name}/disconnect`, `GET /mcp` | - |
| P2 | REQ-APP-029 | 回合完成通知（session.idle） | - | - |
| P2 | REQ-APP-030 | 错误通知（session.error） | - | - |
| P2 | REQ-APP-031 | 权限/问题到达提醒（toast/系统通知） | - | - |
| P2 | REQ-APP-032 | 生成分享链接 | `POST /session/{sessionID}/share` | - |
| P2 | REQ-APP-033 | 取消分享链接 | `DELETE /session/{sessionID}/share` | - |
| P2 | REQ-APP-034 | 会话归档/删除后的导航与状态一致性 | `PATCH /session/{sessionID}`, `DELETE /session/{sessionID}` | - |

## 4. 按需求映射 SSE 事件

| 优先级 | 需求ID | 需求名称 | 驱动事件 | 补偿事件 |
|---|---|---|---|---|
| P0 | REQ-APP-001 | 新建并进入会话 | `session.created` | `session.updated` |
| P0 | REQ-APP-002 | 会话中发送 Prompt 并看到响应 | `message.updated`, `message.part.updated`, `message.part.delta`, `session.status` | `session.error` |
| P0 | REQ-APP-003 | 消息流式增量展示（part 级） | `message.part.updated`, `message.part.delta` | `message.part.removed` |
| P0 | REQ-APP-004 | 会话状态可见（idle/busy/retry） | `session.status` | `session.idle` |
| P0 | REQ-APP-005 | 加载历史消息与分页继续加载 | - | `message.updated`, `message.part.updated`, `message.part.delta` |
| P0 | REQ-APP-006 | 中止当前执行 | - | `session.status` |
| P0 | REQ-APP-007 | 撤销到历史节点（revert） | `session.updated` | `message.removed` |
| P0 | REQ-APP-011 | 接收并处理权限请求 | `permission.asked` | `permission.replied` |
| P0 | REQ-APP-012 | 权限自动放行（edit） | `permission.asked` | - |
| P0 | REQ-APP-013 | 接收并回答问题请求 | `question.asked` | `question.replied` |
| P0 | REQ-APP-014 | 拒绝问题请求 | - | `question.rejected` |
| P1 | REQ-APP-008 | 重做到后续节点（unrevert/revert） | `session.updated` | - |
| P1 | REQ-APP-009 | 会话总结压缩（summarize） | - | `session.updated` |
| P1 | REQ-APP-010 | 从历史消息分叉会话（fork） | - | `session.created` |
| P1 | REQ-APP-015 | 浏览文件树并读取文件内容 | - | `file.watcher.updated` |
| P1 | REQ-APP-016 | 文件/目录检索 | - | - |
| P1 | REQ-APP-017 | 文件变更后自动刷新视图 | `file.watcher.updated` | - |
| P1 | REQ-APP-018 | LSP 状态变更后状态刷新 | `lsp.updated` | - |
| P1 | REQ-APP-019 | 创建/切换/关闭终端 | - | `pty.exited` |
| P1 | REQ-APP-020 | 终端尺寸与标题更新 | - | - |
| P1 | REQ-APP-021 | 终端退出后 UI 一致性 | `pty.exited` | - |
| P1 | REQ-APP-022 | 创建工作区（worktree create） | `worktree.ready`, `worktree.failed` | - |
| P1 | REQ-APP-025 | 加载 provider 与认证方式 | - | `global.disposed` |
| P1 | REQ-APP-026 | Provider OAuth 授权与回调 | - | - |
| P2 | REQ-APP-023 | 删除工作区（worktree remove） | - | - |
| P2 | REQ-APP-024 | 重置工作区并归档会话（worktree reset + dispose） | - | - |
| P2 | REQ-APP-027 | Provider API Key 配置与移除 | - | `global.disposed` |
| P2 | REQ-APP-028 | MCP 连接状态切换与回拉状态 | - | - |
| P2 | REQ-APP-029 | 回合完成通知（session.idle） | `session.idle` | - |
| P2 | REQ-APP-030 | 错误通知（session.error） | `session.error` | - |
| P2 | REQ-APP-031 | 权限/问题到达提醒（toast/系统通知） | `permission.asked`, `question.asked` | - |
| P2 | REQ-APP-032 | 生成分享链接 | - | - |
| P2 | REQ-APP-033 | 取消分享链接 | - | - |
| P2 | REQ-APP-034 | 会话归档/删除后的导航与状态一致性 | - | `session.updated`, `session.deleted` |

## 5. SSE 实现机制简述（事件如何驱动 UI）

- 订阅入口：`GlobalSDKProvider` 通过 `global.event()` 连接 `GET /global/event`，按 `directory` 分发到 `globalSync.child(directory)`。
- 事件收敛：`global-sdk.tsx` 对 `session.status`、`lsp.updated`、`message.part.updated` 做 coalesce，并在 `message.part.updated` 到达后跳过对应 `message.part.delta`，避免高频重绘与重复增量。
- 状态写入：`applyDirectoryEvent` 根据事件类型写入 `session/message/part/permission/question/...` store。
- UI驱动：页面组件主要消费 `useSync().data`；因此 SSE -> store 变更 -> 组件自动重渲染。
- 通知链路：`notification.tsx` 独立监听 `session.idle/session.error`，构建通知索引并触发声音/系统通知。

## 6. 文档差异清单（按需求影响与优先级）

> 结果：本次对齐发现 `app-requirements-spec` 与 `docs/api` 存在命名/方法漂移；已按 `docs/api` 更新文档映射并保留 REQ 编号不变。

| 差异接口/事件 | 01/02文档状态（缺失/命名不一致） | 影响需求ID | 最高优先级 | 建议补齐内容 | 证据 |
|---|---|---|---|---|---|
| `PATCH /session/{sessionID}`（会话更新） | 01 文档会话更新方法为 `PATCH` | REQ-APP-024, REQ-APP-034 | P2 | 将需求文档中的会话更新语义统一到 `PATCH` | `/Users/zy/Code/opencode/opencode/docs/api/01-rest-reference.md:210` |
| `PUT /pty/{ptyID}`（终端更新） | 01 文档 PTY 更新方法为 `PUT` | REQ-APP-020 | P1 | 将终端 update 映射统一到 `PUT` | `/Users/zy/Code/opencode/opencode/docs/api/01-rest-reference.md:809` |
| `PUT /auth/{providerID}`（Provider Key 设置） | 01 文档 auth 设置方法为 `PUT` | REQ-APP-027 | P2 | 将 provider key 设置映射统一到 `PUT` | `/Users/zy/Code/opencode/opencode/docs/api/01-rest-reference.md:1480` |
| `message.part.delta` | 02/SSE 文档已定义增量事件 | REQ-APP-002, REQ-APP-003, REQ-APP-005 | P0 | 在消息流需求映射中补齐 `message.part.delta` | `/Users/zy/Code/opencode/opencode/docs/api/02-sse-reference.md:84` |

补充说明（SSE 文档组织）：
- `docs/api/02-sse-reference.md` 主要定义 SSE 端点与协议；事件枚举与字段在 `docs/api/sse/*`。
- 本文中事件映射均可在 `docs/api/sse/00-event-catalog.md` 对齐。
- `workspace.ready/workspace.failed` 与 `worktree.ready/worktree.failed` 在 SSE 文档中均有定义；`packages/app` 当前消费与映射保持 `worktree.*`。

## 7. 证据索引（关键文件）

- `packages/app` 事件订阅与分发：
  - `/Users/zy/Code/opencode/opencode/packages/app/src/context/global-sdk.tsx:71`
  - `/Users/zy/Code/opencode/opencode/packages/app/src/context/global-sync.tsx:247`
  - `/Users/zy/Code/opencode/opencode/packages/app/src/context/global-sync/event-reducer.ts:82`
- 会话主链路：
  - `/Users/zy/Code/opencode/opencode/packages/app/src/components/prompt-input/submit.ts:145`
  - `/Users/zy/Code/opencode/opencode/packages/app/src/context/sync.tsx:88`
  - `/Users/zy/Code/opencode/opencode/packages/app/src/pages/session/use-session-commands.tsx:275`
- 权限/问题：
  - `/Users/zy/Code/opencode/opencode/packages/app/src/context/permission.tsx:117`
  - `/Users/zy/Code/opencode/opencode/packages/app/src/components/question-dock.tsx:41`
- 文件/LSP：
  - `/Users/zy/Code/opencode/opencode/packages/app/src/context/file.tsx:67`
  - `/Users/zy/Code/opencode/opencode/packages/app/src/context/file/watcher.ts:18`
- 终端/工作区：
  - `/Users/zy/Code/opencode/opencode/packages/app/src/context/terminal.tsx:59`
  - `/Users/zy/Code/opencode/opencode/packages/app/src/pages/layout.tsx:1555`
  - `/Users/zy/Code/opencode/opencode/packages/app/src/pages/layout.tsx:1199`
- Provider/MCP/通知：
  - `/Users/zy/Code/opencode/opencode/packages/app/src/components/dialog-connect-provider.tsx:85`
  - `/Users/zy/Code/opencode/opencode/packages/app/src/components/dialog-select-mcp.tsx:21`
  - `/Users/zy/Code/opencode/opencode/packages/app/src/context/notification.tsx:87`
