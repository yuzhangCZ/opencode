# 插件加载与版本策略说明（`packages/opencode`）/ Plugin Loading & Versioning Notes

本文总结项目级 `opencode.json` 的 `plugin`（npm 包）与 `.opencode/plugins`（本地文件）在运行时的加载、安装、缓存与优先级行为。

## 1. npm 插件何时下载到本地

1. 在实例启动引导阶段，会先执行 `Plugin.init()`。
2. `Plugin.init()` 内部会读取配置并加载插件；对于 npm 插件，会调用 `BunProc.install(pkg, version)`。
3. 因此 npm 插件安装发生在启动链路中，而不是后台异步延后。

## 2. 下载版本如何决定

1. 若配置为 `plugin: ["foo@1.2.3"]`，安装目标版本是 `1.2.3`。
2. 若配置为 `plugin: ["foo"]`，内部默认版本为 `latest`。
3. 安装前会检查 cache：
   - 固定版本：若缓存版本一致，直接复用。
   - `latest`：会对比 registry 的当前版本与缓存版本，落后才安装。
4. `latest` 首次安装后，会把实际解析到的版本写回 cache 的 `package.json` 依赖记录，后续按缓存版本参与比对。

## 3. “缓存未过期”具体含义

`latest` 模式下，“缓存未过期”指：缓存版本与 registry 最新版本比较后，不需要升级（已是最新或满足比较规则）。此时不会重复安装。

如果 registry 查询失败，则回退到继续使用缓存版本。

## 4. 能否实现“始终最新”

1. 可以实现“启动时检查更新，若有新版本则升级”：
   - 配置不写版本（或写 `@latest`）。
2. 不能保证“每次启动都强制重装最新”：
   - 现有逻辑是“有更新才装，无更新复用缓存”。

## 5. 下载耗时是否影响启动

会影响。插件初始化在启动流程上是等待完成的；首次下载或升级时会拉长启动时间，缓存命中时影响较小。

## 6. 内置版本 + 配置 `@latest` 的行为边界

若“内置”指把插件打进主程序依赖，当前通用 npm 插件路径不会优先从该内置依赖加载；对 `plugin` 数组中的 npm 项，仍会走 cache 安装/更新逻辑。

因此，现状不等价于“内置优先，线上有新再下载”的通用策略（除非改 runtime）。

## 7. 同名本地插件 vs npm 插件，谁优先

同名时，本地 `.opencode/plugins` 插件优先于 `opencode.json` 里的同名 npm 插件。

原因：
1. 去重按“规范化后的插件名”进行。
2. 优先保留高优先级来源（项目 `plugins` 目录在后，覆盖前面的同名配置项）。

## 8. `plugins` 目录是否支持子目录作为入口

当前自动扫描规则是 `plugins/*.{ts,js}`（单层）。  
结论：
1. 支持：根目录入口文件（如 `plugins/foo.ts`）。
2. 不支持：把目录本身当入口（如 `plugins/foo/index.ts` 自动发现）。

## 9. 多文件插件的推荐内置方式

采用“单入口 + 子目录模块”的组织：

```text
.opencode/
  plugins/
    my-plugin.ts
    my-plugin/
      core.ts
      hook.ts
      util.ts
```

说明：
1. `my-plugin.ts` 作为被自动扫描的入口文件。
2. 入口中 `import "./my-plugin/*"` 组织多文件逻辑。
3. 若依赖第三方包，在 `.opencode/package.json` 声明依赖，启动时会执行安装。

## 10. 企业内网如何安装公司私有 npm（二方件）插件

结论：可行，核心是让 OpenCode 的 Bun 安装流程读取到企业 registry 配置与凭证。

实现要点：
1. OpenCode 安装 npm 插件时不显式传 `--registry`，而是依赖 Bun 的默认 registry 解析（含 `.npmrc`）。
2. 因此只要运行 OpenCode 的用户环境里有正确 `.npmrc` 与 token，`plugin` 数组中的私有包即可从企业源下载。

建议配置（示例）：

```bash
# ~/.npmrc
registry=https://npm.company.com/repository/npm/
//npm.company.com/repository/npm/:_authToken=${NPM_AUTH_TOKEN}
always-auth=true

@your-scope:registry=https://npm.company.com/repository/npm-private/
```

运行要求：
1. 启动 OpenCode 的进程环境必须包含 `NPM_AUTH_TOKEN`（终端、Desktop 启动器、CI 均需覆盖）。
2. 企业镜像需包含运行期可能拉取的包（不止业务插件）。
3. 默认还会加载一个内置 npm 插件 `opencode-anthropic-auth@0.0.13`；若企业源无该包，可镜像该包或设置 `OPENCODE_DISABLE_DEFAULT_PLUGINS=1`。

### 10.1 默认内置插件注意事项（重点）

1. OpenCode 启动时会自动注入默认插件 `opencode-anthropic-auth@0.0.13` 到插件加载列表。
2. 在企业内网仅允许私有 registry 的场景下，若该包未被镜像到企业源，启动阶段可能出现该插件安装失败报错。
3. 处理方式二选一：
   - 在企业私有 registry 镜像该包。
   - 设置 `OPENCODE_DISABLE_DEFAULT_PLUGINS=1` 禁用默认插件注入。
4. 不镜像且不禁用时，通常表现为默认插件加载失败；其他插件按各自可用性继续加载。
