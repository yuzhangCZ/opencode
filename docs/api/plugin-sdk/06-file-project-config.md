# File / Project / Config API

## 1. `find.*`

## 1.1 `find.text`

### What it does

按文本模式搜索文件内容。

### Server mapping

- SDK method: `client.find.text`
- `operationId`: `find.text`
- HTTP: `GET /find`

### Parameters

| 字段 | 位置 | 必填 | 说明 |
| --- | --- | --- | --- |
| `query.pattern` | query | 是 | 搜索模式 |
| `query.directory` | query | 否 | 搜索目录 |

### Response example

```json
[
  {
    "path": { "text": "src/index.ts" },
    "lines": { "text": "export const demo = true" },
    "line_number": 1,
    "absolute_offset": 0,
    "submatches": [
      {
        "match": { "text": "demo" },
        "start": 13,
        "end": 17
      }
    ]
  }
]
```

## 1.2 `find.files`

- SDK method: `client.find.files`
- `operationId`: `find.files`
- HTTP: `GET /find/file`

请求示例：

```json
{
  "query": {
    "query": "plugin",
    "dirs": "false"
  }
}
```

响应示例：

```json
[
  "packages/plugin/src/index.ts",
  "docs/api/plugin-sdk/02-plugin-contract.md"
]
```

## 1.3 `find.symbols`

- SDK method: `client.find.symbols`
- `operationId`: `find.symbols`
- HTTP: `GET /find/symbol`

### Errors / Pitfalls

- `find.files` 使用的是 `query.query` 字段名，不是 `pattern`。

## 2. `file.*`

## 2.1 `file.list`

- SDK method: `client.file.list`
- `operationId`: `file.list`
- HTTP: `GET /file`

请求示例：

```json
{
  "query": {
    "path": "."
  }
}
```

## 2.2 `file.read`

- SDK method: `client.file.read`
- `operationId`: `file.read`
- HTTP: `GET /file/content`

请求示例：

```json
{
  "query": {
    "path": "README.md"
  }
}
```

响应示例：

```json
{
  "type": "text",
  "content": "# OpenCode"
}
```

## 2.3 `file.status`

- SDK method: `client.file.status`
- `operationId`: `file.status`
- HTTP: `GET /file/status`

### Errors / Pitfalls

- `file.read` 读取的是逻辑文件接口，不等于直接从磁盘读原始 bytes。

## 3. `project.*`

当前 v1 默认 client 直接可见的 project 方法只有：

| SDK method | `operationId` | HTTP |
| --- | --- | --- |
| `client.project.list` | `project.list` | `GET /project` |
| `client.project.current` | `project.current` | `GET /project/current` |

### `project.current` 响应示例

以下为关键字段示例，不代表完整 `Project` 对象：

```json
{
  "id": "proj_demo",
  "worktree": "/repo",
  "name": "opencode",
  "time": {
    "created": 1742371200000,
    "updated": 1742371200000
  },
  "sandboxes": []
}
```

### v2 Differences

- server 已有 `project.update`
- v2 已有 `project.update(...)`
- 当前插件默认注入的 v1 client 没有同名分组方法

## 4. `config.*`

| SDK method | `operationId` | HTTP | 说明 |
| --- | --- | --- | --- |
| `client.config.get` | `config.get` | `GET /config` | 读当前配置 |
| `client.config.update` | `config.update` | `PATCH /config` | 更新配置 |
| `client.config.providers` | `config.providers` | `GET /config/providers` | 列出 provider 配置 |

### `config.update` 请求示例

```json
{
  "body": {
    "model": {}
  }
}
```

### Errors / Pitfalls

- 配置对象本身字段较多，文档中只展示最小示例，不代表字段全集。

## 5. 相关但不建议作为插件主入口的分组

当前 v1 client 还能看到：

- `client.path.get`
- `client.vcs.get`
- `client.instance.dispose`
- `client.command.list`
- `client.app.log`
- `client.app.agents`
- `client.pty.*`

这些能力真实存在，但不属于大多数插件的主链路，因此不在本页展开。

## 6. Evidence

1. `packages/sdk/js/src/gen/sdk.gen.ts`
2. `packages/sdk/js/src/gen/types.gen.ts`
3. `packages/sdk/js/src/v2/gen/sdk.gen.ts`
4. `packages/opencode/src/server/routes/file.ts`
5. `packages/opencode/src/server/routes/project.ts`
6. `packages/opencode/src/server/routes/config.ts`
