# Project / Config / Provider 接口

## 1. 分类说明

本页覆盖：

- 项目管理：`/project/*`
- 当前实例配置：`/config*`
- Provider 枚举与认证：`/provider*`, `/auth/{providerID}`

默认稳定性：`Stable`

## 2. 接口列表

| Method | Path | 说明 |
| --- | --- | --- |
| `GET` | `/project` | 列出项目 |
| `GET` | `/project/current` | 获取当前项目 |
| `PATCH` | `/project/{projectID}` | 更新项目 |
| `GET` | `/config` | 获取实例配置 |
| `PATCH` | `/config` | 更新实例配置 |
| `GET` | `/config/providers` | 获取 provider 视图与默认模型 |
| `GET` | `/provider` | 列出 provider |
| `GET` | `/provider/auth` | 获取 provider 认证方式 |
| `POST` | `/provider/{providerID}/oauth/authorize` | 发起 OAuth |
| `POST` | `/provider/{providerID}/oauth/callback` | 提交 OAuth 回调 |
| `PUT` | `/auth/{providerID}` | 直接设置认证信息 |
| `DELETE` | `/auth/{providerID}` | 删除认证信息 |

## 3. 接口详情

### `GET /project`

- Stability: `Stable`
- 用途：列出所有已打开过的项目。

**响应体**

数组元素常见字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | `string` | 项目 ID |
| `worktree` | `string` | 仓库目录 |
| `vcs` | `"git"` | 当前固定为 git |
| `name` | `string` | 展示名称 |
| `icon` | `object` | 图标配置 |
| `commands` | `object` | 项目级命令 |
| `time` | `object` | 创建/更新时间 |
| `sandboxes` | `string[]` | worktree 列表 |

**response JSON**

```json
[
  {
    "id": "prj_123",
    "worktree": "/Users/zy/Code/opencode/opencode",
    "name": "opencode",
    "time": {
      "created": 1742340000000,
      "updated": 1742341000000
    },
    "sandboxes": []
  }
]
```

**curl**

```bash
curl -s http://localhost:4096/project
```

### `GET /project/current`

- Stability: `Stable`
- 用途：返回当前上下文对应的项目。

**curl**

```bash
curl -s 'http://localhost:4096/project/current?directory=%2Fabs%2Frepo'
```

### `PATCH /project/{projectID}`

- Stability: `Stable`
- 用途：更新项目展示信息和启动命令。

**Path 参数**

| 名称 | 类型 | 说明 |
| --- | --- | --- |
| `projectID` | `string` | 项目 ID |

**请求体**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `name` | `string` | 否 | 自定义名称 |
| `icon.url` | `string` | 否 | 图标地址 |
| `icon.override` | `string` | 否 | 覆盖图标 |
| `icon.color` | `string` | 否 | 颜色 |
| `commands.start` | `string` | 否 | 新建 workspace 时运行的启动命令 |

**request JSON**

```json
{
  "name": "OpenCode Dev",
  "commands": {
    "start": "bun dev"
  }
}
```

**response JSON**

```json
{
  "id": "prj_123",
  "name": "OpenCode Dev",
  "commands": {
    "start": "bun dev"
  },
  "worktree": "/Users/zy/Code/opencode/opencode",
  "time": {
    "created": 1742340000000,
    "updated": 1742342000000
  },
  "sandboxes": []
}
```

**curl**

```bash
curl -s -X PATCH 'http://localhost:4096/project/prj_123?directory=%2Fabs%2Frepo' \
  -H 'content-type: application/json' \
  -d '{"name":"OpenCode Dev","commands":{"start":"bun dev"}}'
```

### `GET /config`

- Stability: `Stable`
- 用途：读取当前实例配置。

**备注**

返回结构同 `Config`。其覆盖面大于文档中的示例字段，调用方应按需读取。

**response JSON**

```json
{
  "$schema": "https://opencode.ai/config.json",
  "model": "openai/gpt-5.4",
  "share": "manual"
}
```

**curl**

```bash
curl -s 'http://localhost:4096/config?directory=%2Fabs%2Frepo'
```

### `PATCH /config`

- Stability: `Stable`
- 用途：更新当前实例配置。

**请求体**

同 `Config`。常见字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `model` | `string` | 默认模型 |
| `small_model` | `string` | 小模型 |
| `default_agent` | `string` | 默认 agent |
| `provider` | `object` | provider 配置 |
| `mcp` | `object` | mcp 配置 |

**request JSON**

```json
{
  "model": "openai/gpt-5.4",
  "default_agent": "build"
}
```

**curl**

```bash
curl -s -X PATCH 'http://localhost:4096/config?directory=%2Fabs%2Frepo' \
  -H 'content-type: application/json' \
  -d '{"model":"openai/gpt-5.4","default_agent":"build"}'
```

### `GET /config/providers`

- Stability: `Stable`
- 用途：返回配置过滤后的 provider 列表以及每个 provider 的默认模型。

**响应体**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `providers` | `Provider[]` | 当前可用 provider |
| `default` | `Record<string,string>` | provider 到默认 modelID 的映射 |

**response JSON**

```json
{
  "providers": [
    {
      "id": "openai",
      "name": "OpenAI",
      "source": "api",
      "env": [],
      "options": {},
      "models": {}
    }
  ],
  "default": {
    "openai": "gpt-5.4"
  }
}
```

**curl**

```bash
curl -s 'http://localhost:4096/config/providers?directory=%2Fabs%2Frepo'
```

### `GET /provider`

- Stability: `Stable`
- 用途：返回 provider 总视图，包括可用 provider、默认模型和已连接 provider。

**响应体**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `all` | `Provider[]` | 全部 provider |
| `default` | `Record<string,string>` | 默认模型映射 |
| `connected` | `string[]` | 已成功连接的 provider ID |

**response JSON**

```json
{
  "all": [
    {
      "id": "openai",
      "name": "OpenAI",
      "source": "api",
      "env": [],
      "options": {},
      "models": {}
    }
  ],
  "default": {
    "openai": "gpt-5.4"
  },
  "connected": ["openai"]
}
```

**curl**

```bash
curl -s 'http://localhost:4096/provider?directory=%2Fabs%2Frepo'
```

### `GET /provider/auth`

- Stability: `Stable`
- 用途：返回各 provider 支持的认证方式。

**response JSON**

```json
{
  "openai": [
    {
      "type": "api",
      "label": "API Key"
    }
  ]
}
```

**curl**

```bash
curl -s 'http://localhost:4096/provider/auth?directory=%2Fabs%2Frepo'
```

### `POST /provider/{providerID}/oauth/authorize`

- Stability: `Stable`
- 用途：根据认证方式索引发起 provider OAuth。

**Path 参数**

`providerID: string`

**请求体**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `method` | `number` | 是 | 认证方式数组索引 |

**response JSON**

```json
{
  "url": "https://provider.example/oauth/authorize",
  "method": "code",
  "instructions": "Open the URL and paste back the code."
}
```

**curl**

```bash
curl -s -X POST 'http://localhost:4096/provider/openai/oauth/authorize?directory=%2Fabs%2Frepo' \
  -H 'content-type: application/json' \
  -d '{"method":0}'
```

### `POST /provider/{providerID}/oauth/callback`

- Stability: `Stable`
- 用途：提交 OAuth 回调 code。

**请求体**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `method` | `number` | 是 | 认证方式索引 |
| `code` | `string` | 否 | OAuth code |

**response JSON**

```json
true
```

**curl**

```bash
curl -s -X POST 'http://localhost:4096/provider/openai/oauth/callback?directory=%2Fabs%2Frepo' \
  -H 'content-type: application/json' \
  -d '{"method":0,"code":"oauth-code"}'
```

### `PUT /auth/{providerID}`

- Stability: `Stable`
- 用途：直接写入 provider 认证信息，适合脚本场景。

**Path 参数**

`providerID: string`

**请求体**

`Auth` 为联合结构，常见三种：

| `type` | 关键字段 | 说明 |
| --- | --- | --- |
| `api` | `key` | API Key |
| `oauth` | `access`, `refresh`, `expires` | OAuth token |
| `wellknown` | `key`, `token` | 特定 provider 的预定义认证 |

**request JSON**

```json
{
  "type": "api",
  "key": "sk-example"
}
```

**response JSON**

```json
true
```

**curl**

```bash
curl -s -X PUT http://localhost:4096/auth/openai \
  -H 'content-type: application/json' \
  -d '{"type":"api","key":"sk-example"}'
```

### `DELETE /auth/{providerID}`

- Stability: `Stable`
- 用途：删除 provider 认证信息。

**response JSON**

```json
true
```

**curl**

```bash
curl -s -X DELETE http://localhost:4096/auth/openai
```
