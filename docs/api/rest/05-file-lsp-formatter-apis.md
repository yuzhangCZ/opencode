# File / LSP / Formatter 接口

## 1. 分类说明

本页覆盖文件搜索、目录读取、文件内容读取，以及 LSP / formatter 状态接口。

- 默认稳定性：`Stable`
- 备注：`GET /find/symbol` 当前实现返回空数组，即使 OpenAPI 定义了 `Symbol[]`

## 2. 接口列表

| Method | Path | 说明 |
| --- | --- | --- |
| `GET` | `/find` | 文本搜索 |
| `GET` | `/find/file` | 文件名搜索 |
| `GET` | `/find/symbol` | 符号搜索 |
| `GET` | `/file` | 列目录 |
| `GET` | `/file/content` | 读文件 |
| `GET` | `/file/status` | 文件状态 |
| `GET` | `/lsp` | LSP 状态 |
| `GET` | `/formatter` | formatter 状态 |

## 3. 接口详情

### `GET /find`

- 用途：使用 ripgrep 搜索文本。

**Query 参数**

| 名称 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `pattern` | `string` | 是 | 搜索内容 |

**response JSON**

```json
[
  {
    "path": "src/index.ts",
    "line": 12,
    "column": 5,
    "text": "const server = createServer()"
  }
]
```

**curl**

```bash
curl -s 'http://localhost:4096/find?directory=%2Fabs%2Frepo&pattern=createServer'
```

### `GET /find/file`

- 用途：按文件名或目录名搜索。

**Query 参数**

| 名称 | 类型 | 说明 |
| --- | --- | --- |
| `query` | `string` | 搜索关键词 |
| `dirs` | `"true" \| "false"` | 是否包含目录 |
| `type` | `file \| directory` | 限定类型 |
| `limit` | `number` | 结果数上限，最大 `200` |

**response JSON**

```json
[
  "docs/api/01-rest-reference.md",
  "docs/api/rest/03-session-apis.md"
]
```

**curl**

```bash
curl -s 'http://localhost:4096/find/file?directory=%2Fabs%2Frepo&query=rest&limit=10'
```

### `GET /find/symbol`

- 用途：搜索工作区符号。

**备注**

当前实现直接返回 `[]`，尚未真正接入 LSP workspace symbol 查询。

**curl**

```bash
curl -s 'http://localhost:4096/find/symbol?directory=%2Fabs%2Frepo&query=Server'
```

### `GET /file`

- 用途：列出目录内容。

**Query 参数**

| 名称 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `path` | `string` | 是 | 目录相对路径或绝对路径 |

**响应体**

数组元素字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `name` | `string` | 名称 |
| `path` | `string` | 相对路径 |
| `absolute` | `string` | 绝对路径 |
| `type` | `file \| directory` | 节点类型 |
| `ignored` | `boolean` | 是否被忽略 |

**response JSON**

```json
[
  {
    "name": "docs",
    "path": "docs",
    "absolute": "/Users/zy/Code/opencode/opencode/docs",
    "type": "directory",
    "ignored": false
  }
]
```

**curl**

```bash
curl -s 'http://localhost:4096/file?directory=%2Fabs%2Frepo&path=docs'
```

### `GET /file/content`

- 用途：读取单个文件。

**Query 参数**

`path: string`

**响应体**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `type` | `text \| binary` | 内容类型 |
| `content` | `string` | 文本内容或 base64 内容 |
| `diff` | `string` | 可选 unified diff |
| `patch` | `object` | 可选结构化 patch |
| `encoding` | `"base64"` | 二进制场景 |
| `mimeType` | `string` | MIME 类型 |

**response JSON**

```json
{
  "type": "text",
  "content": "# OpenCode Server REST 参考\n"
}
```

**curl**

```bash
curl -s 'http://localhost:4096/file/content?directory=%2Fabs%2Frepo&path=docs/api/01-rest-reference.md'
```

### `GET /file/status`

- 用途：返回当前 Git 文件状态。

**response JSON**

```json
[
  {
    "path": "docs/api/01-rest-reference.md",
    "added": 10,
    "removed": 2,
    "status": "modified"
  }
]
```

**curl**

```bash
curl -s 'http://localhost:4096/file/status?directory=%2Fabs%2Frepo'
```

### `GET /lsp`

- 用途：获取 LSP 状态。

**response JSON**

```json
[
  {
    "id": "tsserver",
    "name": "typescript-language-server",
    "root": "/Users/zy/Code/opencode/opencode",
    "status": "connected"
  }
]
```

### `GET /formatter`

- 用途：获取 formatter 状态。

**response JSON**

```json
[
  {
    "name": "prettier",
    "extensions": [".ts", ".tsx", ".md"],
    "enabled": true
  }
]
```
