# Provider / Auth / MCP API

## 1. `provider.list`

### What it does

列出 provider、默认映射和已连接 provider。

### Server mapping

- SDK method: `client.provider.list`
- `operationId`: `provider.list`
- HTTP: `GET /provider`

### Response example

```json
{
  "all": [
    {
      "id": "openai",
      "name": "OpenAI",
      "env": ["OPENAI_API_KEY"],
      "models": {}
    }
  ],
  "default": {
    "chat": "openai"
  },
  "connected": ["openai"]
}
```

## 2. `provider.auth`

### What it does

读取 provider 可用认证方式。

### Server mapping

- SDK method: `client.provider.auth`
- `operationId`: `provider.auth`
- HTTP: `GET /provider/auth`

### Response example

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

## 3. `provider.oauth.authorize`

### What it does

启动 provider OAuth 授权流程。

### Server mapping

- SDK method: `client.provider.oauth.authorize`
- `operationId`: `provider.oauth.authorize`
- HTTP: `POST /provider/{id}/oauth/authorize`

### Parameters

| 字段 | 位置 | 必填 | 说明 |
| --- | --- | --- | --- |
| `path.id` | path | 是 | provider ID |
| `body.method` | body | 是 | auth method 索引 |

### Request example

```json
{
  "path": {
    "id": "github"
  },
  "body": {
    "method": 0
  }
}
```

### Response example

```json
{
  "url": "https://example.com/oauth/start",
  "instructions": "Open the URL to continue",
  "method": "code"
}
```

## 4. `provider.oauth.callback`

### What it does

提交 OAuth 回调结果。

### Server mapping

- SDK method: `client.provider.oauth.callback`
- `operationId`: `provider.oauth.callback`
- HTTP: `POST /provider/{id}/oauth/callback`

### Request example

```json
{
  "path": {
    "id": "github"
  },
  "body": {
    "method": 0,
    "code": "oauth-code"
  }
}
```

### Response example

```json
true
```

### Errors / Pitfalls

- `body.method` 是认证方式索引，不是 provider ID。

## 5. `auth.set`

### What it does

直接写入认证凭据。

### Server mapping

- SDK method: `client.auth.set`
- `operationId`: `auth.set`
- HTTP: `PUT /auth/{id}`

### Parameters

| 字段 | 位置 | 必填 | 说明 |
| --- | --- | --- | --- |
| `path.id` | path | 是 | provider 或 auth ID |
| `body` | body | 否 | `Auth` 对象 |

### Request example

```json
{
  "path": {
    "id": "openai"
  },
  "body": {
    "type": "api",
    "key": "sk-demo"
  }
}
```

### Response example

```json
true
```

## 6. `mcp.*`

当前 v1 默认 client 可见的 MCP 主分组：

| SDK method | `operationId` | HTTP |
| --- | --- | --- |
| `client.mcp.status` | `mcp.status` | `GET /mcp` |
| `client.mcp.add` | `mcp.add` | `POST /mcp` |
| `client.mcp.connect` | `mcp.connect` | `POST /mcp/{name}/connect` |
| `client.mcp.disconnect` | `mcp.disconnect` | `POST /mcp/{name}/disconnect` |
| `client.mcp.auth.start` | `mcp.auth.start` | `POST /mcp/{name}/auth` |
| `client.mcp.auth.callback` | `mcp.auth.callback` | `POST /mcp/{name}/auth/callback` |
| `client.mcp.auth.authenticate` | `mcp.auth.authenticate` | `POST /mcp/{name}/auth/authenticate` |
| `client.mcp.auth.remove` | `mcp.auth.remove` | `DELETE /mcp/{name}/auth` |

### `mcp.connect` 请求示例

```json
{
  "path": {
    "name": "filesystem"
  }
}
```

### `mcp.status` 响应示例

```json
{
  "filesystem": {
    "connected": true
  }
}
```

### Errors / Pitfalls

- MCP auth 和 provider auth 是两套不同链路。
- `authenticate` 可能带浏览器副作用，不适合作为无 UI 插件的默认流程。

## 7. v2 Differences

v2 在这些区域的主要变化：

1. 参数由 `path/query/body` 转成扁平对象。
2. `workspace` 参数被纳入更多接口。
3. 权限与问题响应接口分组更完整。

## 8. Evidence

1. `packages/sdk/js/src/gen/sdk.gen.ts`
2. `packages/sdk/js/src/gen/types.gen.ts`
3. `packages/sdk/js/src/v2/gen/sdk.gen.ts`
4. `packages/opencode/src/server/routes/provider.ts`
5. `packages/opencode/src/server/routes/mcp.ts`
