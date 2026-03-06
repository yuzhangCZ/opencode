# Agent 文档编写规范

本文档定义 Agent 修改文档时的约束规范。

## 一、格式要求

### 文件规范

- **格式**: MDX (Markdown + JSX)
- **配置**: Mintlify 平台 (`docs.json`)
- **路径**: 使用根相对路径 `/essentials/page`，禁用 `../page`

### 前置元数据 (Frontmatter)

```yaml
---
title: "清晰具体的标题"
description: "简洁描述，用于 SEO 和导航"
icon: "icon-name" # AI 工具文档可选
---
```

**必需字段**: `title`, `description`  
**可选字段**: `icon`

## 二、内容分类

| 类别     | 目录          | 用途                                            |
| -------- | ------------- | ----------------------------------------------- |
| 入门     | 根目录        | 用户引导 (`index`, `quickstart`, `development`) |
| AI 工具  | `ai-tools/`   | 编辑器配置 (Claude Code, Cursor, Windsurf)      |
| 核心功能 | `essentials/` | 文档功能说明 (markdown, code, navigation)       |
| 代码片段 | `snippets/`   | 可复用内容片段                                  |

## 三、写作规范

### 语言风格

- **人称**: 第二人称 ("你")
- **语态**: 主动语态
- **时态**: 现在时 (当前状态), 将来时 (预期结果)

### 结构规范

- **H2 (`##`)**: 主标题，自动生成目录锚点
- **H3 (`###`)**: 子标题
- **顺序**: 前置条件 → 操作步骤 → 预期结果

### 代码规范

- 所有代码块必须指定语言标签
- 示例代码必须经过测试验证
- 多语言示例使用 `<CodeGroup>`

## 四、组件使用

### 提示组件

```mdx
<Note>补充信息</Note>
<Tip>最佳实践建议</Tip>
<Warning>重要警告或破坏性变更</Warning>
<Info>中性背景信息</Info>
<Check>成功确认</Check>
```

### 布局组件

```mdx
<Card title="标题" icon="icon" href="/link">
  内容
</Card>
<CardGroup cols={2}>...</CardGroup>
<Columns cols={2}>...</Columns>
```

### 流程组件

```mdx
<Steps>
  <Step title="步骤标题">内容</Step>
</Steps>

<Tabs>
  <Tab title="标签名">内容</Tab>
</Tabs>

<AccordionGroup>
  <Accordion title="标题">内容</Accordion>
</AccordionGroup>
```

### API 文档

```mdx
<ParamField path="param" type="string" required>
  描述
</ParamField>
<ResponseField name="field" type="string">
  描述
</ResponseField>
<Expandable title="详情">...</Expandable>
```

## 五、禁止事项

| 类别     | 禁止行为                                             |
| -------- | ---------------------------------------------------- |
| **格式** | 省略前置元数据、省略代码语言标签、使用相对路径 `../` |
| **内容** | 包含未测试代码、重复内容、第一人称或被动语态         |
| **流程** | 跳过 pre-commit hooks、直接在 main 分支修改          |

## 六、分类规则

### 入门文档 (Getting Started)

- **重点**: 用户引导和价值交付
- **结构**: 清晰的分步说明
- **语气**: 鼓励性、欢迎式
- **组件**: Cards, AccordionGroup, Steps

### AI 工具文档 (ai-tools/)

- **重点**: 工具配置和集成
- **结构**: 前置条件 → 安装 → 配置 → 示例
- **语气**: 技术但易懂
- **组件**: Code blocks, Tips, Notes

### 核心功能 (essentials/)

- **重点**: 文档功能和最佳实践
- **结构**: 概念说明 → 语法示例 → 高级用法
- **语气**: 教育性、全面性
- **组件**: 表格、CodeGroup

## 七、验证清单

### 修改前

- [ ] 查阅同类页面确认现有规范
- [ ] 检查 `docs.json` 了解导航要求
- [ ] 确认组件使用模式

### 修改中

- [ ] 代码示例可执行且已测试
- [ ] 内部链接使用根相对路径
- [ ] 标题层级符合 H2/H3 规范
- [ ] 前置元数据完整

### 修改后

- [ ] 运行 `mint dev` 预览
- [ ] 验证导航正常工作
- [ ] 确认组件渲染正确
- [ ] 代码块语法高亮正常

## 八、扩展建议 (行业最佳实践)

### 建议新增分类

1. **Agent 能力文档**
   - 可用工具目录
   - 能力矩阵
   - 限制说明

2. **会话管理**
   - 上下文窗口限制
   - 会话持久化
   - 内存管理策略

3. **安全约束**
   - 操作边界
   - 安全控制
   - 审计日志

4. **版本变更**
   - 版本策略
   - 迁移指南
   - 弃用政策

5. **Agent 编程指南**
   - 架构概览
   - 最佳实践
   - 反模式
   - 调试指南

---

**约束等级**: MUST (必须) / SHOULD (建议) / MUST NOT (禁止)  
**最后更新**: 2026-03-06
